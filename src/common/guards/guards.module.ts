// src/common/guards/guards.module.ts
import { Global, Module } from '@nestjs/common'
import { AccessTokenGuard } from './access-token.guard'
import { ApiKeyGuard } from './api-key.guard'
import { PaymentAPIKeyGuard } from './payment-api-key.guard'
@Module({
  providers: [AccessTokenGuard, PaymentAPIKeyGuard],
  exports: [AccessTokenGuard, ApiKeyGuard, PaymentAPIKeyGuard],
})
export class GuardsModule {}
