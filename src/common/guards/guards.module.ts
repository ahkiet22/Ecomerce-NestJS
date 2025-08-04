// src/common/guards/guards.module.ts
import { Global, Module } from '@nestjs/common'
import { AccessTokenGuard } from './access-token.guard'
import { ApiKeyGuard } from './api-key.guard'
import { PaymentAPIKeyGuard } from './payment-api-key.guard'
import { ThrottlerBehindProxyGuard } from './throttler-behind-proxy.guard'
@Module({
  providers: [AccessTokenGuard, PaymentAPIKeyGuard, ThrottlerBehindProxyGuard],
  exports: [AccessTokenGuard, PaymentAPIKeyGuard, ThrottlerBehindProxyGuard],
})
export class GuardsModule {}
