type Variant = {
  value: string
  options: string[]
}

type SKU = {
  value: string
  price: number
  stock: number
  image: string
}

function generateSKUs(variants: Variant[]): SKU[] {
  // Sử dụng recursion hoặc reduce để kết hợp các options
  const combineVariants = (variants: Variant[], current: string[] = []): string[] => {
    if (variants.length === 0) {
      return [current.join('-')]
    }
    const [firstVariant, ...restVariants] = variants
    const result: string[] = []
    for (const option of firstVariant.options) {
      result.push(...combineVariants(restVariants, [...current, option]))
    }
    return result
  }

  // Kết hợp các biến thể lại với nhau
  const skuValues = combineVariants(variants)

  // Tạo SKU từ các giá trị đã kết hợp
  return skuValues.map((value) => ({
    value,
    price: 0, // Giá mặc định là 0
    stock: 100, // Số lượng tồn kho mặc định là 100
    image: '', // Hình ảnh mặc định rỗng
  }))
}

// Ví dụ sử dụng
const variants: Variant[] = [
  {
    value: 'Màu sắc',
    options: ['Đen', 'Trắng', 'Xanh', 'Tím'],
  },
  {
    value: 'Kích thước',
    options: ['S', 'M', 'L', 'XL'],
  },
]

const skus = generateSKUs(variants)
console.log(skus)
