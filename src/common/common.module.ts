import { Global, Module } from '@nestjs/common'
import { CommonUserRepository } from './repositories/common-user.repository'
import { PrismaModule } from 'src/prisma/prisma.module'
import { GuardsModule } from './guards/guards.module'
import { APP_GUARD, Reflector } from '@nestjs/core'
import { AuthenticationGuard } from './guards/auth.guard'

@Global()
@Module({
  imports: [PrismaModule, GuardsModule],
  providers: [
    Reflector,
    CommonUserRepository,
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
  ],
  exports: [CommonUserRepository],
})
export class CommonModule {}
