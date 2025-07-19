import { createZodDto } from "nestjs-zod";
import { MessageResSchema } from "../models/response.model";

export class MessageResDto extends createZodDto(MessageResSchema) {}
