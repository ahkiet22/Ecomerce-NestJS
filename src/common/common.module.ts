import { Global, Module } from '@nestjs/common'
import { CommonUserRepository } from './repositories/common-user.repository'
import { PrismaModule } from 'src/prisma/prisma.module'
import { GuardsModule } from './guards/guards.module'
import { APP_GUARD, Reflector } from '@nestjs/core'
import { AuthenticationGuard } from './guards/auth.guard'
import { TwoFactorService } from './services/2fa.service'
import { CommonRolesRepository } from './repositories/roles.repository'

@Global()
@Module({
  imports: [PrismaModule, GuardsModule],
  providers: [
    Reflector,
    TwoFactorService,
    CommonUserRepository,
    CommonRolesRepository,
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
  ],
  exports: [CommonUserRepository, TwoFactorService, CommonRolesRepository],
})
export class CommonModule {}
