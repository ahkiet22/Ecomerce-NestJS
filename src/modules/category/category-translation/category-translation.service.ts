import { Injectable } from '@nestjs/common'
import { NotFoundRecordException } from 'src/common/error'
import { CategoryTranslationRepo } from 'src/modules/category/category-translation/category-translation.repository'
import { CategoryTranslationAlreadyExistsException } from 'src/modules/category/category-translation/category-translation.error'
import {
  CreateCategoryTranslationBodyType,
  UpdateCategoryTranslationBodyType,
} from 'src/modules/category/category-translation/category-translation.schema'
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/common/helpers/prisma-error'

@Injectable()
export class CategoryTranslationService {
  constructor(private categoryTranslationRepo: CategoryTranslationRepo) {}

  async findById(id: number) {
    const category = await this.categoryTranslationRepo.findById(id)
    if (!category) {
      throw NotFoundRecordException
    }
    return category
  }

  async create({ data, createdById }: { data: CreateCategoryTranslationBodyType; createdById: number }) {
    try {
      return await this.categoryTranslationRepo.create({
        createdById,
        data,
      })
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw CategoryTranslationAlreadyExistsException
      }
      throw error
    }
  }

  async update({
    id,
    data,
    updatedById,
  }: {
    id: number
    data: UpdateCategoryTranslationBodyType
    updatedById: number
  }) {
    try {
      const category = await this.categoryTranslationRepo.update({
        id,
        updatedById,
        data,
      })
      return category
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw CategoryTranslationAlreadyExistsException
      }
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }) {
    try {
      await this.categoryTranslationRepo.delete({
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
