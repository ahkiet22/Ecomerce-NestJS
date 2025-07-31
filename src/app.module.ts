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
import { RoleModule } from './modules/role/role.module'
import { ProfileModule } from './modules/profile/profile.module'
import { UserModule } from './modules/user/user.module'
import { MediaModule } from './modules/media/media.module'
import { BrandTranslationModule } from './modules/brand/brand-translation/brand-translation.module'
import { BrandModule } from './modules/brand/brand.module'
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n'
import path from 'path'
import { CategoryTranslationModule } from './modules/category/category-translation/category-translation.module'
import { CategoryModule } from './modules/category/category.module'
import { ProductTranslationModule } from './modules/product/product-translation/product-translation.module'
import { ProductModule } from './modules/product/product.module'

@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.resolve('src/i18n/'),
        watch: true,
      },
      resolvers: [{ use: QueryResolver, options: ['lang'] }, AcceptLanguageResolver],
      typesOutputPath: path.resolve('src/generated/i18n.generated.ts'),
    }),
    PrismaModule,
    TokenModule,
    AuthModule,
    LanguageModule,
    PermissionModule,
    RoleModule,
    ProfileModule,
    UserModule,
    MediaModule,
    BrandModule,
    BrandTranslationModule,
    CategoryModule,
    CategoryTranslationModule,
    ProductModule,
    ProductTranslationModule,
    CommonModule,
  ],
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
