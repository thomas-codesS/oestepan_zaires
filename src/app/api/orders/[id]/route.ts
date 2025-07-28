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
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Obtener perfil del usuario
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.role === 'admin'

    // Construir query con restricciones según el rol
    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          product_id,
          product_code,
          product_name,
          quantity,
          unit_price,
          unit_price_with_iva,
          iva_rate,
          line_total,
          created_at
        )
      `)
      .eq('id', id)

    // Si no es admin, solo puede ver sus propios pedidos
    if (!isAdmin) {
      query = query.eq('user_id', user.id)
    }

    const { data, error } = await query.single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Pedido no encontrado' },
          { status: 404 }
        )
      }
      console.error('Error fetching order:', error)
      return NextResponse.json(
        { error: 'Error al obtener pedido' },
        { status: 500 }
      )
    }

    // Si es admin, obtener información del usuario del pedido
    let orderWithUser: OrderWithItems = {
      ...data,
      items: data.order_items || []
    }

    if (isAdmin) {
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('full_name, company_name')
        .eq('id', data.user_id)
        .single()

      const { data: authUser } = await supabase.auth.admin.getUserById(data.user_id)

      orderWithUser.user = {
        id: data.user_id,
        email: authUser.user?.email || '',
        profile: userProfile || undefined
      }
    }

    return NextResponse.json(orderWithUser)
  } catch (error) {
    console.error('Error in GET /api/orders/[id]:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('Authenticated user ID:', user?.id);
    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json()
    let updateData: UpdateOrderRequest = body

    // Obtener perfil del usuario
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.role === 'admin'

    // Obtener el pedido actual
    let orderQuery = supabase
      .from('orders')
      .select('*')
      .eq('id', id)

    // Si no es admin, solo puede actualizar sus propios pedidos
    if (!isAdmin) {
      orderQuery = orderQuery.eq('user_id', user.id)
    }

    const { data: currentOrder, error: fetchError } = await orderQuery.single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Pedido no encontrado' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: 'Error al obtener pedido' },
        { status: 500 }
      )
    }

    // Validar transición de estado si se está actualizando el estado
    if (updateData.status && updateData.status !== currentOrder.status) {
      // Solo admins pueden cambiar el estado
      if (!isAdmin) {
        return NextResponse.json(
          { error: 'No tienes permisos para cambiar el estado del pedido' },
          { status: 403 }
        )
      }

      // Validar que la transición de estado es válida
      if (!canTransitionToStatus(currentOrder.status, updateData.status)) {
        return NextResponse.json(
          { error: `No se puede cambiar el estado de ${currentOrder.status} a ${updateData.status}` },
          { status: 400 }
        )
      }
    }

    // Para clientes, solo pueden actualizar ciertos campos y solo si el pedido está pendiente
    if (!isAdmin) {
      if (currentOrder.status !== 'pending') {
        return NextResponse.json(
          { error: 'Solo se pueden modificar pedidos pendientes' },
          { status: 400 }
        )
      }

      // Filtrar campos que el cliente puede actualizar
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

    // Actualizar el pedido
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
          id,
          product_id,
          product_code,
          product_name,
          quantity,
          unit_price,
          unit_price_with_iva,
          iva_rate,
          line_total,
          created_at
        )
      `)
      .single()

    if (updateError) {
      console.error('Error updating order:', updateError)
      return NextResponse.json(
        { error: 'Error al actualizar pedido' },
        { status: 500 }
      )
    }

    const orderWithItems: OrderWithItems = {
      ...updatedOrder,
      items: updatedOrder.order_items || []
    }

    return NextResponse.json(orderWithItems)
  } catch (error) {
    console.error('Error in PUT /api/orders/[id]:', error)
    
    const orderError: OrderError = {
      type: 'server_error',
      message: 'Error interno del servidor'
    }
    
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
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { status: newStatus } = body

    if (!newStatus) {
      return NextResponse.json(
        { error: 'Estado requerido' },
        { status: 400 }
      )
    }

    // Obtener perfil del usuario para verificar si es admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.role === 'admin'

    // Los clientes pueden cancelar sus propios pedidos, pero solo admins pueden cambiar a otros estados
    const isClientCancellation = !isAdmin && newStatus === 'cancelled'
    
    if (!isAdmin && !isClientCancellation) {
      return NextResponse.json(
        { error: 'Solo puedes cancelar tus propios pedidos' },
        { status: 403 }
      )
    }

    // Obtener el pedido actual con items para restaurar stock si es cancelación
    let orderQuery = supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          product_id,
          quantity
        )
      `)
      .eq('id', id)

    // Si es cliente cancelando, solo puede cancelar sus propios pedidos
    if (isClientCancellation) {
      orderQuery = orderQuery.eq('user_id', user.id)
    }

    const { data: currentOrder, error: fetchError } = await orderQuery.single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Pedido no encontrado' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: 'Error al obtener pedido' },
        { status: 500 }
      )
    }

    // Validar que la transición de estado es válida
    if (!canTransitionToStatus(currentOrder.status, newStatus)) {
      return NextResponse.json(
        { error: `No se puede cambiar el estado de ${currentOrder.status} a ${newStatus}` },
        { status: 400 }
      )
    }

    // Actualizar solo el estado
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
      return NextResponse.json(
        { error: 'Error al actualizar estado del pedido' },
        { status: 500 }
      )
    }

    // Si se canceló el pedido, restaurar stock de productos
    if (newStatus === 'cancelled' && currentOrder.order_items && currentOrder.order_items.length > 0) {
      console.log('🔄 Restaurando stock para pedido cancelado...')
      
      for (const item of currentOrder.order_items) {
        try {
          // Obtener stock actual del producto
          const { data: product } = await supabase
            .from('products')
            .select('stock_quantity')
            .eq('id', item.product_id)
            .single()

          if (product) {
            // Restaurar la cantidad cancelada al stock
            const newStock = product.stock_quantity + item.quantity
            
            await supabase
              .from('products')
              .update({ stock_quantity: newStock })
              .eq('id', item.product_id)

            console.log(`✅ Stock restaurado para producto ${item.product_id}: +${item.quantity} (total: ${newStock})`)
          }
        } catch (stockError) {
          console.error(`⚠️ Error restaurando stock para producto ${item.product_id}:`, stockError)
          // Continuar con otros productos aunque falle uno
        }
      }
    }

    const actionMessage = newStatus === 'cancelled' 
      ? 'Pedido cancelado exitosamente'
      : 'Estado actualizado exitosamente'

    return NextResponse.json({
      message: actionMessage,
      order: updatedOrder
    })
  } catch (error) {
    console.error('Error in PATCH /api/orders/[id]:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Obtener perfil del usuario
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.role === 'admin'

    // Obtener el pedido actual
    let orderQuery = supabase
      .from('orders')
      .select('*')
      .eq('id', id)

    // Si no es admin, solo puede cancelar sus propios pedidos
    if (!isAdmin) {
      orderQuery = orderQuery.eq('user_id', user.id)
    }

    const { data: currentOrder, error: fetchError } = await orderQuery.single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Pedido no encontrado' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: 'Error al obtener pedido' },
        { status: 500 }
      )
    }

    // Validar que se puede cancelar
    if (currentOrder.status === 'delivered' || currentOrder.status === 'cancelled') {
      return NextResponse.json(
        { error: 'No se puede cancelar un pedido entregado o ya cancelado' },
        { status: 400 }
      )
    }

    // Para clientes, solo pueden cancelar pedidos pendientes
    if (!isAdmin && currentOrder.status !== 'pending') {
      return NextResponse.json(
        { error: 'Solo se pueden cancelar pedidos pendientes' },
        { status: 400 }
      )
    }

    // Cambiar estado a cancelado en lugar de eliminar
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
      return NextResponse.json(
        { error: 'Error al cancelar pedido' },
        { status: 500 }
      )
    }

    // Restaurar stock de productos
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('product_id, quantity')
      .eq('order_id', id)

    if (orderItems) {
      for (const item of orderItems) {
        await supabase.rpc('increment_product_stock', {
          product_id: item.product_id,
          quantity: item.quantity
        })
      }
    }

    return NextResponse.json({ 
      message: 'Pedido cancelado correctamente',
      order: cancelledOrder
    })
  } catch (error) {
    console.error('Error in DELETE /api/orders/[id]:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 