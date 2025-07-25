import { Module } from '@nestjs/common'
import { ProfileService } from './profile.service'
import { ProfileController } from './profile.controller'
import { HashService } from 'src/libs/crypto/hash.service'

@Module({
  controllers: [ProfileController],
  providers: [ProfileService, HashService],
  exports: [ProfileService],
})
export class ProfileModule {}
