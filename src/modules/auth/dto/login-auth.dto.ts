import { createZodDto } from "nestjs-zod";
import { LoginBodySchema, LoginResSchema } from "../schema/auth.shema";

export class LoginBodyDto extends createZodDto(LoginBodySchema) {}

export class LoginResDto extends createZodDto(LoginResSchema) {}