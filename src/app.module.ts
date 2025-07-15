import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { PrismaModule } from './prisma/prisma.module'
import { HashService } from './libs/crypto/hash.service'

@Module({
  imports: [PrismaModule],
  controllers: [AppController],
  providers: [AppService, HashService],
})
export class AppModule {}
