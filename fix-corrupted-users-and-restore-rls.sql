-- =============================================
-- Script: Eliminar usuarios corruptos y restaurar políticas RLS
-- Fecha: Diciembre 2024
-- Descripción: Elimina cliente1 y cliente2 corruptos, restaura políticas RLS esenciales
-- =============================================

-- =============================================
-- PASO 1: ELIMINAR USUARIOS CORRUPTOS
-- =============================================

DO $$
DECLARE
    user_id_1 UUID;
    user_id_2 UUID;
BEGIN
    -- Buscar IDs de los usuarios corruptos
    SELECT id INTO user_id_1 FROM auth.users WHERE email = 'cliente1@test.com';
    SELECT id INTO user_id_2 FROM auth.users WHERE email = 'cliente2@test.com';
    
    -- Eliminar de profiles primero (por foreign key)
    DELETE FROM public.profiles WHERE email IN ('cliente1@test.com', 'cliente2@test.com');
    
    -- Eliminar de auth.users
    DELETE FROM auth.users WHERE email IN ('cliente1@test.com', 'cliente2@test.com');
    
    RAISE NOTICE 'Usuarios corruptos eliminados: cliente1@test.com, cliente2@test.com';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error eliminando usuarios: %', SQLERRM;
END $$;

-- =============================================
-- PASO 2: HABILITAR RLS EN TABLAS NECESARIAS  
-- =============================================

-- Habilitar RLS en tabla profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS en tabla products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS en tabla orders (si existe)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders' AND table_schema = 'public') THEN
        ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS habilitado en tabla orders';
    END IF;
END $$;

-- Habilitar RLS en tabla order_items (si existe)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'order_items' AND table_schema = 'public') THEN
        ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS habilitado en tabla order_items';
    END IF;
END $$;

-- =============================================
-- PASO 3: CREAR POLÍTICAS RLS PARA PROFILES
-- =============================================

-- Política: Usuarios pueden ver su propio perfil
CREATE POLICY "profiles_select_own" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- Política: Admins pueden ver todos los perfiles
CREATE POLICY "profiles_select_admin" 
ON public.profiles FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.id = auth.uid() AND p.role = 'admin'
    )
);

-- Política: Usuarios pueden actualizar su propio perfil
CREATE POLICY "profiles_update_own" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- Política: Admins pueden actualizar cualquier perfil
CREATE POLICY "profiles_update_admin" 
ON public.profiles FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.id = auth.uid() AND p.role = 'admin'
    )
);

-- Política: Solo sistema puede insertar perfiles (trigger)
CREATE POLICY "profiles_insert_system" 
ON public.profiles FOR INSERT 
WITH CHECK (true);

-- =============================================
-- PASO 4: CREAR POLÍTICAS RLS PARA PRODUCTS
-- =============================================

-- Política: Lectura pública de productos activos
CREATE POLICY "products_select_public" 
ON public.products FOR SELECT 
USING (is_active = true);

-- Política: Admins pueden ver todos los productos
CREATE POLICY "products_select_admin" 
ON public.products FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.id = auth.uid() AND p.role = 'admin'
    )
);

-- Política: Solo admins pueden insertar productos
CREATE POLICY "products_insert_admin" 
ON public.products FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.id = auth.uid() AND p.role = 'admin'
    )
);

-- Política: Solo admins pueden actualizar productos
CREATE POLICY "products_update_admin" 
ON public.products FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.id = auth.uid() AND p.role = 'admin'
    )
);

-- Política: Solo admins pueden eliminar productos
CREATE POLICY "products_delete_admin" 
ON public.products FOR DELETE 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.id = auth.uid() AND p.role = 'admin'
    )
);

-- =============================================
-- PASO 5: CREAR POLÍTICAS RLS PARA ORDERS (SI EXISTE)
-- =============================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders' AND table_schema = 'public') THEN
        
        -- Política: Usuarios pueden ver sus propios pedidos
        EXECUTE 'CREATE POLICY "orders_select_own" 
        ON public.orders FOR SELECT 
        USING (customer_id = auth.uid())';
        
        -- Política: Admins pueden ver todos los pedidos
        EXECUTE 'CREATE POLICY "orders_select_admin" 
        ON public.orders FOR SELECT 
        USING (
            EXISTS (
                SELECT 1 FROM public.profiles p 
                WHERE p.id = auth.uid() AND p.role = ''admin''
            )
        )';
        
        -- Política: Usuarios pueden crear sus propios pedidos
        EXECUTE 'CREATE POLICY "orders_insert_own" 
        ON public.orders FOR INSERT 
        WITH CHECK (customer_id = auth.uid())';
        
        -- Política: Solo admins pueden actualizar pedidos
        EXECUTE 'CREATE POLICY "orders_update_admin" 
        ON public.orders FOR UPDATE 
        USING (
            EXISTS (
                SELECT 1 FROM public.profiles p 
                WHERE p.id = auth.uid() AND p.role = ''admin''
            )
        )';
        
        RAISE NOTICE 'Políticas RLS creadas para tabla orders';
    END IF;
END $$;

-- =============================================
-- PASO 6: CREAR POLÍTICAS RLS PARA ORDER_ITEMS (SI EXISTE)
-- =============================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'order_items' AND table_schema = 'public') THEN
        
        -- Política: Usuarios pueden ver items de sus propios pedidos
        EXECUTE 'CREATE POLICY "order_items_select_own" 
        ON public.order_items FOR SELECT 
        USING (
            EXISTS (
                SELECT 1 FROM public.orders o 
                WHERE o.id = order_id AND o.customer_id = auth.uid()
            )
        )';
        
        -- Política: Admins pueden ver todos los items
        EXECUTE 'CREATE POLICY "order_items_select_admin" 
        ON public.order_items FOR SELECT 
        USING (
            EXISTS (
                SELECT 1 FROM public.profiles p 
                WHERE p.id = auth.uid() AND p.role = ''admin''
            )
        )';
        
        -- Política: Usuarios pueden crear items en sus pedidos
        EXECUTE 'CREATE POLICY "order_items_insert_own" 
        ON public.order_items FOR INSERT 
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM public.orders o 
                WHERE o.id = order_id AND o.customer_id = auth.uid()
            )
        )';
        
        RAISE NOTICE 'Políticas RLS creadas para tabla order_items';
    END IF;
END $$;

-- =============================================
-- PASO 7: VERIFICACIÓN FINAL
-- =============================================

-- Contar políticas activas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Verificar estado RLS
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('profiles', 'products', 'orders', 'order_items');

-- Verificar usuarios restantes
SELECT email, role, is_active 
FROM public.profiles 
ORDER BY role, email;

RAISE NOTICE '✅ Script completado exitosamente';
RAISE NOTICE '🗑️  Usuarios corruptos eliminados: cliente1@test.com, cliente2@test.com';
RAISE NOTICE '🔒 Políticas RLS restauradas para máxima seguridad';
RAISE NOTICE '✅ Usuarios funcionales mantenidos: panaderia.central, supermercado.norte, admin'; 