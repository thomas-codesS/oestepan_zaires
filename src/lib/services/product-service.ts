import { createClient } from '@/lib/supabase/client'
import { Product, CreateProductRequest, UpdateProductRequest, ProductListResponse, ProductFilters } from '@/lib/types/product'
import { createProductSchema, updateProductSchema, productFiltersSchema } from '@/lib/validations/product'

export class ProductService {
  private supabase = createClient()

  async getProducts(filters: ProductFilters = {}): Promise<ProductListResponse> {
    const validatedFilters = productFiltersSchema.parse(filters)

    let query = this.supabase
      .from('products')
      .select('*', { count: 'exact' })

    if (validatedFilters.search) {
      query = query.or(`name.ilike.%${validatedFilters.search}%,code.ilike.%${validatedFilters.search}%`)
    }

    if (validatedFilters.category) {
      query = query.eq('category', validatedFilters.category)
    }

    if (validatedFilters.is_active !== undefined) {
      query = query.eq('is_active', validatedFilters.is_active)
    }

    query = query.order('name', { ascending: true })

    const offset = ((validatedFilters.page || 1) - 1) * (validatedFilters.limit || 20)
    const limit = validatedFilters.limit || 20

    const { data, error, count } = await query.range(offset, offset + limit - 1)

    if (error) {
      throw new Error(`Error fetching products: ${error.message}`)
    }

    return {
      products: data || [],
      total: count || 0,
      page: validatedFilters.page || 1,
      limit
    }
  }

  async getProductById(id: string): Promise<Product> {
    const { data, error } = await this.supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Producto no encontrado')
      }
      throw new Error(`Error fetching product: ${error.message}`)
    }

    return data
  }

  async createProduct(productData: CreateProductRequest): Promise<Product> {
    const validatedData = createProductSchema.parse(productData)

    // Check if code already exists
    const { data: existing } = await this.supabase
      .from('products')
      .select('id')
      .eq('code', validatedData.code)
      .single()

    if (existing) {
      throw new Error(`Ya existe un producto con el código: ${validatedData.code}`)
    }

    const { data, error } = await this.supabase
      .from('products')
      .insert([{
        ...validatedData,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) {
      throw new Error(`Error creating product: ${error.message}`)
    }

    return data
  }

  async updateProduct(id: string, productData: Partial<CreateProductRequest> & { is_active?: boolean }): Promise<Product> {
    const validatedData = updateProductSchema.parse({ ...productData, id })

    const { data, error } = await this.supabase
      .from('products')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Error updating product: ${error.message}`)
    }

    return data
  }

  async deleteProduct(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Error deleting product: ${error.message}`)
    }
  }

  async toggleProductStatus(id: string): Promise<Product> {
    const product = await this.getProductById(id)

    return this.updateProduct(id, { is_active: !product.is_active })
  }
}

export const productService = new ProductService()
