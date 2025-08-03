import { Module } from '@nestjs/common'
import { TokenModule } from 'src/modules/token/token.module'
import { ChatGateway } from 'src/websockets/chat.gateway'
import { PaymentGateway } from 'src/websockets/payment.gateway'

@Module({
  imports: [TokenModule],
  providers: [ChatGateway, PaymentGateway],
})
export class WebsocketModule {}
