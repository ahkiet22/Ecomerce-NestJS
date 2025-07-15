import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { PrismaModule } from './prisma/prisma.module'
import { HashService } from './libs/crypto/hash.service'
import { TokenModule } from './modules/token/token.module'

@Module({
  imports: [PrismaModule, TokenModule],
  controllers: [AppController],
  providers: [AppService, HashService],
})
export class AppModule {}
