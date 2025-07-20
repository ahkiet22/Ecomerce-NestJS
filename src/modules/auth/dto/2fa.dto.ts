import { createZodDto } from "nestjs-zod";
import { DisableTwoFactorBodySchema, TwoFactorSetupResSchema } from "../schema/auth.shema";

export class TwoFactorSetupResDTO extends createZodDto(TwoFactorSetupResSchema) {}

export class DisableTwoFactorBodyDTO extends createZodDto(DisableTwoFactorBodySchema) {}