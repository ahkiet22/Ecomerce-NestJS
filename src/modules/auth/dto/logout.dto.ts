import { createZodDto } from "nestjs-zod";
import { LogoutBodySchema } from "../schema/auth.shema";

export class LogoutBodyDto extends createZodDto(LogoutBodySchema) {}