import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { UserSchema } from './auth.dto'

const RegisterBodySchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(6).max(100),
    name: z.string().min(1).max(100),
    confirmPassword: z.string().min(6).max(100),
    phoneNumber: z.string().min(10).max(15),
  })
  .strict()
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: 'custom',
        message: 'Password and confirm password must be same',
        path: ['confirmPassword'],
      })
    }
  })

// class is required for using DTO as a type
export class RegisterBodyDto extends createZodDto(RegisterBodySchema) {}

export const RegisterResponseSchema = z.object({
  data: UserSchema,
  statusCode: z.literal(201),
})

export class RegisterResponseDto extends createZodDto(UserSchema) {}
