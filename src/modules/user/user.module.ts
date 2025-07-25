import { Module } from '@nestjs/common'
import { HashService } from 'src/libs/crypto/hash.service'
import { UserController } from 'src/modules/user/user.controller'
import { UserRepo } from 'src/modules/user/user.repository'
import { UserService } from 'src/modules/user/user.service'

@Module({
  providers: [UserService, UserRepo, HashService],
  controllers: [UserController],
})
export class UserModule {}
