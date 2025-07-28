import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createProductSchema } from '@/lib/validations/product'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Crear cliente de Supabase para el servidor
    const supabase = await createClient()
    
    const filters = {
      search: searchParams.get('search') || undefined,
      category: searchParams.get('category') || undefined,
      is_active: searchParams.get('is_active') ? searchParams.get('is_active') === 'true' : undefined, // Para admin, mostrar todos por defecto
      minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
      maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
      sortBy: searchParams.get('sortBy') || 'name',
      sortOrder: searchParams.get('sortOrder') || 'asc'
    }

    // Construir query
    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })

    // Aplicar filtros
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,code.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    if (filters.category) {
      query = query.eq('category', filters.category)
    }

    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
    }

    if (filters.minPrice !== undefined) {
      query = query.gte('price_with_iva', filters.minPrice)
    }

    if (filters.maxPrice !== undefined) {
      query = query.lte('price_with_iva', filters.maxPrice)
    }

    // Ordenamiento
    const isAscending = filters.sortOrder === 'asc'
    if (filters.sortBy === 'name') {
      query = query.order('name', { ascending: isAscending })
    } else if (filters.sortBy === 'price') {
      query = query.order('price_with_iva', { ascending: isAscending })
    } else if (filters.sortBy === 'created_at') {
      query = query.order('created_at', { ascending: isAscending })
    }

    // Paginación
    const from = (filters.page - 1) * filters.limit
    const to = from + filters.limit - 1

    const { data, error, count } = await query.range(from, to)

    if (error) {
      console.error('Error fetching products:', error)
      return NextResponse.json(
        { error: 'Error al obtener productos' },
        { status: 500 }
      )
    }

    // Calcular datos de paginación
    const totalPages = Math.ceil((count || 0) / filters.limit)

    const result = {
      products: data || [],
      total: count || 0,
      totalPages,
      currentPage: filters.page,
      limit: filters.limit
    }
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in GET /api/products:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Para crear productos, necesitamos verificar autenticación de admin
    const supabase = await createClient()
    
    // Verificar usuario autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Verificar que sea admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'No tienes permisos para crear productos' },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    // Validar datos de entrada
    const validatedData = createProductSchema.parse(body)
    
    // Verificar que el código no exista
    const { data: existingProduct } = await supabase
      .from('products')
      .select('id')
      .eq('code', validatedData.code)
      .single()

    if (existingProduct) {
      return NextResponse.json(
        { error: `Ya existe un producto con el código: ${validatedData.code}` },
        { status: 400 }
      )
    }

    // Crear producto
    const { data, error } = await supabase
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
      console.error('Error creating product:', error)
      return NextResponse.json(
        { error: 'Error al crear producto' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/products:', error)
    
    if (error instanceof Error) {
      // Errores de validación o de negocio
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 