import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import { ActiveUser } from 'src/common/decorators/active-user.decorator'
import { MessageResDto } from 'src/common/dtos/response.dto'
import {
  CreateCategoryTranslationBodyDTO,
  GetCategoryTranslationDetailResDTO,
  GetCategoryTranslationParamsDTO,
  UpdateCategoryTranslationBodyDTO,
} from 'src/modules/category/category-translation/category-translation.dto'
import { CategoryTranslationService } from 'src/modules/category/category-translation/category-translation.service'

@Controller('category-translations')
export class CategoryTranslationController {
  constructor(private readonly categoryTranslationService: CategoryTranslationService) {}

  @Get(':categoryTranslationId')
  @ZodSerializerDto(GetCategoryTranslationDetailResDTO)
  findById(@Param() params: GetCategoryTranslationParamsDTO) {
    return this.categoryTranslationService.findById(params.categoryTranslationId)
  }

  @Post()
  @ZodSerializerDto(GetCategoryTranslationDetailResDTO)
  create(@Body() body: CreateCategoryTranslationBodyDTO, @ActiveUser('userId') userId: number) {
    return this.categoryTranslationService.create({
      data: body,
      createdById: userId,
    })
  }

  @Put(':categoryTranslationId')
  @ZodSerializerDto(GetCategoryTranslationDetailResDTO)
  update(
    @Body() body: UpdateCategoryTranslationBodyDTO,
    @Param() params: GetCategoryTranslationParamsDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return this.categoryTranslationService.update({
      data: body,
      id: params.categoryTranslationId,
      updatedById: userId,
    })
  }

  @Delete(':categoryTranslationId')
  @ZodSerializerDto(MessageResDto)
  delete(@Param() params: GetCategoryTranslationParamsDTO, @ActiveUser('userId') userId: number) {
    return this.categoryTranslationService.delete({
      id: params.categoryTranslationId,
      deletedById: userId,
    })
  }
}
