import { Injectable } from '@nestjs/common'
import { BrandTranslationRepo } from 'src/modules/brand/brand-translation/brand-translation.repository'
import { BrandTranslationAlreadyExistsException } from 'src/modules/brand/brand-translation/brand-translation.error'
import {
  CreateBrandTranslationBodyType,
  UpdateBrandTranslationBodyType,
} from 'src/modules/brand/brand-translation/brand-translation.schema'
import { NotFoundRecordException } from 'src/common/error'
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/common/helpers/prisma-error'

@Injectable()
export class BrandTranslationService {
  constructor(private brandTranslationRepo: BrandTranslationRepo) {}

  async findById(id: number) {
    const brand = await this.brandTranslationRepo.findById(id)
    if (!brand) {
      throw NotFoundRecordException
    }
    return brand
  }

  async create({ data, createdById }: { data: CreateBrandTranslationBodyType; createdById: number }) {
    try {
      return await this.brandTranslationRepo.create({
        createdById,
        data,
      })
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw BrandTranslationAlreadyExistsException
      }
      throw error
    }
  }

  async update({ id, data, updatedById }: { id: number; data: UpdateBrandTranslationBodyType; updatedById: number }) {
    try {
      const brand = await this.brandTranslationRepo.update({
        id,
        updatedById,
        data,
      })
      return brand
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw BrandTranslationAlreadyExistsException
      }
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }) {
    try {
      await this.brandTranslationRepo.delete({
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
