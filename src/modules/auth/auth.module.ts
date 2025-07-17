import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { HashService } from 'src/libs/crypto/hash.service'
import { RolesService } from './roles.service'
import { AuthRepository } from './auth.repository'
@Module({
  providers: [AuthService, HashService, RolesService, AuthRepository],
  controllers: [AuthController],
})
export class AuthModule {}
