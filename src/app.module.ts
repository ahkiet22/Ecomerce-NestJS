import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { PrismaModule } from './prisma/prisma.module'
import { HashService } from './libs/crypto/hash.service'
import { TokenModule } from './modules/token/token.module'
import { AuthModule } from './modules/auth/auth.module'
import CustomZodValidationPipe from './common/pipes/custom-zod-validation.pipe'
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import { ZodSerializerInterceptor } from 'nestjs-zod'
import { HttpExceptionFilter } from './common/filters/http-exception.filter'
import { CommonModule } from './common/common.module'
import { EmailService } from './libs/email/email.service'
import { LanguageModule } from './modules/language/language.module'
import { PermissionModule } from './modules/permission/permission.module'

@Module({
  imports: [PrismaModule, TokenModule, AuthModule, LanguageModule, PermissionModule, CommonModule],
  controllers: [AppController],
  providers: [
    AppService,
    HashService,
    EmailService,
    {
      provide: APP_PIPE,
      useClass: CustomZodValidationPipe,
    },
    { provide: APP_INTERCEPTOR, useClass: ZodSerializerInterceptor },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
