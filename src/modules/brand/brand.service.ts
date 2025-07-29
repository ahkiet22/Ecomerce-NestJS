import { Injectable } from '@nestjs/common'
import { PaginationQueryType } from 'src/common/models/request.model'
import { BrandRepo } from './brand.repository'
import { NotFoundRecordException } from 'src/common/error'
import { CreateBrandBodyType, UpdateBrandBodyType } from './brand.schema'
import { isNotFoundPrismaError } from 'src/common/helpers/prisma-error'
import { I18nContext } from 'nestjs-i18n'

@Injectable()
export class BrandService {
  constructor(private brandRepo: BrandRepo) {}

  async list(pagination: PaginationQueryType) {
    const data = await this.brandRepo.list(pagination, I18nContext.current()?.lang as string)
    return data
  }

  async findById(id: number) {
    const brand = await this.brandRepo.findById(id, I18nContext.current()?.lang as string)
    if (!brand) {
      throw NotFoundRecordException
    }
    return brand
  }

  create({ data, createdById }: { data: CreateBrandBodyType; createdById: number }) {
    return this.brandRepo.create({
      createdById,
      data,
    })
  }

  async update({ id, data, updatedById }: { id: number; data: UpdateBrandBodyType; updatedById: number }) {
    try {
      const brand = await this.brandRepo.update({
        id,
        updatedById,
        data,
      })
      return brand
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }) {
    try {
      await this.brandRepo.delete({
        id,
        deletedById,
      })
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
}
