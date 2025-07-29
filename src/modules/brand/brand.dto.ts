import { createZodDto } from 'nestjs-zod'
import {
  CreateBrandBodySchema,
  GetBrandDetailResSchema,
  GetBrandParamsSchema,
  GetBrandsResSchema,
  UpdateBrandBodySchema,
} from 'src/modules/brand/brand.schema'

export class GetBrandsResDTO extends createZodDto(GetBrandsResSchema) {}

export class GetBrandParamsDTO extends createZodDto(GetBrandParamsSchema) {}

export class GetBrandDetailResDTO extends createZodDto(GetBrandDetailResSchema) {}

export class CreateBrandBodyDTO extends createZodDto(CreateBrandBodySchema) {}

export class UpdateBrandBodyDTO extends createZodDto(UpdateBrandBodySchema) {}
