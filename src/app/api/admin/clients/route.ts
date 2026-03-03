import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/admin/clients
 * Lista todos los clientes con sus perfiles (solo admin)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar que sea admin
    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!adminProfile || adminProfile.role !== 'admin') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    // Parámetros de búsqueda
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''
    const hasDeliveryDays = searchParams.get('hasDeliveryDays') // 'true' | 'false' | null

    // Obtener todos los perfiles
    let query = supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (role) {
      query = query.eq('role', role)
    }

    if (search) {
      query = query.or(
        `email.ilike.%${search}%,full_name.ilike.%${search}%,company_name.ilike.%${search}%,razon_social.ilike.%${search}%`
      )
    }

    const { data: profiles, error: profilesError } = await query

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError)
      return NextResponse.json({ error: 'Error al obtener clientes' }, { status: 500 })
    }

    // Filtrar por delivery_days si se solicita
    let filteredProfiles = profiles || []
    if (hasDeliveryDays === 'true') {
      filteredProfiles = filteredProfiles.filter(
        (p: any) => p.delivery_days && p.delivery_days.length > 0
      )
    } else if (hasDeliveryDays === 'false') {
      filteredProfiles = filteredProfiles.filter(
        (p: any) => !p.delivery_days || p.delivery_days.length === 0
      )
    }

    return NextResponse.json({
      clients: filteredProfiles,
      total: filteredProfiles.length
    })
  } catch (error) {
    console.error('Error in GET /api/admin/clients:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
