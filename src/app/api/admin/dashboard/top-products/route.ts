import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verificar que el usuario sea admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Obtener perfil del usuario
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    // Obtener productos más vendidos basado en order_items
    const { data: topProducts, error } = await supabase
      .from('order_items')
      .select(`
        product_id,
        product_code,
        product_name,
        quantity,
        unit_price_with_iva,
        orders!inner(status)
      `)
      .neq('orders.status', 'cancelled')

    if (error) {
      console.error('Error fetching top products:', error)
      return NextResponse.json(
        { error: 'Error al obtener productos más vendidos' },
        { status: 500 }
      )
    }

    // Agrupar y calcular totales por producto
    const productStats = new Map()

    topProducts?.forEach(item => {
      const key = item.product_id
      if (!productStats.has(key)) {
        productStats.set(key, {
          id: item.product_id,
          name: item.product_name,
          code: item.product_code,
          category: '', // Se obtendrá de la tabla products
          total_quantity: 0,
          total_revenue: 0
        })
      }
      
      const product = productStats.get(key)
      product.total_quantity += item.quantity
      product.total_revenue += item.quantity * item.unit_price_with_iva
    })

    // Convertir a array y ordenar por cantidad vendida
    const sortedProducts = Array.from(productStats.values())
      .sort((a, b) => b.total_quantity - a.total_quantity)
      .slice(0, 5) // Top 5 productos

    // Obtener información adicional de los productos (categoría)
    if (sortedProducts.length > 0) {
      const productIds = sortedProducts.map(p => p.id)
      const { data: productDetails } = await supabase
        .from('products')
        .select('id, category')
        .in('id', productIds)

      // Agregar información de categoría
      sortedProducts.forEach(product => {
        const detail = productDetails?.find(d => d.id === product.id)
        if (detail) {
          product.category = detail.category || 'Sin categoría'
        }
      })
    }

    return NextResponse.json(sortedProducts)
  } catch (error) {
    console.error('Error fetching top products:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 