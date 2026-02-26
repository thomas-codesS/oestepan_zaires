import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar que sea admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    // Obtener parámetros de búsqueda
    const { searchParams } = new URL(request.url)
    const rawSearch = searchParams.get('search') || ''
    // Sanitizar: eliminar caracteres especiales de PostgREST filter syntax
    const search = rawSearch.replace(/[%_\\().,]/g, '').trim()

    // Obtener todos los clientes
    let query = supabase
      .from('profiles')
      .select('id, email, full_name, company_name, razon_social, delivery_days, is_active, created_at')
      .eq('role', 'cliente')
      .order('company_name', { ascending: true, nullsFirst: false })

    if (search) {
      query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%,company_name.ilike.%${search}%`)
    }

    const { data: clients, error } = await query

    if (error) {
      console.error('Error obteniendo clientes:', error)
      return NextResponse.json({ error: 'Error al obtener clientes' }, { status: 500 })
    }

    return NextResponse.json({ clients: clients || [] })
  } catch (error) {
    console.error('Error en GET /api/admin/clients:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
