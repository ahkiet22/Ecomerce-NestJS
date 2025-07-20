import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { HashService } from 'src/libs/crypto/hash.service'
import { RolesService } from './roles.service'
import { AuthRepository } from './auth.repository'
import { EmailService } from 'src/libs/email/email.service'
import { GoogleService } from './google.service'
@Module({
  providers: [AuthService, GoogleService, HashService, EmailService, RolesService, AuthRepository],
  controllers: [AuthController],
})
export class AuthModule {}
