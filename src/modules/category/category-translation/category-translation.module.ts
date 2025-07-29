import { Module } from '@nestjs/common'
import { CategoryTranslationController } from 'src/modules/category/category-translation/category-translation.controller'
import { CategoryTranslationRepo } from 'src/modules/category/category-translation/category-translation.repository'
import { CategoryTranslationService } from 'src/modules/category/category-translation/category-translation.service'

@Module({
  providers: [CategoryTranslationRepo, CategoryTranslationService],
  controllers: [CategoryTranslationController],
})
export class CategoryTranslationModule {}
