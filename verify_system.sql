-- Script de verificación del sistema Oeste Pan
-- 
-- Ejecuta esto para verificar que todo esté funcionando correctamente

-- 1. Verificar que las tablas principales existen
SELECT 'Verificando tablas...' as status;

SELECT 
  table_name,
  CASE WHEN table_name IN ('products', 'profiles', 'orders', 'order_items') 
    THEN '✅ OK' 
    ELSE '❌ FALTA' 
  END as estado
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('products', 'profiles', 'orders', 'order_items')
ORDER BY table_name;

-- 2. Verificar productos de ejemplo
SELECT 'Verificando productos...' as status;

SELECT 
  COUNT(*) as total_productos,
  COUNT(CASE WHEN is_active = true THEN 1 END) as productos_activos,
  COUNT(CASE WHEN is_active = false THEN 1 END) as productos_inactivos
FROM products;

-- 3. Verificar usuarios y perfiles
SELECT 'Verificando usuarios...' as status;

SELECT 
  p.role,
  COUNT(*) as cantidad,
  STRING_AGG(p.email, ', ') as emails
FROM profiles p
GROUP BY p.role
ORDER BY p.role;

-- 4. Verificar pedidos (si existen)
SELECT 'Verificando pedidos...' as status;

SELECT 
  COUNT(*) as total_pedidos,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pendientes,
  COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmados,
  COUNT(CASE WHEN status = 'ready' THEN 1 END) as listos,
  COUNT(CASE WHEN status = 'delivered' THEN 1 END) as entregados
FROM orders;

-- 5. Verificar relaciones (JOIN entre orders y profiles)
SELECT 'Verificando relaciones...' as status;

SELECT 
  'Orders-Profiles JOIN' as relacion,
  COUNT(*) as registros_encontrados
FROM orders o
LEFT JOIN profiles p ON o.user_id = p.id;

-- 6. Verificar funciones helper
SELECT 'Verificando funciones helper...' as status;

SELECT 
  routine_name,
  '✅ Existe' as estado
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('get_orders_with_profiles', 'get_orders_by_day')
ORDER BY routine_name;

-- 7. Test de función get_orders_with_profiles (solo para admin)
SELECT 'Probando función get_orders_with_profiles...' as status;

-- Obtener un admin ID para probar
DO $$
DECLARE
  admin_id UUID;
BEGIN
  SELECT id INTO admin_id FROM profiles WHERE role = 'admin' LIMIT 1;
  
  IF admin_id IS NOT NULL THEN
    RAISE NOTICE 'Admin ID encontrado: %', admin_id;
    
    -- Probar la función
    PERFORM get_orders_with_profiles(5, 0, admin_id);
    RAISE NOTICE '✅ Función get_orders_with_profiles funciona correctamente';
  ELSE
    RAISE NOTICE '❌ No se encontró ningún administrador';
  END IF;
END $$;

-- 8. Resumen final
SELECT 'RESUMEN FINAL' as status;

SELECT 
  'Sistema Oeste Pan' as sistema,
  CASE 
    WHEN (SELECT COUNT(*) FROM products) > 0 
    AND (SELECT COUNT(*) FROM profiles WHERE role = 'admin') > 0
    AND (SELECT COUNT(*) FROM profiles WHERE role = 'cliente') > 0
    THEN '✅ SISTEMA OPERATIVO'
    ELSE '❌ REVISAR CONFIGURACIÓN'
  END as estado_general; 