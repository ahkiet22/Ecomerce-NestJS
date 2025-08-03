import { Global, Module } from '@nestjs/common'
import { CommonUserRepository } from './repositories/common-user.repository'
import { PrismaModule } from 'src/prisma/prisma.module'
import { GuardsModule } from './guards/guards.module'
import { APP_GUARD, Reflector } from '@nestjs/core'
import { AuthenticationGuard } from './guards/auth.guard'
import { TwoFactorService } from './services/2fa.service'
import { CommonRolesRepository } from './repositories/roles.repository'
import { S3Service } from './services/s3.service'
import { CommonWebsocketRepository } from './repositories/common-websocket.repository'
import { CommonPaymentRepository } from './repositories/common-payment.repository'

@Global()
@Module({
  imports: [PrismaModule, GuardsModule],
  providers: [
    Reflector,
    TwoFactorService,
    S3Service,
    CommonUserRepository,
    CommonRolesRepository,
    CommonWebsocketRepository,
    CommonPaymentRepository,
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
  ],
  exports: [
    TwoFactorService,
    S3Service,
    CommonUserRepository,
    CommonRolesRepository,
    CommonWebsocketRepository,
    CommonPaymentRepository,
  ],
})
export class CommonModule {}
