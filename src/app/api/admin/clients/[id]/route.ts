import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/admin/clients/[id]
 * Obtener un cliente específico (solo admin)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient()
    const { id } = await params

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

    // Obtener el perfil del cliente
    const { data: clientProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()

    if (profileError || !clientProfile) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    return NextResponse.json(clientProfile)
  } catch (error) {
    console.error('Error in GET /api/admin/clients/[id]:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

/**
 * PATCH /api/admin/clients/[id]
 * Actualizar datos de un cliente (solo admin)
 * Permite modificar: delivery_days, is_active, role, full_name, company_name, razon_social
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient()
    const { id } = await params

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

    // Verificar que el cliente existe
    const { data: existingProfile, error: existError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', id)
      .single()

    if (existError || !existingProfile) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    const body = await request.json()

    // Construir objeto de actualización solo con campos permitidos
    const updateData: Record<string, any> = {}

    if (body.delivery_days !== undefined) {
      // Validar que sea un array de números válidos (0-6, donde 0=Domingo)
      if (!Array.isArray(body.delivery_days)) {
        return NextResponse.json({ error: 'delivery_days debe ser un array' }, { status: 400 })
      }
      const validDays = body.delivery_days.every(
        (d: any) => typeof d === 'number' && d >= 0 && d <= 6
      )
      if (!validDays && body.delivery_days.length > 0) {
        return NextResponse.json(
          { error: 'Los días de entrega deben ser números entre 0 (Domingo) y 6 (Sábado)' },
          { status: 400 }
        )
      }
      updateData.delivery_days = body.delivery_days
    }

    if (body.is_active !== undefined) {
      updateData.is_active = Boolean(body.is_active)
    }

    if (body.full_name !== undefined) {
      updateData.full_name = body.full_name
    }

    if (body.company_name !== undefined) {
      updateData.company_name = body.company_name
    }

    if (body.razon_social !== undefined) {
      updateData.razon_social = body.razon_social
    }

    if (body.role !== undefined) {
      if (!['admin', 'cliente'].includes(body.role)) {
        return NextResponse.json({ error: 'Rol inválido' }, { status: 400 })
      }
      // No permitir que un admin se quite el rol a sí mismo
      if (id === user.id && body.role !== 'admin') {
        return NextResponse.json(
          { error: 'No puedes cambiar tu propio rol de administrador' },
          { status: 400 }
        )
      }
      updateData.role = body.role
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No se proporcionaron datos para actualizar' }, { status: 400 })
    }

    updateData.updated_at = new Date().toISOString()

    // Actualizar el perfil
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating profile:', updateError)
      return NextResponse.json({ error: 'Error al actualizar el cliente' }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Cliente actualizado exitosamente',
      client: updatedProfile
    })
  } catch (error) {
    console.error('Error in PATCH /api/admin/clients/[id]:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
