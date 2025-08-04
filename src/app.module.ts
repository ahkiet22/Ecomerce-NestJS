import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { PrismaModule } from './prisma/prisma.module'
import { HashService } from './libs/crypto/hash.service'
import { TokenModule } from './modules/token/token.module'
import { AuthModule } from './modules/auth/auth.module'
import CustomZodValidationPipe from './common/pipes/custom-zod-validation.pipe'
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
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
import { CartModule } from './modules/cart/cart.module'
import { OrderModule } from './modules/order/order.module'
import { PaymentModule } from './modules/payment/payment.module'
import { BullModule } from '@nestjs/bullmq'
import envConfig from './configs/validation'
import { PaymentConsumer } from './queues/payment.consumer'
import { WebsocketModule } from './websockets/websocket.module'
import { ThrottlerModule } from '@nestjs/throttler'
import { ThrottlerBehindProxyGuard } from './common/guards/throttler-behind-proxy.guard'
import { ReviewModule } from './modules/review/review.module'
import { ScheduleModule } from '@nestjs/schedule'
import { RemoveRefreshTokenCronjobs } from './cronjobs/remove-refresh-token.cron'
import { CacheModule } from '@nestjs/cache-manager'
import { createKeyv } from '@keyv/redis'

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      useFactory: () => {
        return {
          stores: [createKeyv(envConfig.REDIS_URL)],
        }
      },
    }),
    ScheduleModule.forRoot(),
    BullModule.forRoot({
      connection: {
        url: envConfig.REDIS_URL,
      },
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.resolve('src/i18n/'),
        watch: true,
      },
      resolvers: [{ use: QueryResolver, options: ['lang'] }, AcceptLanguageResolver],
      typesOutputPath: path.resolve('src/generated/i18n.generated.ts'),
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'short',
          ttl: 60000, // 1 minute
          limit: 5,
        },
        {
          name: 'long',
          ttl: 120000, // 2 minutes
          limit: 7,
        },
      ],
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
    CartModule,
    OrderModule,
    PaymentModule,
    ReviewModule,
    WebsocketModule,
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
    {
      provide: APP_GUARD,
      useClass: ThrottlerBehindProxyGuard,
    },
    PaymentConsumer,
    RemoveRefreshTokenCronjobs,
  ],
})
export class AppModule {}
