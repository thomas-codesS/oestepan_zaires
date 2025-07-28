import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface OrdersByDayItem {
  delivery_date: string
  client_email: string
  client_name: string
  delivery_address: string | null
  phone: string | null
  order_count: number
  total_amount: number
  orders: Array<{
    id: string
    status: string
    created_at: string
    items_count: number
    notes: string | null
  }>
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
    const startDate = searchParams.get('startDate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const endDate = searchParams.get('endDate') || new Date().toISOString().split('T')[0]

    // Usar función helper para obtener pedidos agrupados por día
    const { data: ordersData, error: ordersError } = await supabase
      .rpc('get_orders_by_day', {
        start_date: startDate,
        end_date: endDate,
        admin_user_id: user.id
      })

    if (ordersError) {
      console.error('Error fetching orders:', ordersError)
      return NextResponse.json({ error: 'Error al obtener pedidos' }, { status: 500 })
    }

    // Transformar los datos para incluir items_count en cada pedido
    const ordersGrouped = await Promise.all(
      (ordersData || []).map(async (group: any) => {
        // Procesar cada pedido para obtener el conteo de items
        const ordersWithItems = await Promise.all(
          group.orders.map(async (order: any) => {
            const { data: items } = await supabase
              .from('order_items')
              .select('id')
              .eq('order_id', order.id)

            return {
              ...order,
              items_count: items?.length || 0
            }
          })
        )

        return {
          delivery_date: group.delivery_date,
          client_email: group.client_email,
          client_name: group.client_name,
          delivery_address: group.delivery_address,
          phone: group.phone,
          order_count: group.order_count,
          total_amount: parseFloat(group.total_amount || 0),
          orders: ordersWithItems
        }
      })
    )

    // Estadísticas resumidas
    const stats = {
      total_groups: ordersGrouped.length,
      total_orders: ordersGrouped.reduce((sum, group) => sum + group.order_count, 0),
      total_amount: ordersGrouped.reduce((sum, group) => sum + group.total_amount, 0),
      unique_clients: new Set(ordersGrouped.map(group => group.client_email)).size,
      date_range: { startDate, endDate }
    }

    return NextResponse.json({
      stats,
      orders_by_day: ordersGrouped
    })

  } catch (error) {
    console.error('Error in orders-by-day API:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 