import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import {
  CreateOrderRequest,
  OrderWithItems,
  OrderError,
  OrderListResponse,
} from '@/lib/types/order'
import { getDeliveryWindow, formatDeliveryDateForApi } from '@/lib/utils/delivery-schedule'

async function createSupabase() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabase()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') || undefined
    const created_at_from = searchParams.get('created_at_from') || undefined
    const created_at_to = searchParams.get('created_at_to') || undefined

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
      `, { count: 'exact' })

    if (!isAdmin) {
      query = query.eq('user_id', user.id)
    }

    if (status) query = query.eq('status', status)
    if (created_at_from) query = query.gte('created_at', created_at_from)
    if (created_at_to) query = query.lte('created_at', created_at_to)

    query = query.order('created_at', { ascending: false })

    const offset = (page - 1) * limit
    const { data: orders, error, count: totalCount } = await query.range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching orders:', error)
      return NextResponse.json({ error: 'Error al obtener pedidos' }, { status: 500 })
    }

    // Batch fetch user profiles
    const userIds = [...new Set(orders?.map(order => order.user_id) || [])]
    const { data: usersData } = userIds.length > 0
      ? await supabase
        .from('profiles')
        .select('id, email, full_name, company_name')
        .in('id', userIds)
      : { data: [] }

    const usersMap = new Map(usersData?.map(u => [u.id, u]) || [])

    const ordersWithItems: OrderWithItems[] = (orders || []).map((order: any) => {
      const userData = usersMap.get(order.user_id)
      return {
        id: order.id,
        user_id: order.user_id,
        status: order.status,
        total_amount: order.total_amount,
        delivery_date: order.delivery_date,
        delivery_address: order.delivery_address,
        phone: order.phone,
        notes: order.notes,
        created_at: order.created_at,
        updated_at: order.updated_at,
        items: (order.order_items || []).map((item: any) => ({
          ...item,
          order_id: order.id
        })),
        user: {
          id: order.user_id,
          email: userData?.email || '',
          profile: {
            full_name: userData?.full_name || null,
            company_name: userData?.company_name || null
          }
        }
      }
    })

    const totalPages = Math.ceil((totalCount || 0) / limit)

    const response: OrderListResponse = {
      orders: ordersWithItems,
      total: totalCount || 0,
      page,
      limit,
      totalPages
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error in GET /api/orders:', error)
    const orderError: OrderError = { type: 'server_error', message: 'Error interno del servidor' }
    return NextResponse.json({ error: orderError }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabase()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const orderData: CreateOrderRequest = body

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, delivery_days')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.role === 'admin'

    if (!isAdmin) {
      const deliveryDays: number[] = profile?.delivery_days ?? []

      if (deliveryDays.length === 0) {
        return NextResponse.json(
          { error: 'Tu cuenta no tiene días de entrega configurados. Contactá al administrador.' },
          { status: 400 }
        )
      }

      const deliveryWindow = getDeliveryWindow(deliveryDays)

      if (!deliveryWindow.isOpen) {
        return NextResponse.json(
          { error: 'El horario de pedidos está cerrado. Los pedidos se reciben hasta las 12:00 hs del día habilitado.' },
          { status: 400 }
        )
      }

      const expectedDeliveryDate = deliveryWindow.deliveryDate
        ? formatDeliveryDateForApi(deliveryWindow.deliveryDate)
        : null

      if (expectedDeliveryDate) {
        orderData.delivery_date = expectedDeliveryDate

        const { data: existingOrders } = await supabase
          .from('orders')
          .select('id')
          .eq('user_id', user.id)
          .eq('delivery_date', expectedDeliveryDate)
          .in('status', ['pending', 'confirmed', 'preparing', 'ready'])

        if (existingOrders && existingOrders.length > 0) {
          return NextResponse.json(
            { error: 'Ya tenés un pedido para esta fecha de entrega. Para agregar productos, comunicáte directamente con nosotros.' },
            { status: 400 }
          )
        }
      }
    }

    if (!orderData.items || orderData.items.length === 0) {
      return NextResponse.json(
        { error: 'El pedido debe tener al menos un producto' },
        { status: 400 }
      )
    }

    // Verify products exist and are active
    const productIds = orderData.items.map(item => item.product_id)
    const { data: products } = await supabase
      .from('products')
      .select('id, is_active')
      .in('id', productIds)

    for (const item of orderData.items) {
      const product = products?.find(p => p.id === item.product_id)
      if (!product) {
        return NextResponse.json(
          { error: `Producto ${item.product_name} no encontrado` },
          { status: 400 }
        )
      }
      if (!product.is_active) {
        return NextResponse.json(
          { error: `Producto ${item.product_name} no está disponible` },
          { status: 400 }
        )
      }
    }

    const total_amount = orderData.items.reduce((sum, item) =>
      sum + (item.quantity * item.unit_price_with_iva), 0
    )

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        status: 'pending',
        total_amount,
        delivery_date: orderData.delivery_date || null,
        delivery_address: orderData.delivery_address || null,
        phone: orderData.phone || null,
        notes: orderData.notes || null
      })
      .select()
      .single()

    if (orderError) {
      console.error('Error creating order:', orderError)
      return NextResponse.json(
        { error: 'Error al crear pedido', details: orderError.message },
        { status: 500 }
      )
    }

    const orderItems = orderData.items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      product_code: item.product_code || 'TEMP-CODE',
      product_name: item.product_name || 'Producto sin nombre',
      quantity: item.quantity,
      unit_price: item.unit_price,
      unit_price_with_iva: item.unit_price_with_iva || item.unit_price * 1.21,
      iva_rate: item.iva_rate || 21,
      line_total: item.quantity * (item.unit_price_with_iva || item.unit_price * 1.21)
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      console.error('Error creating order items:', itemsError)
      await supabase.from('orders').delete().eq('id', order.id)
      return NextResponse.json(
        { error: 'Error al crear items del pedido', details: itemsError.message },
        { status: 500 }
      )
    }

    // Fetch complete order with items
    const { data: completeOrder } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id, product_id, product_code, product_name,
          quantity, unit_price, unit_price_with_iva,
          iva_rate, line_total, created_at
        )
      `)
      .eq('id', order.id)
      .single()

    const orderWithItems: OrderWithItems = {
      ...completeOrder,
      items: (completeOrder?.order_items || []).map((item: any) => ({
        ...item,
        order_id: order.id
      }))
    }

    return NextResponse.json(orderWithItems, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/orders:', error)
    const orderError: OrderError = { type: 'server_error', message: 'Error interno del servidor' }
    return NextResponse.json({ error: orderError }, { status: 500 })
  }
}
