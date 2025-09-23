-- Crear funciones faltantes y arreglar totales de pedidos
-- 
-- Este script crea las funciones que faltan y recalcula los totales

-- 1. Crear función get_orders_with_profiles
CREATE OR REPLACE FUNCTION get_orders_with_profiles(
  limit_val INTEGER DEFAULT 10,
  offset_val INTEGER DEFAULT 0,
  admin_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  status TEXT,
  total_amount DECIMAL,
  delivery_date DATE,
  delivery_address TEXT,
  phone TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  user_email TEXT,
  user_full_name TEXT,
  user_company_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar que el usuario que llama sea admin
  IF admin_user_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = admin_user_id 
      AND profiles.role = 'admin'
    ) THEN
      RAISE EXCEPTION 'Access denied: Admin role required';
    END IF;
  END IF;

  RETURN QUERY
  SELECT 
    o.id,
    o.user_id,
    o.status,
    o.total_amount,
    o.delivery_date,
    o.delivery_address,
    o.phone,
    o.notes,
    o.created_at,
    o.updated_at,
    p.email as user_email,
    p.full_name as user_full_name,
    p.company_name as user_company_name
  FROM orders o
  LEFT JOIN profiles p ON o.user_id = p.id
  ORDER BY o.created_at DESC
  LIMIT limit_val
  OFFSET offset_val;
END;
$$;

-- 2. Crear función get_orders_by_day
CREATE OR REPLACE FUNCTION get_orders_by_day(
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE DEFAULT CURRENT_DATE,
  admin_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  order_date DATE,
  order_count INTEGER,
  total_revenue DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar que el usuario que llama sea admin
  IF admin_user_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = admin_user_id 
      AND profiles.role = 'admin'
    ) THEN
      RAISE EXCEPTION 'Access denied: Admin role required';
    END IF;
  END IF;

  RETURN QUERY
  SELECT 
    DATE(o.created_at) as order_date,
    COUNT(o.id)::INTEGER as order_count,
    COALESCE(SUM(o.total_amount), 0) as total_revenue
  FROM orders o
  WHERE DATE(o.created_at) BETWEEN start_date AND end_date
    AND o.status != 'cancelled'
  GROUP BY DATE(o.created_at)
  ORDER BY order_date DESC;
END;
$$;

-- 3. Recalcular totales de pedidos que estén incorrectos
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
  HAVING COUNT(oi.id) > 0 AND (o.total_amount IS NULL OR o.total_amount = 0 OR o.total_amount != COALESCE(SUM(oi.line_total), 0))
);

-- 4. Para pedidos sin items, establecer total en 0
UPDATE orders 
SET total_amount = 0
WHERE id IN (
  SELECT o.id 
  FROM orders o
  LEFT JOIN order_items oi ON o.id = oi.order_id
  GROUP BY o.id
  HAVING COUNT(oi.id) = 0
) AND (total_amount IS NULL OR total_amount != 0);

-- 5. Mostrar resumen de lo que se arregló
SELECT 'RESUMEN DE REPARACIONES' as status;

SELECT 
  COUNT(*) as total_pedidos,
  COUNT(CASE WHEN total_amount > 0 THEN 1 END) as con_total_positivo,
  COUNT(CASE WHEN total_amount = 0 THEN 1 END) as con_total_cero,
  COUNT(CASE WHEN total_amount IS NULL THEN 1 END) as con_total_null,
  COALESCE(SUM(total_amount), 0) as ingresos_totales
FROM orders 
WHERE status != 'cancelled';

SELECT 'FUNCIONES CREADAS EXITOSAMENTE' as status;
