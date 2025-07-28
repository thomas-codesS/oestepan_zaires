-- Arreglar totales de pedidos que muestran NaN
-- 
-- Este script recalcula los totales de todos los pedidos basándose en sus items

-- 1. Primero verificar qué pedidos tienen problemas con totales
SELECT 'Verificando pedidos con totales problemáticos...' as status;

SELECT 
  o.id,
  o.total_amount,
  COUNT(oi.id) as items_count,
  COALESCE(SUM(oi.line_total), 0) as calculated_total
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, o.total_amount
HAVING o.total_amount IS NULL OR o.total_amount = 0 OR COUNT(oi.id) = 0
ORDER BY o.created_at DESC;

-- 2. Recalcular totales para pedidos que tienen items pero total incorrecto
UPDATE orders 
SET total_amount = (
  SELECT COALESCE(SUM(oi.line_total), 0)
  FROM order_items oi 
  WHERE oi.order_id = orders.id
)
WHERE id IN (
  SELECT o.id 
  FROM orders o
  LEFT JOIN order_items oi ON o.id = oi.order_id
  GROUP BY o.id, o.total_amount
  HAVING COUNT(oi.id) > 0 AND (o.total_amount IS NULL OR o.total_amount = 0)
);

-- 3. Para pedidos sin items, establecer total en 0
UPDATE orders 
SET total_amount = 0
WHERE id IN (
  SELECT o.id 
  FROM orders o
  LEFT JOIN order_items oi ON o.id = oi.order_id
  GROUP BY o.id
  HAVING COUNT(oi.id) = 0
) AND (total_amount IS NULL OR total_amount != 0);

-- 4. Verificar que se arreglaron los totales
SELECT 'Verificando totales después del arreglo...' as status;

SELECT 
  o.id,
  o.total_amount,
  COUNT(oi.id) as items_count,
  COALESCE(SUM(oi.line_total), 0) as calculated_total,
  CASE 
    WHEN COUNT(oi.id) = 0 AND o.total_amount = 0 THEN '✅ OK (Sin items)'
    WHEN COUNT(oi.id) > 0 AND o.total_amount = COALESCE(SUM(oi.line_total), 0) THEN '✅ OK'
    ELSE '❌ Revisar'
  END as estado
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, o.total_amount
ORDER BY o.created_at DESC;

-- 5. Mostrar resumen final
SELECT 'RESUMEN FINAL' as status;

SELECT 
  COUNT(*) as total_pedidos,
  COUNT(CASE WHEN total_amount > 0 THEN 1 END) as con_total_positivo,
  COUNT(CASE WHEN total_amount = 0 THEN 1 END) as con_total_cero,
  COUNT(CASE WHEN total_amount IS NULL THEN 1 END) as con_total_null
FROM orders; 