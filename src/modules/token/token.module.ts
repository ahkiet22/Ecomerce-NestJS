import { Global, Module } from '@nestjs/common'
import { TokenService } from './token.service'
import { JwtModule } from '@nestjs/jwt'

@Global()
@Module({
  providers: [TokenService],
  imports: [JwtModule],
  exports: [TokenService],
})
export class TokenModule {}
