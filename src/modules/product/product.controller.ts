import { Controller, Get, Param, Query } from '@nestjs/common'
import { ApiParam } from '@nestjs/swagger'
import { ZodSerializerDto } from 'nestjs-zod'
import { IsPublic } from 'src/common/decorators/auth.decorator'
import {
  GetProductDetailResDTO,
  GetProductParamsDTO,
  GetProductsQueryDTO,
  GetProductsResDTO,
} from 'src/modules/product/product.dto'
import { ProductService } from 'src/modules/product/product.service'

@Controller('products')
@IsPublic()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ZodSerializerDto(GetProductsResDTO)
  list(@Query() query: GetProductsQueryDTO) {
    return this.productService.list({
      query,
    })
  }

  @Get(':productId')
  @ZodSerializerDto(GetProductDetailResDTO)
  @ApiParam({ name: 'productId', type: String })
  findById(@Param() params: GetProductParamsDTO) {
    return this.productService.getDetail({
      productId: params.productId,
    })
  }
}
