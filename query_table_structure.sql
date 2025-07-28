-- =============================================
-- Query: Mostrar estructura de tablas orders y order_items
-- =============================================

-- TABLA ORDERS
SELECT 
    '=== TABLA ORDERS ===' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- TABLA ORDER_ITEMS  
SELECT 
    '=== TABLA ORDER_ITEMS ===' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'order_items' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- MOSTRAR POLÍTICAS RLS EXISTENTES
SELECT 
    '=== POLÍTICAS RLS ===' as info,
    tablename,
    policyname,
    cmd as operacion
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('orders', 'order_items');

-- VERIFICAR SI RLS ESTÁ HABILITADO
SELECT 
    '=== ESTADO RLS ===' as info,
    tablename,
    rowsecurity as rls_habilitado
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('orders', 'order_items'); 