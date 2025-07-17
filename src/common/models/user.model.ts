import { UserStatus } from '@prisma/client'
import { z } from 'zod'

export const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  name: z.string().min(1).max(100),
  phoneNumber: z.string().min(10).max(15),
  avatar: z.string().nullable(),
  totpSecret: z.string().nullable(),
  status: z.nativeEnum(UserStatus),
  roleId: z.number().positive(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type UserType = z.infer<typeof UserSchema>
