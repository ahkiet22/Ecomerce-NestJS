// src/common/guards/guards.module.ts
import { Global, Module } from '@nestjs/common'
import { APP_GUARD, Reflector } from '@nestjs/core'
import { AuthenticationGuard } from './auth.guard'
import { AccessTokenGuard } from './access-token.guard'
import { ApiKeyGuard } from './api-key.guard'

@Global()
@Module({
  providers: [
    AccessTokenGuard,
    ApiKeyGuard,
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
  ],
  exports: [AccessTokenGuard, ApiKeyGuard],
})
export class GuardsModule {}
