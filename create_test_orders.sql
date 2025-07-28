-- OPCIONAL: Crear pedidos de prueba limpios
-- 
-- Este script crea algunos pedidos de ejemplo asociados a los clientes
-- (NO al administrador) para hacer pruebas.

-- Solo ejecutar si quieres datos de prueba para testing

DO $$
DECLARE
  cliente1_id UUID;
  cliente2_id UUID;
  cliente3_id UUID;
  order1_id UUID;
  order2_id UUID;
  order3_id UUID;
BEGIN
  -- Obtener IDs de clientes (NO admin)
  SELECT id INTO cliente1_id FROM profiles WHERE email = 'panaderia.central@gmail.com' LIMIT 1;
  SELECT id INTO cliente2_id FROM profiles WHERE email = 'supermercado.norte@hotmail.com' LIMIT 1;
  SELECT id INTO cliente3_id FROM profiles WHERE email = 'cafeteria.esquina@yahoo.com' LIMIT 1;
  
  -- Solo crear pedidos si existen los clientes
  IF cliente1_id IS NOT NULL THEN
    -- Pedido 1: Panadería Central
    INSERT INTO orders (user_id, status, total_amount, delivery_date, delivery_address, phone, notes)
    VALUES (
      cliente1_id,
      'pending',
      0, -- Se recalculará automáticamente con el trigger
      CURRENT_DATE + INTERVAL '1 day',
      'Av. Corrientes 1234, CABA',
      '+54 11 4567-8901',
      'Entregar en la mañana antes de las 8am'
    ) RETURNING id INTO order1_id;
    
    -- Items para pedido 1
    INSERT INTO order_items (
      order_id, product_id, product_code, product_name, 
      quantity, unit_price, unit_price_with_iva, iva_rate, line_total
    )
    SELECT 
      order1_id,
      p.id,
      p.code,
      p.name,
      5, -- cantidad
      p.price,
      p.price * (1 + p.iva_rate/100),
      p.iva_rate,
      5 * p.price * (1 + p.iva_rate/100)
    FROM products p 
    WHERE p.code = 'PAN-001' AND p.is_active = true;
  END IF;
  
  IF cliente2_id IS NOT NULL THEN
    -- Pedido 2: Supermercado Norte  
    INSERT INTO orders (user_id, status, total_amount, delivery_date, delivery_address, phone, notes)
    VALUES (
      cliente2_id,
      'confirmed',
      0, -- Se recalculará automáticamente con el trigger
      CURRENT_DATE + INTERVAL '2 days',
      'Av. Cabildo 567, Belgrano',
      '+54 11 4567-8902',
      'Coordinarse con gerencia'
    ) RETURNING id INTO order2_id;
    
    -- Items para pedido 2
    INSERT INTO order_items (
      order_id, product_id, product_code, product_name, 
      quantity, unit_price, unit_price_with_iva, iva_rate, line_total
    )
    SELECT 
      order2_id,
      p.id,
      p.code,
      p.name,
      10, -- cantidad
      p.price,
      p.price * (1 + p.iva_rate/100),
      p.iva_rate,
      10 * p.price * (1 + p.iva_rate/100)
    FROM products p 
    WHERE p.code IN ('PAN-002', 'CONF-001') AND p.is_active = true;
  END IF;
  
  IF cliente3_id IS NOT NULL THEN
    -- Pedido 3: Cafetería La Esquina
    INSERT INTO orders (user_id, status, total_amount, delivery_date, delivery_address, phone, notes)
    VALUES (
      cliente3_id,
      'ready',
      0, -- Se recalculará automáticamente con el trigger
      CURRENT_DATE,
      'Av. Santa Fe 890, Palermo',
      '+54 11 4567-8903',
      'Pedido urgente para la tarde'
    ) RETURNING id INTO order3_id;
    
    -- Items para pedido 3
    INSERT INTO order_items (
      order_id, product_id, product_code, product_name, 
      quantity, unit_price, unit_price_with_iva, iva_rate, line_total
    )
    SELECT 
      order3_id,
      p.id,
      p.code,
      p.name,
      3, -- cantidad
      p.price,
      p.price * (1 + p.iva_rate/100),
      p.iva_rate,
      3 * p.price * (1 + p.iva_rate/100)
    FROM products p 
    WHERE p.code IN ('BEB-001', 'PAST-001') AND p.is_active = true;
  END IF;
  
  RAISE NOTICE 'Pedidos de prueba creados exitosamente';
END $$;

-- Verificar que se crearon correctamente
SELECT 
  o.id,
  o.status,
  o.total_amount,
  o.delivery_date,
  p.email,
  p.full_name,
  p.company_name
FROM orders o
JOIN profiles p ON o.user_id = p.id
WHERE p.role = 'cliente'
ORDER BY o.created_at DESC; 