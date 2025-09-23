-- Arreglar políticas RLS para order_items

-- 1. Verificar políticas actuales
SELECT 'POLÍTICAS ACTUALES' as status;
SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'order_items';

-- 2. Eliminar políticas existentes que puedan estar causando problemas
DROP POLICY IF EXISTS "Users can view their own order items" ON order_items;
DROP POLICY IF EXISTS "Users can insert their own order items" ON order_items;
DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON order_items;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON order_items;

-- 3. Crear políticas RLS correctas para order_items

-- Política para que los usuarios puedan ver items de sus propios pedidos
CREATE POLICY "Users can view their own order items" ON order_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  )
);

-- Política para que los admins puedan ver todos los items
CREATE POLICY "Admins can view all order items" ON order_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Política para insertar items (durante creación de pedidos)
CREATE POLICY "Users can insert order items for their orders" ON order_items
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  )
);

-- Política para que admins puedan insertar items
CREATE POLICY "Admins can insert order items" ON order_items
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- 4. Verificar que las políticas se crearon correctamente
SELECT 'POLÍTICAS DESPUÉS DEL ARREGLO' as status;
SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'order_items';

-- 5. Probar acceso después del arreglo
SELECT 
  'PRUEBA DE ACCESO DESPUÉS DEL ARREGLO' as status,
  oi.order_id,
  oi.product_name,
  oi.quantity
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
WHERE o.user_id = 'd6115f28-7e7c-4956-bdb4-68f50b83be33'
LIMIT 5;

