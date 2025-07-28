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

    // Obtener parámetros de query
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '5')
    
    // Usar función helper para obtener pedidos con información del usuario
    const { data: recentOrders, error } = await supabase
      .rpc('get_orders_with_profiles', {
        limit_val: limit,
        offset_val: 0,
        admin_user_id: user.id
      })

    if (error) {
      console.error('Error fetching recent orders:', error)
      return NextResponse.json(
        { error: 'Error al obtener pedidos recientes' },
        { status: 500 }
      )
    }

    // Obtener conteo de items para cada pedido
    const ordersWithItems = await Promise.all(
      (recentOrders || []).map(async (order: any) => {
        const { data: items } = await supabase
          .from('order_items')
          .select('id')
          .eq('order_id', order.id)

        return {
          id: order.id,
          order_number: `ORD-${order.id.slice(-8).toUpperCase()}`, // Generar número de orden
          user_email: order.user_email || 'Email no disponible',
          user_full_name: order.user_full_name || null,
          user_company_name: order.user_company_name || null,
          total_amount: order.total_amount || 0,
          status: order.status,
          created_at: order.created_at,
          delivery_date: order.delivery_date || null,
          delivery_address: order.delivery_address || null,
          phone: order.phone || null,
          notes: order.notes || null,
          items_count: items?.length || 0
        }
      })
    )

    return NextResponse.json(ordersWithItems)
  } catch (error) {
    console.error('Error fetching recent orders:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 