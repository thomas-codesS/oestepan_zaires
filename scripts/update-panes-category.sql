-- Script para actualizar la categoría PANES a "Panes Precocidos Congelados"
-- Ejecutar este script en Supabase SQL Editor

-- Actualizar todos los productos con categoría "PANES" a "Panes Precocidos Congelados"
UPDATE products
SET
  category = 'Panes Precocidos Congelados',
  updated_at = NOW()
WHERE category = 'PANES' OR category = 'Panes';

-- Verificar el cambio
SELECT
  id,
  code,
  name,
  category,
  updated_at
FROM products
WHERE category = 'Panes Precocidos Congelados'
ORDER BY code;
