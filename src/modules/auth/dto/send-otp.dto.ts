import { createZodDto } from "nestjs-zod";
import { SendOTPBodySchema } from "../schema/auth.shema";

export class SendOTPBodyDto extends createZodDto(SendOTPBodySchema) {}