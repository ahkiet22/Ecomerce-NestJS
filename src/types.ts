/* eslint-disable @typescript-eslint/no-namespace */
import { VariantsType } from './common/models/product.model'

declare global {
  namespace PrismaJson {
    type Variants = VariantsType
  }
}
