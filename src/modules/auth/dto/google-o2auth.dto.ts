import { createZodDto } from 'nestjs-zod'
import { GetAuthorizationUrlResSchema } from '../schema/auth.shema'

export class GetAuthorizationUrlResDto extends createZodDto(GetAuthorizationUrlResSchema) {}
