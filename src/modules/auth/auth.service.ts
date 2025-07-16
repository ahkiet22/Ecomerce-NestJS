import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { HashService } from '../../libs/crypto/hash.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/common/helpers/prisma-error'
import { TokenService } from '../token/token.service'
import { RolesService } from './roles.service'
import { RegisterBodyDto } from './dto/register-auth.dto'

@Injectable()
export class AuthService {
  constructor(
    private readonly hashService: HashService,
    private readonly prismaService: PrismaService,
    private readonly tokenService: TokenService,
    private readonly rolesService: RolesService,
  ) {}
  async register(body: RegisterBodyDto) {
    try {
      const clientRoleId = await this.rolesService.getClientRoleId()
      const hasPassword = await this.hashService.hash(body.password)
      const user = await this.prismaService.user.create({
        data: {
          email: body.email,
          password: hasPassword,
          name: body.name,
          phoneNumber: body.phoneNumber,
          roleId: clientRoleId,
        },
        omit: {
          password: true,
          totpSecret: true,
        },
      })
      return user
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

  async login(body: any) {
    try {
      const user = await this.prismaService.user.findFirst({ where: { email: body.email } })
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
            field: 'password',
            errors: 'Incorrect password',
          },
        ])
      }

      const tokens = await this.generateTokens({ userId: user.id })
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

  async generateTokens(payload: { userId: number }) {
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.signAccessToken(payload),
      this.tokenService.signRefreshToken(payload),
    ])
    const decodedRefreshToken = await this.tokenService.verifyRefreshToken(refreshToken)
    await this.prismaService.refreshToken.create({
      data: {
        token: refreshToken,
        userId: payload.userId,
        expiresAt: new Date(decodedRefreshToken.exp * 1000),
        deviceId: 1,
      },
    })
    return { accessToken, refreshToken }
  }

  async refreshToken(refreshToken: string) {
    try {
      // 1.verify token
      const { userId, exp } = await this.tokenService.verifyRefreshToken(refreshToken)

      // Verify expired token
      if (Date.now() > exp * 1000) {
        await this.prismaService.refreshToken
          .delete({
            where: {
              token: refreshToken,
            },
          })
          .catch(() => null)
        throw new UnauthorizedException('Token has expired')
      }

      // Sử dụng transaction để Tránh race-condition nếu cùng một token được refresh đồng thời
      const tokens = await this.prismaService.$transaction(async (tx) => {
        // 2. verify refreshToken already in database
        await tx.refreshToken.findUniqueOrThrow({
          where: {
            token: refreshToken,
          },
        })

        // 3. Delete refreshToken old
        await tx.refreshToken.delete({
          where: {
            token: refreshToken,
          },
        })

        return true
      })
      // 4. create new accessToken and refreshToken
      if (tokens) {
        return this.generateTokens({ userId })
      }

      // 5. protect
      throw new UnauthorizedException()
    } catch (error) {
      console.log(error)

      if (isNotFoundPrismaError(error)) {
        throw new UnauthorizedException('Refresh token has been revoked')
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
