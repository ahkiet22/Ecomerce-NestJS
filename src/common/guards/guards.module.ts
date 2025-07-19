// src/common/guards/guards.module.ts
import { Global, Module } from '@nestjs/common'
import { AccessTokenGuard } from './access-token.guard'
import { ApiKeyGuard } from './api-key.guard'
@Module({
  providers: [AccessTokenGuard, ApiKeyGuard],
  exports: [AccessTokenGuard, ApiKeyGuard],
})
export class GuardsModule {}
