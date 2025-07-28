-- Limpiar pedidos del administrador
-- 
-- Este script elimina los pedidos que fueron creados incorrectamente
-- asociados al usuario administrador durante las pruebas.

-- 1. Primero, ver qué pedidos tiene el administrador
SELECT 
  o.id,
  o.status,
  o.total_amount,
  o.created_at,
  p.email,
  p.full_name,
  p.role
FROM orders o
JOIN profiles p ON o.user_id = p.id
WHERE p.role = 'admin';

-- 2. Eliminar items de pedidos del administrador (se eliminan automáticamente por CASCADE)
-- 3. Eliminar pedidos del administrador
DELETE FROM orders 
WHERE user_id IN (
  SELECT id FROM profiles WHERE role = 'admin'
);

-- 4. Verificar que se eliminaron correctamente
SELECT 
  COUNT(*) as remaining_admin_orders
FROM orders o
JOIN profiles p ON o.user_id = p.id
WHERE p.role = 'admin';

-- El resultado debería ser 0

-- 5. Opcional: Ver todos los pedidos que quedan (solo clientes)
SELECT 
  o.id,
  o.status,
  o.total_amount,
  o.created_at,
  p.email,
  p.full_name,
  p.role
FROM orders o
JOIN profiles p ON o.user_id = p.id
ORDER BY o.created_at DESC; 