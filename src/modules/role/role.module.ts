import { Module } from '@nestjs/common'
import { RoleService } from './role.service'
import { RoleRepo } from './role.repository'
import { RoleController } from './role.controller'

@Module({
  providers: [RoleService, RoleRepo],
  controllers: [RoleController],
})
export class RoleModule {}
