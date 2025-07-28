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

    // Obtener fechas para cálculos
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastWeek = new Date(startOfWeek.getTime() - 7 * 24 * 60 * 60 * 1000)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

    // Ejecutar consultas en paralelo
    const [
      totalOrdersResult,
      totalRevenueResult,
      pendingOrdersResult,
      completedOrdersResult,
      totalProductsResult,
      activeProductsResult,
      totalClientsResult,
      todayOrdersResult,
      thisWeekOrdersResult,
      lastWeekOrdersResult,
      thisMonthRevenueResult,
      lastMonthRevenueResult
    ] = await Promise.all([
      // Total de pedidos
      supabase
        .from('orders')
        .select('id', { count: 'exact', head: true }),
      
      // Ingresos totales
      supabase
        .from('orders')
        .select('total')
        .neq('status', 'cancelled'),
      
      // Pedidos pendientes
      supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending'),
      
      // Pedidos completados
      supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'delivered'),
      
      // Total de productos
      supabase
        .from('products')
        .select('id', { count: 'exact', head: true }),
      
      // Productos activos
      supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true),
      
      // Total de clientes
      supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'cliente'),
      
      // Pedidos de hoy
      supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', startOfToday.toISOString()),
      
      // Pedidos de esta semana
      supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', startOfWeek.toISOString()),
      
      // Pedidos de la semana pasada
      supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', startOfLastWeek.toISOString())
        .lt('created_at', startOfWeek.toISOString()),
      
      // Ingresos de este mes
      supabase
        .from('orders')
        .select('total')
        .gte('created_at', startOfMonth.toISOString())
        .neq('status', 'cancelled'),
      
      // Ingresos del mes pasado
      supabase
        .from('orders')
        .select('total')
        .gte('created_at', startOfLastMonth.toISOString())
        .lte('created_at', endOfLastMonth.toISOString())
        .neq('status', 'cancelled')
    ])

    // Calcular totales y crecimientos
    const totalOrders = totalOrdersResult.count || 0
    const totalRevenue = totalRevenueResult.data?.reduce((sum, order) => sum + (order.total || 0), 0) || 0
    const pendingOrders = pendingOrdersResult.count || 0
    const completedOrders = completedOrdersResult.count || 0
    const totalProducts = totalProductsResult.count || 0
    const activeProducts = activeProductsResult.count || 0
    const totalClients = totalClientsResult.count || 0
    const todayOrders = todayOrdersResult.count || 0
    
    const thisWeekOrders = thisWeekOrdersResult.count || 0
    const lastWeekOrders = lastWeekOrdersResult.count || 0
    const weeklyGrowth = lastWeekOrders > 0 
      ? ((thisWeekOrders - lastWeekOrders) / lastWeekOrders) * 100 
      : thisWeekOrders > 0 ? 100 : 0

    const thisMonthRevenue = thisMonthRevenueResult.data?.reduce((sum, order) => sum + (order.total || 0), 0) || 0
    const lastMonthRevenue = lastMonthRevenueResult.data?.reduce((sum, order) => sum + (order.total || 0), 0) || 0
    const monthlyGrowth = lastMonthRevenue > 0 
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : thisMonthRevenue > 0 ? 100 : 0

    const stats = {
      totalOrders,
      totalRevenue,
      pendingOrders,
      completedOrders,
      totalProducts,
      activeProducts,
      totalClients,
      todayOrders,
      weeklyGrowth: Math.round(weeklyGrowth * 10) / 10,
      monthlyGrowth: Math.round(monthlyGrowth * 10) / 10
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 