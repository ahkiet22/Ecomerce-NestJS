import { Module } from '@nestjs/common'
import { BrandController } from './brand.controller'
import { BrandService } from './brand.service'
import { BrandRepo } from './brand.repository'

@Module({
  providers: [BrandService, BrandRepo],
  controllers: [BrandController],
})
export class BrandModule {}
