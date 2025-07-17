import { createZodDto } from 'nestjs-zod'
import { RegisterBodySchema, RegisterResSchema } from '../schema/auth.shema'

// class is required for using DTO as a type
export class RegisterBodyDto extends createZodDto(RegisterBodySchema) {}

export class RegisterResDto extends createZodDto(RegisterResSchema) {}
