import { Injectable } from '@nestjs/common'
import { PaymentRepo } from 'src/modules/payment/payment.repository'
import { WebhookPaymentBodyType } from 'src/modules/payment/payment.schema'
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server } from 'socket.io'
import { generateRoomUserId } from 'src/common/helpers/generate'
import { CommonWebsocketRepository } from 'src/common/repositories/common-websocket.repository'

@Injectable()
@WebSocketGateway({ namespace: 'payment' })
export class PaymentService {
  @WebSocketServer()
  server: Server
  constructor(
    private readonly paymentRepo: PaymentRepo,
    private readonly commonWebsocketRepository: CommonWebsocketRepository,
  ) {}

  async receiver(body: WebhookPaymentBodyType) {
    const userId = await this.paymentRepo.receiver(body)
    this.server.to(generateRoomUserId(userId)).emit('payment', {
      status: 'success',
    })
    // try {
    //   const websockets = await this.sharedWebsocketRepository.findMany(userId)
    //   websockets.forEach((ws) => {
    //     this.server.to(ws.id).emit('payment', {
    //       status: 'success',
    //     })
    //   })
    // } catch (error) {
    //   console.log(error)
    // }
    return {
      message: 'Payment received successfully',
    }
  }
}
