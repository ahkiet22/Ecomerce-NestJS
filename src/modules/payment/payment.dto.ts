import { createZodDto } from 'nestjs-zod'

import { WebhookPaymentBodySchema } from 'src/modules/payment/payment.schema'

export class WebhookPaymentBodyDTO extends createZodDto(WebhookPaymentBodySchema) {}
