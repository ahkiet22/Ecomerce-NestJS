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
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/common/helpers/prisma-error'
import { TokenService } from '../token/token.service'
import {
  DisableTwoFactorBodyType,
  ForgotPasswordBodyType,
  LoginBodyType,
  LogoutBodytype,
  RefreshTokenBodyType,
  RegisterBodyType,
  SendOTPBodyType,
} from './schema/auth.shema'
import { AuthRepository } from './auth.repository'
import { CommonUserRepository } from 'src/common/repositories/common-user.repository'
import { generateOTP } from 'src/common/helpers/generate-otp'
import { addMilliseconds } from 'date-fns'
import ms from 'ms'
import envConfig from 'src/configs/validation'
import { TypeOfVerificationCode, TypeOfVerificationCodeType } from 'src/common/constants/auth.constant'
import { EmailService } from 'src/libs/email/email.service'
import { AccessTokenPayloadCreate } from 'src/types/jwt'
import {
  EmailAlreadyExistsException,
  EmailNotFoundException,
  FailedToSendOTPException,
  InvalidOTPException,
  InvalidTOTPAndCodeException,
  InvalidTOTPException,
  OTPExpiredException,
  RefreshTokenAlreadyUsedException,
  TOTPAlreadyEnabledException,
  TOTPNotEnabledException,
  UnauthorizedAccessException,
} from './auth.error'
import { TwoFactorService } from 'src/common/services/2fa.service'
import { RolesRepository } from 'src/common/repositories/roles.repository'
import { InvalidPasswordException } from 'src/common/error'

@Injectable()
export class AuthService {
  constructor(
    private readonly hashService: HashService,
    private readonly tokenService: TokenService,
    private readonly authRepository: AuthRepository,
    private readonly commonUserRepository: CommonUserRepository,
    private readonly rolesRepository: RolesRepository,
    private readonly emailService: EmailService,
    private readonly twoFactorService: TwoFactorService,
  ) {}

  async validateVerificationCode({
    email,
    code,
    type,
  }: {
    email: string
    code: string
    type: TypeOfVerificationCodeType
  }) {
    const vevificationCode = await this.authRepository.findUniqueVerificationCode({
      email_code_type: {
        email,
        code,
        type,
      },
    })
    if (!vevificationCode) {
      throw InvalidOTPException
    }
    if (vevificationCode.expiresAt < new Date()) {
      throw OTPExpiredException
    }
    return vevificationCode
  }

  async register(body: RegisterBodyType) {
    try {
      await this.validateVerificationCode({
        email: body.email,
        code: body.code,
        type: TypeOfVerificationCode.REGISTER,
      })
      const clientRoleId = await this.rolesRepository.getClientRoleId()
      const hashPassword = await this.hashService.hash(body.password)
      const [user] = await Promise.all([
        this.authRepository.createUser({
          email: body.email,
          name: body.name,
          phoneNumber: body.phoneNumber,
          password: hashPassword,
          roleId: clientRoleId,
        }),
        this.authRepository.deleteVerificationCode({
          email_code_type: {
            email: body.email,
            code: body.code,
            type: TypeOfVerificationCode.REGISTER,
          },
        }),
      ])
      return user
    } catch (error) {
      console.log(error)
      if (isUniqueConstraintPrismaError(error)) {
        throw EmailAlreadyExistsException
      } else {
        console.log('auth errors', error)
        throw error
      }
    }
  }

  async sendOTP(body: SendOTPBodyType) {
    // 1. Kiểm tra email đã tồn tại trong db chưa
    const user = await this.commonUserRepository.findUnique({ email: body.email })

    if (body.type === TypeOfVerificationCode.REGISTER && user) {
      throw EmailAlreadyExistsException
    }
    if (body.type === TypeOfVerificationCode.FORGOT_PASSWORD && !user) {
      throw EmailNotFoundException
    }
    // 2. Tạo mã OTP
    const code = generateOTP()
    await this.authRepository.createVerificationCode({
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
      throw FailedToSendOTPException
    }
    return {
      message: 'The OTP code has been sent successfully',
    }
  }

  async login(body: LoginBodyType & { userAgent: string; ip: string }) {
    try {
      // 1. Lấy thông tin user, kiểm tra user có tồn tại hay không, mật khẩu có đúng không
      const user = await this.authRepository.findUniqueUserIncludeRole({ email: body.email })
      if (!user) {
        throw EmailNotFoundException // Email is not registered.
      }

      const isPasswordMatch = await this.hashService.compare(body.password, user.password)
      if (!isPasswordMatch) {
        throw InvalidPasswordException
      }

      // 2. Nếu user đã bật mã 2FA thì kiểm tra mã 2FA TOTP Code hoặc OTP Code (email)
      if (user.totpSecret) {
        // Log error if totpCode or code empty
        if (!body.totpCode && !body.code) {
          throw InvalidTOTPAndCodeException
        }

        // Kiểm tra TOTP Code có hợp lệ hay không
        if (body.totpCode) {
          const isValid = this.twoFactorService.verifyTOTP({
            email: user.email,
            secret: user.totpSecret,
            token: body.totpCode,
          })
          if (!isValid) {
            throw InvalidTOTPException
          }
        } else if (body.code) {
          // Kiểm tra mã OTP có hợp lệ không
          await this.validateVerificationCode({
            email: user.email,
            code: body.code,
            type: TypeOfVerificationCode.LOGIN,
          })
        }
      }

      // 3. Create new device
      const device = await this.authRepository.createDevice({
        userId: user.id,
        userAgent: body.userAgent,
        ip: body.ip,
      })

      // 4. create new accessToken and refreshToken
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
        throw RefreshTokenAlreadyUsedException
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

      if (error instanceof HttpException) {
        throw error
      }
      throw UnauthorizedAccessException
    }
  }

  async logout({ refreshToken }: LogoutBodytype) {
    try {
      // 1. check refreshTken
      await this.tokenService.verifyRefreshToken(refreshToken)
      // 2.  Delete refreshToken
      const deleteRefreshToken = await this.authRepository.deleteRefreshToken({ token: refreshToken })
      // 3. update device (isActive=false)
      await this.authRepository.updateDevice(deleteRefreshToken.deviceId, { isActive: false })
      return { message: 'Logout successfully' }
    } catch (error) {
      console.log(error)

      if (isNotFoundPrismaError(error)) {
        throw RefreshTokenAlreadyUsedException
      }
      throw UnauthorizedAccessException
    }
  }

  async forgotPassword(body: ForgotPasswordBodyType) {
    const { email, code, newPassword } = body
    // 1. Kiểm tra email đã tồn tại trong database chưa
    const user = await this.commonUserRepository.findUnique({
      email,
    })
    if (!user) {
      throw EmailNotFoundException
    }
    //2. Kiểm tra mã OTP có hợp lệ không
    await this.validateVerificationCode({
      email,
      code,
      type: TypeOfVerificationCode.FORGOT_PASSWORD,
    })
    //3. Cập nhật lại mật khẩu mới và xóa đi OTP
    const hashedPassword = await this.hashService.hash(newPassword)
    await Promise.all([
      this.commonUserRepository.update(
        { id: user.id },
        {
          password: hashedPassword,
          updatedById: user.id,
        },
      ),
      this.authRepository.deleteVerificationCode({
        email_code_type: {
          email: body.email,
          code: body.code,
          type: TypeOfVerificationCode.FORGOT_PASSWORD,
        },
      }),
    ])
    return {
      message: 'Password changed successfully',
    }
  }

  async setupTwoFactorAuth(userId: number) {
    // 1. Lấy thông tin user, kiểm tra xem user có tồn tại hay không, và xem họ đã bật 2FA chưa
    const user = await this.commonUserRepository.findUnique({
      id: userId,
    })
    if (!user) {
      throw EmailNotFoundException
    }
    // Xem họ đã bật 2FA chưa
    if (user.totpSecret) {
      throw TOTPAlreadyEnabledException
    }
    // 2. Tạo ra secret và uri
    const { secret, uri } = this.twoFactorService.generateTOTPSecret(user.email)
    // 3. Cập nhật secret vào user trong database
    await this.commonUserRepository.update({ id: userId }, { totpSecret: secret, updatedById: userId })
    // 4. Trả về secret và uri
    return {
      secret,
      uri,
    }
  }

  async disableTwoFactorAuth(data: DisableTwoFactorBodyType & { userId: number }) {
    const { userId, totpCode, code } = data
    // 1. Lấy thông tin user, kiểm tra xem user có tồn tại hay không, và xem họ đã bật 2FA chưa
    const user = await this.commonUserRepository.findUnique({ id: userId })
    if (!user) {
      throw EmailNotFoundException
    }
    if (!user.totpSecret) {
      throw TOTPNotEnabledException
    }

    // 2. Kiểm tra mã TOTP có hợp lệ hay không
    if (totpCode) {
      const isValid = this.twoFactorService.verifyTOTP({
        email: user.email,
        secret: user.totpSecret,
        token: totpCode,
      })
      if (!isValid) {
        throw InvalidTOTPException
      }
    } else if (code) {
      // 3. Kiểm tra mã OTP email có hợp lệ hay không
      await this.validateVerificationCode({
        email: user.email,
        code,
        type: TypeOfVerificationCode.DISABLE_2FA,
      })
    }

    // 4. Cập nhật secret thành null
    await this.commonUserRepository.update({ id: userId }, { totpSecret: null, updatedById: userId })

    // 5. Trả về thông báo
    return {
      message: 'Disable 2FA successfully',
    }
  }
}
