import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common'
import { HashService } from '../../libs/crypto/hash.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/common/helpers/prisma-error'
import { TokenService } from '../token/token.service'
import { RolesService } from './roles.service'
import { RegisterBodyDto } from './dto/register-auth.dto'
import { LoginBodyType, RefreshTokenBodyType, RegisterBodyType, SendOTPBodyType } from './schema/auth.shema'
import { AuthRepository } from './auth.repository'
import { CommonUserRepository } from 'src/common/repositories/common-user.repository'
import { generateOTP } from 'src/common/helpers/generate-otp'
import { addMilliseconds } from 'date-fns'
import ms from 'ms'
import envConfig from 'src/configs/validation'
import { TypeOfVerificationCodeType } from 'src/common/constants/auth.constant'
import { EmailService } from 'src/libs/email/email.service'
import { AccessTokenPayloadCreate } from 'src/types/jwt'

@Injectable()
export class AuthService {
  constructor(
    private readonly hashService: HashService,
    private readonly prismaService: PrismaService,
    private readonly tokenService: TokenService,
    private readonly rolesService: RolesService,
    private readonly authRepository: AuthRepository,
    private readonly commonUserRepository: CommonUserRepository,
    private readonly emailService: EmailService,
  ) {}
  async register(body: RegisterBodyType) {
    try {
      const verificationCode = await this.authRepository.findUniqueVerificationCode({
        email: body.email,
        code: body.code,
        type: TypeOfVerificationCodeType.REGISTER,
      })
      if (!verificationCode) {
        throw new UnprocessableEntityException([
          {
            path: 'code',
            message: 'Invalid OTP code',
          },
        ])
      }

      if (verificationCode.expiresAt < new Date()) {
        throw new UnprocessableEntityException([
          {
            path: 'code',
            message: 'OTP code has expired',
          },
        ])
      }
      const clientRoleId = await this.rolesService.getClientRoleId()
      const hasPassword = await this.hashService.hash(body.password)
      return await this.authRepository.createUser({
        email: body.email,
        name: body.name,
        phoneNumber: body.phoneNumber,
        password: hasPassword,
        roleId: clientRoleId,
      })
    } catch (error) {
      console.log(error)
      if (isUniqueConstraintPrismaError(error)) {
        throw new BadRequestException([
          {
            path: 'email',
            message: 'Email already exists',
          },
        ])
      } else {
        console.log('auth errors', error)
        throw error
      }
    }
  }

  async sendOTP(body: SendOTPBodyType) {
    // 1. Kiểm tra email đã tồn tại trong db chưa
    const user = await this.commonUserRepository.findUnique({ email: body.email })
    if (user) {
      throw new BadRequestException([
        {
          path: 'email',
          message: 'Email already exists',
        },
      ])
    }
    // 2. Tạo mã OTP
    const code = generateOTP()
    const verifycationCode = this.authRepository.createVerificationCode({
      email: body.email,
      code,
      type: body.type,
      expiresAt: addMilliseconds(new Date(), ms(envConfig.OTP_EXPIRES_IN)),
    })
    // 3. Gửi mã OTP
    const { error } = await this.emailService.sendOTP({
      email: body.email,
      code,
    })
    if (error) {
      console.error('Error sending OTP:', error)
      throw new UnprocessableEntityException([
        {
          path: 'code',
          message: 'OTP code sending failed',
        },
      ])
    }
    return verifycationCode
  }

  async login(body: LoginBodyType & { userAgent: string; ip: string }) {
    try {
      const user = await this.authRepository.findUniqueUserIncludeRole({ email: body.email })
      if (!user) {
        throw new NotFoundException([
          {
            path: 'email',
            message: 'Account does not exists',
          },
        ]) // Email is not registered.
      }

      const isPasswordMatch = await this.hashService.compare(body.password, user.password)
      if (!isPasswordMatch) {
        throw new UnauthorizedException([
          {
            path: 'password',
            message: 'Incorrect password',
          },
        ])
      }
      const device = await this.authRepository.createDevice({
        userId: user.id,
        userAgent: body.userAgent,
        ip: body.ip,
      })
      const tokens = await this.generateTokens({
        userId: user.id,
        deviceId: device.id,
        roleId: user.roleId,
        roleName: user.role.name,
      })
      return tokens
    } catch (error) {
      // 1) Log nội bộ
      console.log('Login failed', error)

      // 2) Nếu đã là HttpException thì ném lại
      if (error instanceof HttpException) {
        throw error
      }
      // 3) Ngược lại ném InternalServerError
      throw new InternalServerErrorException()
    }
  }

  async generateTokens({ userId, deviceId, roleId, roleName }: AccessTokenPayloadCreate) {
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.signAccessToken({
        userId,
        deviceId,
        roleId,
        roleName,
      }),
      this.tokenService.signRefreshToken({ userId }),
    ])
    const decodedRefreshToken = await this.tokenService.verifyRefreshToken(refreshToken)
    await this.authRepository.createRRefreshToken({
      token: refreshToken,
      userId,
      expiresAt: new Date(decodedRefreshToken.exp * 1000),
      deviceId,
    })
    return { accessToken, refreshToken }
  }

  async refreshToken({ refreshToken, ip, userAgent }: RefreshTokenBodyType & { userAgent: string; ip: string }) {
    try {
      // 1.verify token
      const { userId } = await this.tokenService.verifyRefreshToken(refreshToken)

      // Sử dụng transaction để Tránh race-condition nếu cùng một token được refresh đồng thời (option) cacsh 2
      // 2. verify refreshToken already in database
      const refreshTokenInDb = await this.authRepository.findUniqueRefreshTokenIncludeUserRole({ token: refreshToken })
      if (!refreshTokenInDb) {
        throw new UnauthorizedException('Refresh token has been revoked')
      }
      const {
        deviceId,
        user: {
          roleId,
          role: { name: roleName },
        },
      } = refreshTokenInDb
      // 3. Update device
      const $updateDevice = this.authRepository.updateDevice(deviceId, {
        ip,
        userAgent,
      })
      // 4. Delete refreshToken old
      const $deleteRefreshToken = this.authRepository.deleteRefreshToken({ token: refreshToken })
      // 5. create new accessToken and refreshToken

      const $tokens = this.generateTokens({ userId, roleId, roleName, deviceId })
      const [, , tokens] = await Promise.all([$updateDevice, $deleteRefreshToken, $tokens])
      return tokens
    } catch (error) {
      console.log(error)

      if(error instanceof HttpException) {
        throw error
      }
      throw new UnauthorizedException()
    }
  }

  async logout(refreshToken: string) {
    try {
      // 2.  Delete refreshToken
      await this.prismaService.refreshToken.delete({
        where: {
          token: refreshToken,
        },
      })
      return { message: 'Logout successfully' }
    } catch (error) {
      console.log(error)

      if (isNotFoundPrismaError(error)) {
        throw new UnauthorizedException()
      }
      throw new UnauthorizedException()
    }
  }
}
