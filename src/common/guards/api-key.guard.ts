import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import envConfig from 'src/configs/validation'
import { TokenService } from 'src/modules/token/token.service'

const SECRET_KEY = envConfig.SECRET_API_KEY

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const xApiKey = request.headers['x-api-key']
    if (xApiKey !== envConfig.SECRET_API_KEY) {
      throw new UnauthorizedException()
    }
    return true
  }
}
