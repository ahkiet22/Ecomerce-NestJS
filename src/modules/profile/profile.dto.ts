
import { createZodDto } from 'nestjs-zod'

import { ChangePasswordBodySchema, UpdateMeBodySchema } from './profile.schema'

export class UpdateMeBodyDTO extends createZodDto(UpdateMeBodySchema) {}

export class ChangePasswordBodyDTO extends createZodDto(ChangePasswordBodySchema) {}
