import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { TransformInterceptor } from './common/interceptors/transform.interceptor'
import { AuthenticationGuard } from './common/guards/auth.guard'
import { NestExpressApplication } from '@nestjs/platform-express'
import { WebsocketAdapter } from './websockets/websocket.adapter'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  app.enableCors({
    origin: 'http://localhost:3300',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  })

  // custom response
  app.useGlobalInterceptors(new TransformInterceptor())

  const websocketAdapter = new WebsocketAdapter(app)
  await websocketAdapter.connectToRedis()
  app.useWebSocketAdapter(websocketAdapter)

  await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
