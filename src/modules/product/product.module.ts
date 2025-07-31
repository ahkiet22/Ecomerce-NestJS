import { Module } from '@nestjs/common'
import { ProductController } from 'src/modules/product/product.controller'
import { ProductRepo } from 'src/modules/product/product.repository'
import { ProductService } from 'src/modules/product/product.service'
import { ManageProductService } from './manage-product.service'
import { ManageProductController } from './manage-product.controller'

@Module({
  providers: [ProductService, ManageProductService, ProductRepo],
  controllers: [ProductController, ManageProductController],
})
export class ProductModule {}
