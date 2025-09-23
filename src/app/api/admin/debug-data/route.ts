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

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    console.log('🔍 Revisando estructura de datos...')

    // 1. Verificar pedidos
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .limit(3)

    console.log('Orders:', orders)
    console.log('Orders error:', ordersError)

    // 2. Verificar profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(3)

    console.log('Profiles:', profiles)
    console.log('Profiles error:', profilesError)

    // 3. Si hay orders, intentar obtener profile de uno
    let orderWithProfile = null
    if (orders && orders.length > 0) {
      const firstOrder = orders[0]
      console.log('First order user_id:', firstOrder.user_id)
      
      const { data: userProfile, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', firstOrder.user_id)
        .single()
      
      console.log('User profile:', userProfile)
      console.log('User error:', userError)
      
      orderWithProfile = {
        order: firstOrder,
        profile: userProfile
      }
    }

    return NextResponse.json({
      message: 'Debug completado - revisar console',
      summary: {
        ordersCount: orders?.length || 0,
        profilesCount: profiles?.length || 0,
        hasOrders: !!orders?.length,
        hasProfiles: !!profiles?.length,
        orderWithProfile
      }
    })
    
  } catch (error) {
    console.error('Error en debug:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
