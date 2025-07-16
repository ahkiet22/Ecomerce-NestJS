import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { HashService } from 'src/libs/crypto/hash.service'
import { RolesService } from './roles.service';
@Module({
  providers: [AuthService, HashService, RolesService, RolesService],
  controllers: [AuthController],
})
export class AuthModule {}
