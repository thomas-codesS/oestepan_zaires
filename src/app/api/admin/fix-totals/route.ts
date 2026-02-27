import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, total_amount')

    if (ordersError) throw ordersError

    let fixed = 0
    let noItems = 0
    const results = []

    for (const order of orders) {
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('line_total')
        .eq('order_id', order.id)

      if (itemsError) continue

      const calculatedTotal = items.reduce((sum, item) => sum + (item.line_total || 0), 0)

      if (Math.abs((order.total_amount || 0) - calculatedTotal) > 0.01) {
        const { error: updateError } = await supabase
          .from('orders')
          .update({ total_amount: calculatedTotal })
          .eq('id', order.id)

        if (updateError) {
          results.push({
            orderId: order.id, status: 'error', message: updateError.message,
            oldTotal: order.total_amount || 0, newTotal: calculatedTotal
          })
        } else {
          fixed++
          results.push({
            orderId: order.id, status: 'fixed',
            oldTotal: order.total_amount || 0, newTotal: calculatedTotal
          })
        }
      }

      if (items.length === 0) {
        noItems++
        results.push({ orderId: order.id, status: 'no_items', oldTotal: order.total_amount || 0, newTotal: 0 })
      }
    }

    const { data: finalStats } = await supabase
      .from('orders')
      .select('total_amount, status')
      .neq('status', 'cancelled')

    const totalRevenue = finalStats?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0
    const ordersWithTotal = finalStats?.filter(order => (order.total_amount || 0) > 0).length || 0

    return NextResponse.json({
      success: true,
      message: 'Totales de pedidos reparados exitosamente',
      summary: {
        totalProcessed: orders.length,
        fixed,
        noItems,
        totalRevenue,
        ordersWithTotal,
        totalOrders: finalStats?.length || 0
      },
      results: results.slice(0, 20)
    })
  } catch (error) {
    console.error('Error during fix-totals:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    )
  }
}
