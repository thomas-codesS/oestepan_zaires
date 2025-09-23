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

    // Obtener todos los pedidos
    const { data: allOrders, error: allOrdersError } = await supabase
      .from('orders')
      .select('*')
      .gte('delivery_date', startDate)
      .lte('delivery_date', endDate)
      .neq('status', 'cancelled')
      .order('delivery_date', { ascending: false })
      .order('created_at', { ascending: false })

    if (allOrdersError) {
      console.error('Error fetching all orders:', allOrdersError)
      return NextResponse.json({ error: 'Error al obtener pedidos' }, { status: 500 })
    }

    // Obtener perfiles de usuarios y agregar conteo de items
    const ordersWithItems = await Promise.all(
      (allOrders || []).map(async (order: any) => {
        // Obtener perfil del usuario
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, email, full_name, company_name')
          .eq('id', order.user_id)
          .single()

        // Obtener conteo de items
        const { data: items } = await supabase
          .from('order_items')
          .select('id')
          .eq('order_id', order.id)

        return {
          ...order,
          items_count: items?.length || 0,
          client_name: profile?.full_name || profile?.email || 'Cliente Desconocido',
          client_email: profile?.email || ''
        }
      })
    )

    // Agrupar por fecha primero, luego por cliente
    const groupedByDay: { [key: string]: any } = {}
    
    ordersWithItems.forEach((order: any) => {
      const dateKey = order.delivery_date
      
      if (!groupedByDay[dateKey]) {
        groupedByDay[dateKey] = {
          delivery_date: dateKey,
          total_amount: 0,
          total_orders: 0,
          clients: {} as { [key: string]: any }
        }
      }
      
      const clientKey = order.client_email
      
      if (!groupedByDay[dateKey].clients[clientKey]) {
        groupedByDay[dateKey].clients[clientKey] = {
          client_name: order.client_name,
          client_email: order.client_email,
          delivery_address: order.delivery_address,
          phone: order.phone,
          orders: [],
          order_count: 0,
          total_amount: 0
        }
      }
      
      // Agregar pedido al cliente
      groupedByDay[dateKey].clients[clientKey].orders.push({
        id: order.id,
        status: order.status,
        created_at: order.created_at,
        items_count: order.items_count,
        notes: order.notes,
        total_amount: parseFloat(order.total_amount || 0)
      })
      
      groupedByDay[dateKey].clients[clientKey].order_count++
      groupedByDay[dateKey].clients[clientKey].total_amount += parseFloat(order.total_amount || 0)
      
      // Actualizar totales del día
      groupedByDay[dateKey].total_orders++
      groupedByDay[dateKey].total_amount += parseFloat(order.total_amount || 0)
    })

    // Convertir a array y ordenar
    const ordersGrouped = Object.values(groupedByDay).map((day: any) => ({
      ...day,
      clients: Object.values(day.clients).sort((a: any, b: any) => 
        a.client_name.localeCompare(b.client_name)
      )
    })).sort((a: any, b: any) => 
      new Date(b.delivery_date).getTime() - new Date(a.delivery_date).getTime()
    )

    // Estadísticas resumidas
    const stats = {
      total_days: ordersGrouped.length,
      total_orders: ordersGrouped.reduce((sum, day) => sum + day.total_orders, 0),
      total_amount: ordersGrouped.reduce((sum, day) => sum + day.total_amount, 0),
      unique_clients: new Set(
        ordersGrouped.flatMap(day => 
          day.clients.map((client: any) => client.client_email)
        )
      ).size,
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