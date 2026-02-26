import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clientId } = await params
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

    if (adminProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const body = await request.json()
    const { delivery_days } = body

    // Validar delivery_days
    if (!Array.isArray(delivery_days)) {
      return NextResponse.json(
        { error: 'delivery_days debe ser un array de números' },
        { status: 400 }
      )
    }

    // Validar que los valores sean días válidos (0-6, donde 0=Domingo, 6=Sábado)
    const validDays = [0, 1, 2, 3, 4, 5, 6]
    for (const day of delivery_days) {
      if (typeof day !== 'number' || !validDays.includes(day)) {
        return NextResponse.json(
          { error: `Día inválido: ${day}. Los valores válidos son 0 (Domingo) a 6 (Sábado)` },
          { status: 400 }
        )
      }
    }

    // Eliminar duplicados y ordenar
    const uniqueDays = [...new Set(delivery_days)].sort((a, b) => a - b)

    // Verificar que el cliente existe y es un cliente
    const { data: clientProfile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', clientId)
      .single()

    if (!clientProfile) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    if (clientProfile.role !== 'cliente') {
      return NextResponse.json(
        { error: 'Solo se pueden configurar días de entrega para clientes' },
        { status: 400 }
      )
    }

    // Actualizar delivery_days
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({ delivery_days: uniqueDays, updated_at: new Date().toISOString() })
      .eq('id', clientId)
      .select('id, email, full_name, company_name, delivery_days')
      .single()

    if (updateError) {
      console.error('Error actualizando delivery_days:', updateError)
      return NextResponse.json(
        { error: 'Error al actualizar los días de entrega' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Días de entrega actualizados correctamente',
      client: updatedProfile,
    })
  } catch (error) {
    console.error('Error en PATCH /api/admin/clients/[id]/delivery-days:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
