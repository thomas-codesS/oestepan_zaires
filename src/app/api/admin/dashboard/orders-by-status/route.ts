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

    // Obtener todos los pedidos agrupados por estado
    const { data: orders, error } = await supabase
      .from('orders')
      .select('status')

    if (error) {
      console.error('Error fetching orders by status:', error)
      return NextResponse.json(
        { error: 'Error al obtener estado de pedidos' },
        { status: 500 }
      )
    }

    // Contar pedidos por estado
    const ordersByStatus = {
      pending: 0,
      confirmed: 0,
      preparing: 0,
      ready: 0,
      delivered: 0,
      cancelled: 0
    }

    orders?.forEach(order => {
      if (order.status in ordersByStatus) {
        ordersByStatus[order.status as keyof typeof ordersByStatus]++
      }
    })

    return NextResponse.json(ordersByStatus)
  } catch (error) {
    console.error('Error fetching orders by status:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 