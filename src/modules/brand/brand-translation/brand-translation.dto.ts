import { createZodDto } from 'nestjs-zod'
import {
  CreateBrandTranslationBodySchema,
  GetBrandTranslationDetailResSchema,
  GetBrandTranslationParamsSchema,
  UpdateBrandTranslationBodySchema,
} from 'src/modules/brand/brand-translation/brand-translation.schema'

export class GetBrandTranslationDetailResDTO extends createZodDto(GetBrandTranslationDetailResSchema) {}
export class GetBrandTranslationParamsDTO extends createZodDto(GetBrandTranslationParamsSchema) {}

export class CreateBrandTranslationBodyDTO extends createZodDto(CreateBrandTranslationBodySchema) {}

export class UpdateBrandTranslationBodyDTO extends createZodDto(UpdateBrandTranslationBodySchema) {}