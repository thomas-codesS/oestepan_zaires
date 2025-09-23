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
    
    // Obtener pedidos primero
    const { data: recentOrders, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching recent orders:', error)
      return NextResponse.json(
        { error: 'Error al obtener pedidos recientes' },
        { status: 500 }
      )
    }

    // Obtener información de usuarios de manera separada
    const userIds = [...new Set(recentOrders?.map(order => order.user_id).filter(Boolean) || [])]
    let usersData: any[] = []
    
    if (userIds.length > 0) {
      const { data } = await supabase
        .from('profiles')
        .select('id, email, full_name, company_name')
        .in('id', userIds)
      
      usersData = data || []
    }

    // Crear mapa de usuarios para búsqueda rápida
    const usersMap = new Map(usersData.map(user => [user.id, user]))

    // Obtener conteo de items para cada pedido y calcular totales
    const ordersWithItems = await Promise.all(
      (recentOrders || []).map(async (order: any) => {
        const { data: items } = await supabase
          .from('order_items')
          .select('id, line_total')
          .eq('order_id', order.id)

        // Calcular total desde los items si no existe o es 0
        let calculatedTotal = order.total_amount || 0
        if (!calculatedTotal && items && items.length > 0) {
          calculatedTotal = items.reduce((sum, item) => sum + (item.line_total || 0), 0)
          
          // Actualizar el total en la base de datos
          await supabase
            .from('orders')
            .update({ total_amount: calculatedTotal })
            .eq('id', order.id)
        }

        // Obtener información del usuario
        const userData = usersMap.get(order.user_id)

        return {
          id: order.id,
          order_number: `ORD-${order.id.slice(-8).toUpperCase()}`,
          user_email: userData?.email || 'Email no disponible',
          user_full_name: userData?.full_name || null,
          user_company_name: userData?.company_name || null,
          total_amount: calculatedTotal,
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