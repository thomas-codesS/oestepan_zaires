/**
 * Script para arreglar los totales de pedidos
 * Ejecutar con: node fix-orders-totals.js
 */

const { createClient } = require('@supabase/supabase-js')

// Configurar las variables de entorno manualmente
const SUPABASE_URL = 'https://kdowdfgzkhnqndhewmkw.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtkb3dkZmd6a2hucW5kaGV3bWt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5MDMzNzksImV4cCI6MjA1MDQ3OTM3OX0.dCEWYI-VZyFJklGzj7MBZvYAE_GQ5-cOdrlv9Ks1s2o'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function fixOrderTotals() {
  console.log('🔧 Iniciando reparación de totales de pedidos...')
  
  try {
    // 1. Obtener todos los pedidos con sus items
    console.log('📊 Obteniendo pedidos...')
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, total_amount')
    
    if (ordersError) {
      throw ordersError
    }
    
    console.log(`✅ Encontrados ${orders.length} pedidos`)
    
    let fixed = 0
    let noItems = 0
    
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
        } else {
          console.log(`✅ Pedido ${order.id}: ${order.total_amount || 0} → ${calculatedTotal}`)
          fixed++
        }
      }
      
      if (items.length === 0) {
        noItems++
      }
    }
    
    console.log('\n📈 RESUMEN:')
    console.log(`✅ Pedidos corregidos: ${fixed}`)
    console.log(`⚠️ Pedidos sin items: ${noItems}`)
    console.log(`📦 Total de pedidos procesados: ${orders.length}`)
    
    // 3. Mostrar estadísticas finales
    const { data: finalStats } = await supabase
      .from('orders')
      .select('total_amount, status')
      .neq('status', 'cancelled')
    
    if (finalStats) {
      const totalRevenue = finalStats.reduce((sum, order) => sum + (order.total_amount || 0), 0)
      const ordersWithTotal = finalStats.filter(order => (order.total_amount || 0) > 0).length
      
      console.log(`💰 Ingresos totales: $${totalRevenue.toFixed(2)}`)
      console.log(`📊 Pedidos con total > 0: ${ordersWithTotal}/${finalStats.length}`)
    }
    
  } catch (error) {
    console.error('💥 Error durante la reparación:', error)
  }
}

if (require.main === module) {
  fixOrderTotals()
}

module.exports = { fixOrderTotals }
