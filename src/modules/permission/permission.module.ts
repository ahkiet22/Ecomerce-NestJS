import { Module } from '@nestjs/common'
import { PermissionController } from 'src/modules/permission/permission.controller'
import { PermissionRepo } from 'src/modules/permission/permission.repository'
import { PermissionService } from 'src/modules/permission/permission.service'

@Module({
  providers: [PermissionService, PermissionRepo],
  controllers: [PermissionController],
})
export class PermissionModule {}
