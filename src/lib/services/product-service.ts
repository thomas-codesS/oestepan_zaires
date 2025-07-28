import { createClient } from '@/lib/supabase/client'
import { Product, CreateProductRequest, UpdateProductRequest, ProductListResponse, ProductFilters } from '@/lib/types/product'
import { createProductSchema, updateProductSchema, productFiltersSchema } from '@/lib/validations/product'

export class ProductService {
  private supabase = createClient()

  async getProducts(filters: ProductFilters = {}): Promise<ProductListResponse> {
    const validatedFilters = productFiltersSchema.parse(filters)
    const { search, category, is_active, page, limit } = validatedFilters

    let query = this.supabase
      .from('products')
      .select('*', { count: 'exact' })

    // Aplicar filtros
    if (search) {
      query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (category) {
      query = query.eq('category', category)
    }

    if (is_active !== undefined) {
      query = query.eq('is_active', is_active)
    }

    // Paginación
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      throw new Error(`Error al obtener productos: ${error.message}`)
    }

    return {
      products: data || [],
      total: count || 0,
      page,
      limit
    }
  }

  async getProductById(id: string): Promise<Product | null> {
    const { data, error } = await this.supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Producto no encontrado
      }
      throw new Error(`Error al obtener producto: ${error.message}`)
    }

    return data
  }

  async getProductByCode(code: string): Promise<Product | null> {
    const { data, error } = await this.supabase
      .from('products')
      .select('*')
      .eq('code', code)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Producto no encontrado
      }
      throw new Error(`Error al obtener producto por código: ${error.message}`)
    }

    return data
  }

  async createProduct(productData: CreateProductRequest): Promise<Product> {
    const validatedData = createProductSchema.parse(productData)

    // Verificar que el código no exista
    const existingProduct = await this.getProductByCode(validatedData.code)
    if (existingProduct) {
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
      throw new Error(`Error al crear producto: ${error.message}`)
    }

    return data
  }

  async updateProduct(id: string, productData: Partial<UpdateProductRequest>): Promise<Product> {
    const validatedData = updateProductSchema.parse({ ...productData, id })

    // Si se está actualizando el código, verificar que no exista
    if (validatedData.code) {
      const existingProduct = await this.getProductByCode(validatedData.code)
      if (existingProduct && existingProduct.id !== id) {
        throw new Error(`Ya existe un producto con el código: ${validatedData.code}`)
      }
    }

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
      throw new Error(`Error al actualizar producto: ${error.message}`)
    }

    return data
  }

  async deleteProduct(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Error al eliminar producto: ${error.message}`)
    }
  }

  async toggleProductStatus(id: string): Promise<Product> {
    const product = await this.getProductById(id)
    if (!product) {
      throw new Error('Producto no encontrado')
    }

    return this.updateProduct(id, { is_active: !product.is_active })
  }

  async getCategories(): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('products')
      .select('category')
      .not('category', 'is', null)

    if (error) {
      throw new Error(`Error al obtener categorías: ${error.message}`)
    }

    const categories = [...new Set(data?.map(item => item.category).filter(Boolean))]
    return categories.sort()
  }

  // Método para calcular precio con IVA
  calculatePriceWithIVA(price: number, ivaRate: number): number {
    return price * (1 + ivaRate / 100)
  }

  // Método para formatear precio en pesos argentinos
  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price)
  }
}

// Instancia singleton del servicio
export const productService = new ProductService() 