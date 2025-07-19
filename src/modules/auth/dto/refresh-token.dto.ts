import { createZodDto } from "nestjs-zod";
import { RefreshTokenBodySchema, RefreshTokenResSchema } from "../schema/auth.shema";

export class RefreshTokenBodyDto extends createZodDto(RefreshTokenBodySchema) {}

export class RefreshTokenResDto extends createZodDto(RefreshTokenResSchema) {}