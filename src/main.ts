import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { TransformInterceptor } from './common/interceptors/transform.interceptor'
import { AuthenticationGuard } from './common/guards/auth.guard'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.useGlobalInterceptors(new TransformInterceptor())
  
  await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
