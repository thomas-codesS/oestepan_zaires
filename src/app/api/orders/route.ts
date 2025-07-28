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

    // Obtener información de usuarios únicos
    const userIds = [...new Set(orders?.map(order => order.user_id) || [])];
    const { data: usersData } = await supabase
      .from('profiles')
      .select('id, email, full_name, company_name')
      .in('id', userIds);

    // Crear mapa de usuarios para búsqueda rápida
    const usersMap = new Map(usersData?.map(user => [user.id, user]) || []);

    // Transformar datos al formato esperado
    const ordersWithItems: OrderWithItems[] = (orders || []).map((order: any) => {
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
    // Obtener la sesión para acceder a detalles del token cuando sea necesario
    const { data: { session } } = await supabase.auth.getSession();
    if (authError || !user) {
      console.error('Auth error:', authError);
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Logs para depurar
    console.log('Authenticated user ID:', user.id);
    console.log('JWT sub:', session?.user?.id);
    console.log('JWT token:', session?.access_token);
    console.log('Cookies:', cookieStore.getAll().map(c => ({ name: c.name, value: c.value })));

    const body = await request.json();
    const orderData: CreateOrderRequest = body;

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

      if (product.stock_quantity < item.quantity) {
        return NextResponse.json(
          { error: `Stock insuficiente para ${item.product_name}. Disponible: ${product.stock_quantity}` },
          { status: 400 }
        );
      }
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

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      await supabase.from('orders').delete().eq('id', order.id);
      return NextResponse.json(
        { error: 'Error al crear items del pedido' },
        { status: 500 }
      );
    }

    for (const item of orderData.items) {
      const product = products?.find(p => p.id === item.product_id);
      if (product) {
        await supabase
          .from('products')
          .update({ stock_quantity: product.stock_quantity - item.quantity })
          .eq('id', item.product_id);
      }
    }

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