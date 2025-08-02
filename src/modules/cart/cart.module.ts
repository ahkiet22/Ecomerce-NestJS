import { Module } from '@nestjs/common'
import { CartController } from './cart.controller'
import { CartService } from './cart.service'
import { CartRepo } from './cart.repository'

@Module({
  providers: [CartService, CartRepo],
  controllers: [CartController],
})
export class CartModule {}
