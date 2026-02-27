import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  UpdateOrderRequest,
  OrderWithItems,
  canTransitionToStatus,
  OrderError
} from '@/lib/types/order'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    const isAdmin = profile?.role === 'admin'

    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id, product_id, product_code, product_name,
          quantity, unit_price, unit_price_with_iva,
          iva_rate, line_total, created_at
        )
      `)
      .eq('id', id)

    if (!isAdmin) {
      query = query.eq('user_id', user.id)
    }

    const { data, error } = await query.single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
      }
      console.error('Error fetching order:', error)
      return NextResponse.json({ error: 'Error al obtener pedido' }, { status: 500 })
    }

    let orderWithUser: OrderWithItems = {
      ...data,
      items: data.order_items || []
    }

    if (isAdmin) {
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('email, full_name, company_name')
        .eq('id', data.user_id)
        .single()

      orderWithUser.user = {
        id: data.user_id,
        email: userProfile?.email || '',
        profile: userProfile ? {
          full_name: userProfile.full_name,
          company_name: userProfile.company_name
        } : undefined
      }
    }

    return NextResponse.json(orderWithUser)
  } catch (error) {
    console.error('Error in GET /api/orders/[id]:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    let updateData: UpdateOrderRequest = body

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.role === 'admin'

    let orderQuery = supabase.from('orders').select('*').eq('id', id)
    if (!isAdmin) {
      orderQuery = orderQuery.eq('user_id', user.id)
    }

    const { data: currentOrder, error: fetchError } = await orderQuery.single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Error al obtener pedido' }, { status: 500 })
    }

    if (updateData.status && updateData.status !== currentOrder.status) {
      if (!isAdmin) {
        return NextResponse.json(
          { error: 'No tienes permisos para cambiar el estado del pedido' },
          { status: 403 }
        )
      }
      if (!canTransitionToStatus(currentOrder.status, updateData.status)) {
        return NextResponse.json(
          { error: `No se puede cambiar el estado de ${currentOrder.status} a ${updateData.status}` },
          { status: 400 }
        )
      }
    }

    if (!isAdmin) {
      if (currentOrder.status !== 'pending') {
        return NextResponse.json(
          { error: 'Solo se pueden modificar pedidos pendientes' },
          { status: 400 }
        )
      }

      const allowedFields: (keyof UpdateOrderRequest)[] = ['delivery_date', 'delivery_address', 'phone', 'notes']
      const filteredData: Partial<UpdateOrderRequest> = {}

      allowedFields.forEach(field => {
        if (field in updateData && updateData[field] !== undefined) {
          (filteredData as any)[field] = updateData[field]
        }
      })

      if (Object.keys(filteredData).length === 0) {
        return NextResponse.json(
          { error: 'No hay campos válidos para actualizar' },
          { status: 400 }
        )
      }

      updateData = filteredData
    }

    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        order_items (
          id, product_id, product_code, product_name,
          quantity, unit_price, unit_price_with_iva,
          iva_rate, line_total, created_at
        )
      `)
      .single()

    if (updateError) {
      console.error('Error updating order:', updateError)
      return NextResponse.json({ error: 'Error al actualizar pedido' }, { status: 500 })
    }

    const orderWithItems: OrderWithItems = {
      ...updatedOrder,
      items: updatedOrder.order_items || []
    }

    return NextResponse.json(orderWithItems)
  } catch (error) {
    console.error('Error in PUT /api/orders/[id]:', error)
    const orderError: OrderError = { type: 'server_error', message: 'Error interno del servidor' }
    return NextResponse.json({ error: orderError }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { status: newStatus } = body

    if (!newStatus) {
      return NextResponse.json({ error: 'Estado requerido' }, { status: 400 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.role === 'admin'
    const isClientCancellation = !isAdmin && newStatus === 'cancelled'

    if (!isAdmin && !isClientCancellation) {
      return NextResponse.json(
        { error: 'Solo puedes cancelar tus propios pedidos' },
        { status: 403 }
      )
    }

    let orderQuery = supabase
      .from('orders')
      .select(`*, order_items (id, product_id, quantity)`)
      .eq('id', id)

    if (isClientCancellation) {
      orderQuery = orderQuery.eq('user_id', user.id)
    }

    const { data: currentOrder, error: fetchError } = await orderQuery.single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Error al obtener pedido' }, { status: 500 })
    }

    if (!canTransitionToStatus(currentOrder.status, newStatus)) {
      return NextResponse.json(
        { error: `No se puede cambiar el estado de ${currentOrder.status} a ${newStatus}` },
        { status: 400 }
      )
    }

    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating order status:', updateError)
      return NextResponse.json({ error: 'Error al actualizar estado del pedido' }, { status: 500 })
    }

    const actionMessage = newStatus === 'cancelled'
      ? 'Pedido cancelado exitosamente'
      : 'Estado actualizado exitosamente'

    return NextResponse.json({ message: actionMessage, order: updatedOrder })
  } catch (error) {
    console.error('Error in PATCH /api/orders/[id]:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    const isAdmin = profile?.role === 'admin'

    let orderQuery = supabase.from('orders').select('*').eq('id', id)
    if (!isAdmin) {
      orderQuery = orderQuery.eq('user_id', user.id)
    }

    const { data: currentOrder, error: fetchError } = await orderQuery.single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Error al obtener pedido' }, { status: 500 })
    }

    if (currentOrder.status === 'delivered' || currentOrder.status === 'cancelled') {
      return NextResponse.json(
        { error: 'No se puede cancelar un pedido entregado o ya cancelado' },
        { status: 400 }
      )
    }

    if (!isAdmin && currentOrder.status !== 'pending') {
      return NextResponse.json(
        { error: 'Solo se pueden cancelar pedidos pendientes' },
        { status: 400 }
      )
    }

    const { data: cancelledOrder, error: cancelError } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (cancelError) {
      console.error('Error cancelling order:', cancelError)
      return NextResponse.json({ error: 'Error al cancelar pedido' }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Pedido cancelado correctamente',
      order: cancelledOrder
    })
  } catch (error) {
    console.error('Error in DELETE /api/orders/[id]:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
