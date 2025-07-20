import { createZodDto } from "nestjs-zod";
import { ForgotPasswordBodySchema } from "../schema/auth.shema";

export class ForgotPasswordBodyDto extends createZodDto(ForgotPasswordBodySchema) {}