-- Script para actualizar productos con IVA según especificaciones
-- Productos con IVA 10.5%
UPDATE products 
SET iva_rate = 10.5 
WHERE code IN (
  '139', -- Figasa Árabe
  '141', -- Figasa Redondo
  '202', -- Galletitas con semilla
  '226', -- Palmeritas
  '235', -- Pastelitos de membrillo
  '236', -- Rosquitas españolas
  '6100', -- Baguette
  '6102', -- Mini Baguette
  '6106', -- Mignoncito
  '6107', -- Flauta Congelada
  '6109', -- Flauta
  '6113', -- Plancha de Grasa
  '6135', -- Flauta Sándwich
  '6137', -- Panini
  '6141' -- Petit
);

-- Productos Cookies (buscar por nombre que contenga "cookie")
UPDATE products 
SET iva_rate = 10.5 
WHERE LOWER(name) LIKE '%cookie%' OR LOWER(name) LIKE '%galleta%';

-- Resto de productos con IVA 21% (por si acaso algunos no tenían IVA configurado)
UPDATE products 
SET iva_rate = 21.0 
WHERE iva_rate IS NULL OR iva_rate = 0;

-- Verificar los cambios
SELECT 
  code,
  name,
  iva_rate,
  CASE 
    WHEN iva_rate = 10.5 THEN 'IVA Reducido'
    WHEN iva_rate = 21.0 THEN 'IVA General'
    ELSE 'IVA No Configurado'
  END as tipo_iva
FROM products 
ORDER BY iva_rate, name;
