export interface Product {
  id: string
  code: string // Código Panfresh
  name: string
  description?: string
  price: number
  iva_rate: number // 21.00 o 10.5
  category?: string
  is_active: boolean
  stock_quantity: number
  created_at: string
  updated_at: string
}

export interface CreateProductRequest {
  code: string
  name: string
  description?: string
  price: number
  iva_rate?: number
  category?: string
  stock_quantity?: number
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  id: string
  is_active?: boolean
}

export interface ProductListResponse {
  products: Product[]
  total: number
  page: number
  limit: number
}

export interface ProductFilters {
  search?: string
  category?: string
  is_active?: boolean
  page?: number
  limit?: number
} 