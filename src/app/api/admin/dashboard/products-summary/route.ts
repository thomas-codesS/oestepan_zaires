import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface ProductSummaryItem {
  product_id: string
  product_name: string
  product_code: string
  total_quantity: number
  price: number
  iva_rate: number
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar que el usuario sea admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    if (!date) {
      return NextResponse.json({ error: 'Fecha requerida' }, { status: 400 })
    }

    // Consultar resumen de productos para la fecha específica
    const { data: productsData, error: productsError } = await supabase
      .from('order_items')
      .select(`
        quantity,
        product_id,
        products!inner (
          id,
          name,
          code,
          price,
          iva_rate
        ),
        orders!inner (
          delivery_date,
          status
        )
      `)
      .eq('orders.delivery_date', date)
      .neq('orders.status', 'cancelled')

    if (productsError) {
      console.error('Error fetching products summary:', productsError)
      return NextResponse.json({ error: 'Error al obtener resumen de productos' }, { status: 500 })
    }

    // Agrupar productos por ID y sumar cantidades
    const productSummary: any = {}

    if (productsData) {
      productsData.forEach((item: any) => {
        const productId = item.product_id
        const product = item.products
        
        if (!productSummary[productId]) {
          productSummary[productId] = {
            product_id: productId,
            product_name: product.name,
            product_code: product.code,
            price: product.price,
            iva_rate: product.iva_rate,
            total_quantity: 0
          }
        }
        
        productSummary[productId].total_quantity += item.quantity
      })
    }

    // Convertir a array y ordenar por cantidad
    const products = Object.values(productSummary)
      .sort((a: any, b: any) => b.total_quantity - a.total_quantity)

    return NextResponse.json({
      date,
      products,
      total_products: products.length
    })

  } catch (error) {
    console.error('Error in products-summary API:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
