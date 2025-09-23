-- Función para obtener resumen de productos por fecha
CREATE OR REPLACE FUNCTION get_products_summary_by_date(target_date DATE)
RETURNS TABLE (
  product_id TEXT,
  product_name TEXT,
  product_code TEXT,
  total_quantity INTEGER,
  price NUMERIC,
  iva_rate NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id::TEXT as product_id,
    p.name as product_name,
    p.code as product_code,
    COALESCE(SUM(oi.quantity), 0)::INTEGER as total_quantity,
    p.price,
    p.iva_rate
  FROM 
    products p
  LEFT JOIN order_items oi ON oi.product_id::UUID = p.id::UUID
  LEFT JOIN orders o ON o.id = oi.order_id
  WHERE 
    (o.delivery_date = target_date OR o.delivery_date IS NULL)
    AND o.status != 'cancelled'
    AND oi.quantity > 0
  GROUP BY 
    p.id, p.name, p.code, p.price, p.iva_rate
  HAVING 
    SUM(oi.quantity) > 0
  ORDER BY 
    SUM(oi.quantity) DESC, p.name;
END;
$$;
