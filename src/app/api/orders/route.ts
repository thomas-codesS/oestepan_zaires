import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import {
  CreateOrderRequest,
  OrderFilters,
  OrderListResponse,
  OrderWithItems,
  OrderError
} from '@/lib/types/order'
import { getDeliveryWindow, formatDeliveryDateForApi } from '@/lib/utils/delivery-schedule'

// Método GET para obtener lista de pedidos
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET /api/orders - Usando estructura REAL de BD...')
    
    // Obtener cookies de manera asíncrona
    const cookieStore = await cookies();
    
    // Crear cliente Supabase
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Auth error:', authError);
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    console.log('✅ Usuario autenticado:', user.id);

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;
    const created_at_from = searchParams.get('created_at_from') || undefined;
    const created_at_to = searchParams.get('created_at_to') || undefined;

    console.log('📊 Parámetros:', { page, limit, status, search, created_at_from, created_at_to });

    // Obtener perfil del usuario para determinar permisos
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    console.log('👤 Rol del usuario:', profile?.role);

    // Construir consulta base - usar estructura real de BD
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
      `, { count: 'exact' });

    // Si es cliente, solo ver sus propios pedidos
    if (profile?.role !== 'admin') {
      query = query.eq('user_id', user.id);
    }

    // Aplicar filtros
    if (status) {
      query = query.eq('status', status);
    }

    if (search) {
      // Buscar en email de usuario o nombre de compañía  
      query = query.or(`profiles.email.ilike.%${search}%,profiles.company_name.ilike.%${search}%,id.ilike.%${search}%`);
    }

    if (created_at_from) {
      query = query.gte('created_at', created_at_from);
    }

    if (created_at_to) {
      query = query.lte('created_at', created_at_to);
    }

    // Ordenar por fecha de creación (más recientes primero)
    query = query.order('created_at', { ascending: false });

    // Aplicar paginación y obtener count
    const offset = (page - 1) * limit;
    const { data: orders, error, count: totalCount } = await query
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('❌ Error obteniendo pedidos:', error);
      return NextResponse.json(
        { error: 'Error al obtener pedidos' },
        { status: 500 }
      );
    }

    console.log(`✅ Encontrados ${orders?.length || 0} pedidos`);
    
    // Debug: Verificar estructura de los primeros pedidos
    if (orders && orders.length > 0) {
      console.log('🔍 Debug primer pedido crudo:', JSON.stringify(orders[0], null, 2));
      console.log('📦 Items del primer pedido:', orders[0].order_items);
      
      // Si no hay order_items, intentar obtenerlos manualmente
      if (!orders[0].order_items || orders[0].order_items.length === 0) {
        console.log('⚠️ No se encontraron order_items en la consulta automática, intentando consulta manual...');
        const { data: manualItems, error: manualError } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', orders[0].id);
        
        if (manualError) {
          console.error('❌ Error en consulta manual de order_items:', manualError);
        } else {
          console.log('🔍 Items encontrados manualmente:', manualItems?.length || 0);
          if (manualItems && manualItems.length > 0) {
            console.log('📦 Primer item manual:', manualItems[0]);
          }
        }
      }
    }

    // Obtener información de usuarios únicos
    const userIds = [...new Set(orders?.map(order => order.user_id) || [])];
    const { data: usersData } = await supabase
      .from('profiles')
      .select('id, email, full_name, company_name')
      .in('id', userIds);

    // Crear mapa de usuarios para búsqueda rápida
    const usersMap = new Map(usersData?.map(user => [user.id, user]) || []);

    // Obtener items manualmente para pedidos que no los tienen
    const ordersWithManualItems = await Promise.all((orders || []).map(async (order: any) => {
      let orderItems = order.order_items || [];
      
      // Si no hay items en la consulta automática, obtenerlos manualmente
      if (!orderItems || orderItems.length === 0) {
        console.log(`🔍 Obteniendo items manualmente para pedido ${order.id}`);
        const { data: manualItems, error: manualError } = await supabase
          .from('order_items')
          .select(`
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
          `)
          .eq('order_id', order.id);
        
        if (!manualError && manualItems) {
          orderItems = manualItems;
          console.log(`✅ Encontrados ${manualItems.length} items manualmente para pedido ${order.id}`);
        } else if (manualError) {
          console.error(`❌ Error obteniendo items manualmente para pedido ${order.id}:`, manualError);
        }
      }
      
      return { ...order, order_items: orderItems };
    }));

    // Transformar datos al formato esperado
    const ordersWithItems: OrderWithItems[] = ordersWithManualItems.map((order: any) => {
      const userData = usersMap.get(order.user_id);
      
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
          id: item.id,
          order_id: order.id,
          product_id: item.product_id,
          product_code: item.product_code,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          unit_price_with_iva: item.unit_price_with_iva,
          iva_rate: item.iva_rate,
          line_total: item.line_total,
          created_at: item.created_at
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
    });

    const totalPages = Math.ceil((totalCount || 0) / limit);

    const response: OrderListResponse = {
      orders: ordersWithItems,
      total: totalCount || 0,
      page,
      limit,
      totalPages
    };

    console.log('🎉 Respuesta preparada:', { total: totalCount, page, totalPages });
    
    // Debug: Verificar estructura final
    if (ordersWithItems.length > 0) {
      console.log('🔍 Debug primer pedido transformado:', {
        id: ordersWithItems[0].id,
        total_amount: ordersWithItems[0].total_amount,
        items_count: ordersWithItems[0].items?.length || 0,
        first_item: ordersWithItems[0].items?.[0] || null
      });
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('💥 Error en GET /api/orders:', error);
    
    const orderError: OrderError = {
      type: 'server_error',
      message: 'Error interno del servidor'
    };
    
    return NextResponse.json({ error: orderError }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Obtener cookies de manera asíncrona
    const cookieStore = await cookies();
    
    // Crear cliente Supabase
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    // Verificar autenticación
    // Obtener usuario autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Auth error:', authError);
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Log seguro (sin datos sensibles)
    console.log('Authenticated user ID:', user.id);

    const body = await request.json();
    const orderData: CreateOrderRequest = body;

    // Obtener perfil del usuario para validar días de entrega y rol
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, delivery_days')
      .eq('id', user.id)
      .single();

    const isAdmin = profile?.role === 'admin';

    // Validar ventana de pedido (solo para clientes, no para admins)
    if (!isAdmin) {
      const deliveryDays: number[] = profile?.delivery_days ?? [];

      if (deliveryDays.length === 0) {
        return NextResponse.json(
          { error: 'Tu cuenta no tiene días de entrega configurados. Contactá al administrador.' },
          { status: 400 }
        );
      }

      const deliveryWindow = getDeliveryWindow(deliveryDays);

      if (!deliveryWindow.isOpen) {
        return NextResponse.json(
          { error: 'El horario de pedidos está cerrado. Los pedidos se reciben hasta las 12:00 hs del día habilitado.' },
          { status: 400 }
        );
      }

      // Calcular la fecha de entrega esperada y sobreescribir la del cliente (no confiamos en el cliente)
      const expectedDeliveryDate = deliveryWindow.deliveryDate
        ? formatDeliveryDateForApi(deliveryWindow.deliveryDate)
        : null;

      if (expectedDeliveryDate) {
        // Forzar la fecha de entrega correcta (no depender del valor enviado por el cliente)
        orderData.delivery_date = expectedDeliveryDate;

        // Verificar que no existe ya un pedido activo para esta fecha de entrega (no agregados)
        const { data: existingOrders } = await supabase
          .from('orders')
          .select('id')
          .eq('user_id', user.id)
          .eq('delivery_date', expectedDeliveryDate)
          .in('status', ['pending', 'confirmed', 'preparing', 'ready']);

        if (existingOrders && existingOrders.length > 0) {
          return NextResponse.json(
            {
              error:
                'Ya tenés un pedido para esta fecha de entrega. Para agregar productos, comunicáte directamente con nosotros.'
            },
            { status: 400 }
          );
        }
      }
    }

    // Validar que hay items en el pedido
    if (!orderData.items || orderData.items.length === 0) {
      return NextResponse.json(
        { error: 'El pedido debe tener al menos un producto' },
        { status: 400 }
      );
    }

    // Verificar stock de productos
    const productIds = orderData.items.map(item => item.product_id);
    const { data: products } = await supabase
      .from('products')
      .select('id, stock_quantity, is_active')
      .in('id', productIds);

    // Validar stock
    for (const item of orderData.items) {
      const product = products?.find(p => p.id === item.product_id);
      
      if (!product) {
        return NextResponse.json(
          { error: `Producto ${item.product_name} no encontrado` },
          { status: 400 }
        );
      }

      if (!product.is_active) {
        return NextResponse.json(
          { error: `Producto ${item.product_name} no está disponible` },
          { status: 400 }
        );
      }

      // Stock control disabled - no validation needed
    }

    // Calcular total basado en items
    const total_amount = orderData.items.reduce((sum, item) => 
      sum + (item.quantity * item.unit_price_with_iva), 0
    );

    console.log('✅ Creando pedido con estructura REAL de BD...');
    console.log('📝 Datos del pedido:', {
      user_id: user.id,
      status: 'pending',
      total_amount,
      delivery_date: orderData.delivery_date || null,
      delivery_address: orderData.delivery_address || null,
      phone: orderData.phone || null,
      notes: orderData.notes || null,
      items_count: orderData.items?.length || 0
    });

    // Crear el pedido con TODOS los campos obligatorios
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
      .single();

    if (orderError) {
      console.error('Error creating order:', JSON.stringify(orderError, null, 2));
      return NextResponse.json(
        { error: 'Error al crear pedido', details: orderError.message },
        { status: 500 }
      );
    }

    console.log('✅ Creando order_items con TODOS los campos obligatorios...');
    
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
    }));
    
    console.log('📦 Items a insertar:', orderItems.length, 'items con todos los campos obligatorios');

    const { data: insertedItems, error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)
      .select();

    if (itemsError) {
      console.error('❌ Error creating order items:', JSON.stringify(itemsError, null, 2));
      console.error('📦 Items que se intentaron insertar:', JSON.stringify(orderItems, null, 2));
      await supabase.from('orders').delete().eq('id', order.id);
      return NextResponse.json(
        { error: 'Error al crear items del pedido', details: itemsError.message },
        { status: 500 }
      );
    }

    console.log('✅ Items insertados exitosamente:', insertedItems?.length || 0);
    if (insertedItems && insertedItems.length > 0) {
      console.log('📦 Primer item insertado:', insertedItems[0]);
    }

    // Stock control disabled - no need to update stock quantities

    console.log('🔍 Obteniendo pedido completo con estructura REAL...');
    
    const { data: completeOrder } = await supabase
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
      .eq('id', order.id)
      .single();

    console.log('🔄 Transformando datos con estructura REAL...');
    
    const orderWithItems: OrderWithItems = {
      ...completeOrder,
      items: (completeOrder.order_items || []).map((item: any) => ({
        ...item,
        order_id: order.id
        // Todos los campos ya vienen de la BD con los nombres correctos
      }))
    };
    
    console.log('✅ Pedido creado exitosamente con', orderWithItems.items.length, 'items');

    return NextResponse.json(orderWithItems, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/orders:', error);
    
    const orderError: OrderError = {
      type: 'server_error',
      message: 'Error interno del servidor'
    };
    
    return NextResponse.json({ error: orderError }, { status: 500 });
  }
}