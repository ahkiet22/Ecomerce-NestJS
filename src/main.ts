import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { TransformInterceptor } from './common/interceptors/transform.interceptor'
import { AuthenticationGuard } from './common/guards/auth.guard'
import { NestExpressApplication } from '@nestjs/platform-express'
import { WebsocketAdapter } from './websockets/websocket.adapter'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { patchNestJsSwagger } from 'nestjs-zod'
import helmet from 'helmet'
import { Logger } from 'nestjs-pino'
import { LoggingInterceptor } from './common/interceptors/logging.interceptor'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true })
  app.useLogger(app.get(Logger))
  app.set('trust proxy', 'loopback') // Trust requests from the loopback address
  app.use(helmet())
  app.enableCors({
    origin: 'http://localhost:3300',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  })
  patchNestJsSwagger()
  const config = new DocumentBuilder()
    .setTitle('Ecommerce API')
    .setDescription('The API for the ecommerce application')
    .setVersion('1.0')
    .addBearerAuth()
    .addApiKey(
      {
        name: 'authorization',
        type: 'apiKey',
      },
      'payment-api-key',
    )
    .build()
  const documentFactory = () => SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, documentFactory, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  })

  // custom response
  app.useGlobalInterceptors(new TransformInterceptor())
  // app.useGlobalInterceptors(new LoggingInterceptor())

  const websocketAdapter = new WebsocketAdapter(app)
  await websocketAdapter.connectToRedis()
  app.useWebSocketAdapter(websocketAdapter)

  await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
