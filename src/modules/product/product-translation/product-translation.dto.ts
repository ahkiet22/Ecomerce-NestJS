import { createZodDto } from 'nestjs-zod'
import {
  CreateProductTranslationBodySchema,
  GetProductTranslationDetailResSchema,
  GetProductTranslationParamsSchema,
  UpdateProductTranslationBodySchema,
} from 'src/modules/product/product-translation/product-translation.schema'

export class GetProductTranslationDetailResDTO extends createZodDto(GetProductTranslationDetailResSchema) {}

export class GetProductTranslationParamsDTO extends createZodDto(GetProductTranslationParamsSchema) {}

export class CreateProductTranslationBodyDTO extends createZodDto(CreateProductTranslationBodySchema) {}

export class UpdateProductTranslationBodyDTO extends createZodDto(UpdateProductTranslationBodySchema) {}