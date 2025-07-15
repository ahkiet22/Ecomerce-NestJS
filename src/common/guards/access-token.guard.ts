import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { REQUEST_USER_KEY } from '../constants/auth.constant'
import { TokenService } from 'src/modules/token/token.service'

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const asccessToken = request.headers.authorization?.split(' ')[1]
    if (!asccessToken) {
      throw new UnauthorizedException()
    }
    try {
      const decodedAccessToken = await this.tokenService.verifyAccessToken(asccessToken)
      const { exp } = decodedAccessToken
      if (Date.now() > exp * 1000) {
        throw new UnauthorizedException('Token has expired')
      }
      request[REQUEST_USER_KEY] = decodedAccessToken
      return true
    } catch (error) {
      console.log(error)
      throw new UnauthorizedException()
    }
  }
}
