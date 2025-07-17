import { Global, Module } from '@nestjs/common'
import { CommonUserRepository } from './repositories/common-user.repository'
import { PrismaModule } from 'src/prisma/prisma.module'

@Global()
@Module({
  imports: [PrismaModule],
  providers: [CommonUserRepository],
  exports: [CommonUserRepository],
})
export class CommonModule {}
