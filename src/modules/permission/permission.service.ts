import { Inject, Injectable } from '@nestjs/common'
import { NotFoundRecordException } from 'src/common/error'
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/common/helpers/prisma-error'
import { PermissionRepo } from 'src/modules/permission/permission.repository'
import {
  CreatePermissionBodyType,
  GetPermissionsQueryType,
  UpdatePermissionBodyType,
} from 'src/modules/permission/permission.schema'
import { PermissionAlreadyExistsException } from './permission.error'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'

@Injectable()
export class PermissionService {
  constructor(
    private permissionRepo: PermissionRepo,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async list(pagination: GetPermissionsQueryType) {
    const data = await this.permissionRepo.list(pagination)
    return data
  }

  async findById(id: number) {
    const permission = await this.permissionRepo.findById(id)
    if (!permission) {
      throw NotFoundRecordException
    }
    return permission
  }

  async create({ data, createdById }: { data: CreatePermissionBodyType; createdById: number }) {
    try {
      return await this.permissionRepo.create({
        createdById,
        data,
      })
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw PermissionAlreadyExistsException
      }
      throw error
    }
  }

  async update({ id, data, updatedById }: { id: number; data: UpdatePermissionBodyType; updatedById: number }) {
    try {
      const permission = await this.permissionRepo.update({
        id,
        updatedById,
        data,
      })
      const { roles } = permission
      await this.deleteCachedRole(roles)
      return permission
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      if (isUniqueConstraintPrismaError(error)) {
        throw PermissionAlreadyExistsException
      }
      throw error
    }
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }) {
    try {
      const permission = await this.permissionRepo.delete({
        id,
        deletedById,
      })
      const { roles } = permission
      await this.deleteCachedRole(roles)
      return {
        message: 'Delete successfully',
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }
  
  deleteCachedRole(roles: { id: number }[]) {
    return Promise.all(
      roles.map((role) => {
        const cacheKey = `role:${role.id}`
        return this.cacheManager.del(cacheKey)
      }),
    )
  }
}
