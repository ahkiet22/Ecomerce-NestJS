import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { TransformInterceptor } from './common/interceptors/transform.interceptor'
import { AuthenticationGuard } from './common/guards/auth.guard'
import { NestExpressApplication } from '@nestjs/platform-express'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  app.enableCors({
    origin: 'http://localhost:3300',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  })

  app.useGlobalInterceptors(new TransformInterceptor())

  await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
