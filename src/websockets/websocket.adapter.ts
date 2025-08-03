import { INestApplicationContext } from '@nestjs/common'
import { IoAdapter } from '@nestjs/platform-socket.io'
import { ServerOptions, Server, Socket } from 'socket.io'
import { generateRoomUserId } from 'src/common/helpers/generate'
import { CommonWebsocketRepository } from 'src/common/repositories/common-websocket.repository'
import { createAdapter } from '@socket.io/redis-adapter'
import { createClient } from 'redis'
import envConfig from 'src/configs/validation'
import { TokenService } from 'src/modules/token/token.service'

const namespaces = ['/', 'payment', 'chat']
export class WebsocketAdapter extends IoAdapter {
  private readonly commonWebsocketRepository: CommonWebsocketRepository
  private readonly tokenService: TokenService
  private adapterConstructor: ReturnType<typeof createAdapter>
  constructor(app: INestApplicationContext) {
    super(app)
    this.commonWebsocketRepository = app.get(CommonWebsocketRepository)
    this.tokenService = app.get(TokenService)
  }

  async connectToRedis(): Promise<void> {
    const pubClient = createClient({ url: envConfig.REDIS_URL })
    const subClient = pubClient.duplicate()

    await Promise.all([pubClient.connect(), subClient.connect()])

    this.adapterConstructor = createAdapter(pubClient, subClient)
  }

  createIOServer(port: number, options?: ServerOptions) {
    const server: Server = super.createIOServer(port, {
      ...options,
      cors: {
        origin: '*',
        credentials: true,
      },
    })

    server.use((socket, next) => {
      this.authMiddleware(socket, next)
        .then(() => {})
        .catch(() => {})
    })
    server.of(/.*/).use((socket, next) => {
      this.authMiddleware(socket, next)
        .then(() => {})
        .catch(() => {})
    })
    // namespaces.forEach((item) => {
    //   server.of(item).use(authMiddleware)
    // })
    // server.use(authMiddleware)
    // server.of('payment').use(authMiddleware)
    // server.of('chat').use(authMiddleware)
    return server
  }

  async authMiddleware(socket: Socket, next: (err?: any) => void) {
    const { authorization } = socket.handshake.headers
    if (!authorization) {
      return next(new Error('Thiếu Authorization header'))
    }
    const accessToken = authorization.split(' ')[1]
    if (!accessToken) {
      return next(new Error('Thiếu access token'))
    }
    try {
      const { userId } = await this.tokenService.verifyAccessToken(accessToken)
      // cách 2 là tạo room với name userId để emit để các thiết bị của user
      await socket.join(generateRoomUserId(userId))

      // Cách 1 tạo một socket và lưu vào db
      // await this.commonWebsocketRepository.create({
      //   id: socket.id,
      //   userId,
      // })
      // socket.on('disconnect', async () => {
      //   await this.commonWebsocketRepository.delete(socket.id).catch(() => {})
      // })
      next()
    } catch (error) {
      next(error)
    }
  }
}
