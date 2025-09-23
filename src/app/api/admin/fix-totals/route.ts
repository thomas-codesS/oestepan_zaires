import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verificar que el usuario sea admin
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

    console.log('🔧 Iniciando reparación de totales de pedidos...')
    
    // 1. Obtener todos los pedidos
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, total_amount')
    
    if (ordersError) {
      throw ordersError
    }
    
    console.log(`✅ Encontrados ${orders.length} pedidos`)
    
    let fixed = 0
    let noItems = 0
    const results = []
    
    // 2. Para cada pedido, recalcular el total
    for (const order of orders) {
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('line_total')
        .eq('order_id', order.id)
      
      if (itemsError) {
        console.error(`❌ Error obteniendo items del pedido ${order.id}:`, itemsError)
        continue
      }
      
      const calculatedTotal = items.reduce((sum, item) => sum + (item.line_total || 0), 0)
      
      // Solo actualizar si el total calculado es diferente al actual
      if (Math.abs((order.total_amount || 0) - calculatedTotal) > 0.01) {
        const { error: updateError } = await supabase
          .from('orders')
          .update({ total_amount: calculatedTotal })
          .eq('id', order.id)
        
        if (updateError) {
          console.error(`❌ Error actualizando pedido ${order.id}:`, updateError)
          results.push({
            orderId: order.id,
            status: 'error',
            message: updateError.message,
            oldTotal: order.total_amount || 0,
            newTotal: calculatedTotal
          })
        } else {
          console.log(`✅ Pedido ${order.id}: ${order.total_amount || 0} → ${calculatedTotal}`)
          fixed++
          results.push({
            orderId: order.id,
            status: 'fixed',
            oldTotal: order.total_amount || 0,
            newTotal: calculatedTotal
          })
        }
      }
      
      if (items.length === 0) {
        noItems++
        results.push({
          orderId: order.id,
          status: 'no_items',
          oldTotal: order.total_amount || 0,
          newTotal: 0
        })
      }
    }
    
    // 3. Obtener estadísticas finales
    const { data: finalStats } = await supabase
      .from('orders')
      .select('total_amount, status')
      .neq('status', 'cancelled')
    
    const totalRevenue = finalStats?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0
    const ordersWithTotal = finalStats?.filter(order => (order.total_amount || 0) > 0).length || 0
    
    const summary = {
      totalProcessed: orders.length,
      fixed,
      noItems,
      totalRevenue,
      ordersWithTotal,
      totalOrders: finalStats?.length || 0
    }
    
    console.log('📈 RESUMEN:', summary)
    
    return NextResponse.json({
      success: true,
      message: 'Totales de pedidos reparados exitosamente',
      summary,
      results: results.slice(0, 20) // Solo mostrar primeros 20 resultados
    })
    
  } catch (error) {
    console.error('💥 Error durante la reparación:', error)
    return NextResponse.json(
      { 
        error: 'Error interno del servidor', 
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}
