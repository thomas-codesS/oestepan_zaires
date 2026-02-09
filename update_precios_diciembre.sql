-- ==========================================
-- ACTUALIZACIÓN DE PRECIOS - LISTA DICIEMBRE
-- Oeste Pan SRL
-- Fuente: "Lista Oeste Pan DICIEMBRE.pdf"
-- Precios SIN IVA
-- ==========================================
-- INSTRUCCIONES: Ejecutar este script en Supabase SQL Editor
-- ==========================================

BEGIN;

-- ========== PANES (43 productos) ==========
UPDATE products SET price = 19794.31, updated_at = NOW() WHERE code = '6106'; -- MIGNONCITO
UPDATE products SET price = 15552.84, updated_at = NOW() WHERE code = '6100'; -- BAGUETTE
UPDATE products SET price = 23143.82, updated_at = NOW() WHERE code = '6108'; -- FLAUTA BLANCA SEMILLADA
UPDATE products SET price = 16685.13, updated_at = NOW() WHERE code = '6135'; -- FLAUTA SANDWICH
UPDATE products SET price = 16685.13, updated_at = NOW() WHERE code = '6137'; -- PANINI
UPDATE products SET price = 19936.27, updated_at = NOW() WHERE code = '6102'; -- MINI-BAGUETTE
UPDATE products SET price = 17497.60, updated_at = NOW() WHERE code = '6109'; -- FLAUTA
UPDATE products SET price = 18688.60, updated_at = NOW() WHERE code = '6133'; -- BAGUETTE DE SALVADO
UPDATE products SET price = 19794.31, updated_at = NOW() WHERE code = '6107'; -- FLAUTON CONG
UPDATE products SET price = 19794.31, updated_at = NOW() WHERE code = '6103'; -- MINI-BAGUETTE DE SALVADO
UPDATE products SET price = 20954.33, updated_at = NOW() WHERE code = '6104'; -- MIGÑONCITOS DE SALVADO
UPDATE products SET price = 20954.33, updated_at = NOW() WHERE code = '6122'; -- PETIT DE SALVADO
UPDATE products SET price = 20954.33, updated_at = NOW() WHERE code = '6141'; -- PETIT
UPDATE products SET price = 12478.32, updated_at = NOW() WHERE code = '6187'; -- CIABATTA
UPDATE products SET price = 12478.32, updated_at = NOW() WHERE code = '6194'; -- CIABATTA CON SEMILLAS
UPDATE products SET price = 11958.39, updated_at = NOW() WHERE code = '6182'; -- CIABATTIN
UPDATE products SET price = 11958.39, updated_at = NOW() WHERE code = '6199'; -- CIABATTIN CON SEMILLAS
UPDATE products SET price = 14153.65, updated_at = NOW() WHERE code = '6167'; -- MINI CIABATTA PANERA
UPDATE products SET price = 14153.65, updated_at = NOW() WHERE code = '6168'; -- MINI CIABATTA CEBOLLA PANERA
UPDATE products SET price = 14153.65, updated_at = NOW() WHERE code = '6169'; -- MINI CIABATTA SEMILLAS PANERA
UPDATE products SET price = 10837.65, updated_at = NOW() WHERE code = '6195'; -- CIABATTON
UPDATE products SET price = 16175.60, updated_at = NOW() WHERE code = '6196'; -- FOCACCIA ROMERO Y ACEITUNA
UPDATE products SET price = 16175.60, updated_at = NOW() WHERE code = '6197'; -- FOCACCIA CEBOLLA
UPDATE products SET price = 16175.60, updated_at = NOW() WHERE code = '6198'; -- FOCACCIA TOMATE
UPDATE products SET price = 18376.64, updated_at = NOW() WHERE code = '6145'; -- BOLLO CAMPESINO
UPDATE products SET price = 21532.03, updated_at = NOW() WHERE code = '6173'; -- PAN MINI CAMPO
UPDATE products SET price = 21914.47, updated_at = NOW() WHERE code = '6171'; -- PAN DE CAMPO
UPDATE products SET price = 22218.34, updated_at = NOW() WHERE code = '6138'; -- BAGEL CON SESAMO
UPDATE products SET price = 38811.04, updated_at = NOW() WHERE code = '6114'; -- LOMITON DEL CHEF
UPDATE products SET price = 48085.44, updated_at = NOW() WHERE code = '6530'; -- SCONS DE QUESO
UPDATE products SET price = 60294.55, updated_at = NOW() WHERE code = '6151'; -- CHIPA DE QUESO
UPDATE products SET price = 26414.11, updated_at = NOW() WHERE code = '6116'; -- BOLLITOS DE SALVADO
UPDATE products SET price = 26894.25, updated_at = NOW() WHERE code = '6162'; -- BOLLITOS DE MANTECA
UPDATE products SET price = 26894.25, updated_at = NOW() WHERE code = '6152'; -- BOLLITOS DE QUESO
UPDATE products SET price = 48063.48, updated_at = NOW() WHERE code = '6113'; -- PLANCHA DE GRASA
UPDATE products SET price = 43114.91, updated_at = NOW() WHERE code = '6123'; -- CRIOLLITOS DE GRASA
UPDATE products SET price = 57641.75, updated_at = NOW() WHERE code = '6160'; -- CREMONA
UPDATE products SET price = 3495.09, updated_at = NOW() WHERE code = '122';  -- PAN PARA PEBETE
UPDATE products SET price = 3495.09, updated_at = NOW() WHERE code = '128';  -- PAN PARA HAMBURGUESA
UPDATE products SET price = 8055.45, updated_at = NOW() WHERE code = '169';  -- PAN DOBLE SALVADO FETEADO
UPDATE products SET price = 8055.45, updated_at = NOW() WHERE code = '177';  -- PAN BLANCO MOLDE FETEADO
UPDATE products SET price = 8888.49, updated_at = NOW() WHERE code = '178';  -- PAN MULTIGRANO ENTERO
UPDATE products SET price = 8888.49, updated_at = NOW() WHERE code = '179';  -- PAN MULTIGRANO FETEADO

-- ========== MEDIALUNAS Y FACTURAS (20 productos) ==========
UPDATE products SET price = 23209.68, updated_at = NOW() WHERE code = '6130'; -- CROISSANT
UPDATE products SET price = 26962.41, updated_at = NOW() WHERE code = '6731'; -- CROISSAN EXPRESS
UPDATE products SET price = 30077.37, updated_at = NOW() WHERE code = '6793'; -- MEDIALUNA SALADA
UPDATE products SET price = 31186.64, updated_at = NOW() WHERE code = '6739'; -- MEDIALUNA EXTRA MANTECA B
UPDATE products SET price = 32309.61, updated_at = NOW() WHERE code = '6750'; -- MEDIALUNA MANTECA CHICA
UPDATE products SET price = 32466.74, updated_at = NOW() WHERE code = '6740'; -- MEDIALUNA DE MANTECA MDP
UPDATE products SET price = 32466.74, updated_at = NOW() WHERE code = '6792'; -- MEDIALUNA DE MANTECA
UPDATE products SET price = 34652.76, updated_at = NOW() WHERE code = '6768'; -- MEDIALUNA MULTIGRANO
UPDATE products SET price = 53029.39, updated_at = NOW() WHERE code = '6795'; -- MEDIALUNA DE GRASA G.
UPDATE products SET price = 44160.54, updated_at = NOW() WHERE code = '6717'; -- PALITOS DE GRASA
UPDATE products SET price = 32151.32, updated_at = NOW() WHERE code = '6737'; -- MIX 4 ALEM-FRUT-RIC-MEMB
UPDATE products SET price = 32151.32, updated_at = NOW() WHERE code = '6789'; -- PANAL DE MEMBRILLO
UPDATE products SET price = 32159.40, updated_at = NOW() WHERE code = '6791'; -- PANAL DE BATATA
UPDATE products SET price = 32159.40, updated_at = NOW() WHERE code = '6794'; -- PANAL DE PASTELERA
UPDATE products SET price = 35580.54, updated_at = NOW() WHERE code = '6738'; -- MIX 5 BAT-ROS.ALM-MZNA
UPDATE products SET price = 39201.57, updated_at = NOW() WHERE code = '6733'; -- ALEMANA
UPDATE products SET price = 52685.08, updated_at = NOW() WHERE code = '6533'; -- ROLL DE MANZANA
UPDATE products SET price = 57713.39, updated_at = NOW() WHERE code = '6759'; -- PLANCHA DE HOJALDRE
UPDATE products SET price = 40140.91, updated_at = NOW() WHERE code = '6532'; -- CHURRINCHE
UPDATE products SET price = 20843.42, updated_at = NOW() WHERE code = '9500'; -- ALMIBAR

-- ========== BUDINES Y MUFFINS (22 productos) ==========
UPDATE products SET price = 7430.38, updated_at = NOW() WHERE code = '641';  -- BUDIN DE LIMÓN CLASICO
UPDATE products SET price = 7430.38, updated_at = NOW() WHERE code = '642';  -- BUDIN DE CHOCOLATE CLASICO
UPDATE products SET price = 7430.38, updated_at = NOW() WHERE code = '644';  -- BUDIN DE VAINILLA CLASICO
UPDATE products SET price = 7430.38, updated_at = NOW() WHERE code = '645';  -- BUDIN MARMOLADO CLASICO
UPDATE products SET price = 13605.99, updated_at = NOW() WHERE code = '611';  -- BUDIN VAINILLA C/ FRAMBUESA
UPDATE products SET price = 13605.99, updated_at = NOW() WHERE code = '610';  -- BUDIN NARANJA C/CHIPS
UPDATE products SET price = 13605.99, updated_at = NOW() WHERE code = '612';  -- BUDIN VAINILLA C/DCE DE LECHE
UPDATE products SET price = 13605.99, updated_at = NOW() WHERE code = '613';  -- BUDIN CHOCOLATE C/ CHIPS
UPDATE products SET price = 13605.99, updated_at = NOW() WHERE code = '614';  -- BUDIN DE VAINILLA CON CHIPS
UPDATE products SET price = 13605.99, updated_at = NOW() WHERE code = '616';  -- BUDIN VAINILLA C/ MANZANA
UPDATE products SET price = 13605.99, updated_at = NOW() WHERE code = '617';  -- BUDIN MARMOLADO C/ CHOCOLATE
UPDATE products SET price = 13605.99, updated_at = NOW() WHERE code = '618';  -- BUDIN VAINILLA C/ FR SECAS
UPDATE products SET price = 13605.99, updated_at = NOW() WHERE code = '650';  -- BUDIN BANANA Y NUEZ
UPDATE products SET price = 13605.99, updated_at = NOW() WHERE code = '651';  -- BUDIN CARROT CAKE
UPDATE products SET price = 1825.53, updated_at = NOW() WHERE code = '680';  -- MUFFIN VAINILLA Y DDL
UPDATE products SET price = 1825.53, updated_at = NOW() WHERE code = '681';  -- MUFFINS VAINILLA FRAMBUESA
UPDATE products SET price = 1825.53, updated_at = NOW() WHERE code = '682';  -- MUFFINS CHOCO CHIPS
UPDATE products SET price = 18124.76, updated_at = NOW() WHERE code = '691';  -- SUPER MUFFIN VAINILLA C/CHIP
UPDATE products SET price = 18124.76, updated_at = NOW() WHERE code = '692';  -- SUPER MUFFIN VAINILLA CON DL
UPDATE products SET price = 18124.76, updated_at = NOW() WHERE code = '693';  -- SUPER MUFFIN CHOCOLATE
UPDATE products SET price = 26941.62, updated_at = NOW() WHERE code = '6685'; -- MUFFIN DE VAINILLA CON DL
UPDATE products SET price = 26941.62, updated_at = NOW() WHERE code = '6687'; -- MUFFINS DE CHOCOLATE CON CHIPS

-- ========== DULCES (30 productos) ==========
UPDATE products SET price = 17651.46, updated_at = NOW() WHERE code = '281';  -- ALFAJORES DE MAICENA
UPDATE products SET price = 22218.56, updated_at = NOW() WHERE code = '284';  -- ALFAJORCITO DE MAICENA
UPDATE products SET price = 24006.16, updated_at = NOW() WHERE code = '277';  -- ALFAJORCITO BLANCO
UPDATE products SET price = 24006.16, updated_at = NOW() WHERE code = '278';  -- ALFAJORCITO DE CHOCOLATE
UPDATE products SET price = 24006.16, updated_at = NOW() WHERE code = '280';  -- ALFAJOR MARPLATENSES
UPDATE products SET price = 11697.27, updated_at = NOW() WHERE code = '206';  -- LENGUITAS
UPDATE products SET price = 15162.31, updated_at = NOW() WHERE code = '228';  -- PALMERITAS
UPDATE products SET price = 9719.75, updated_at = NOW() WHERE code = '4233'; -- COOKIES DE AVENA Y PASAS
UPDATE products SET price = 9719.75, updated_at = NOW() WHERE code = '4238'; -- COOKIES DE VAINILLA Y NUEZ
UPDATE products SET price = 9719.75, updated_at = NOW() WHERE code = '4237'; -- COOKIES DE CHOCOLATE Y NUEZ
UPDATE products SET price = 9719.75, updated_at = NOW() WHERE code = '4236'; -- COOKIES DE VAINILLA Y SEMILLAS
UPDATE products SET price = 9719.75, updated_at = NOW() WHERE code = '4231'; -- COOKIES DE VAINILLAS Y CONFITES
UPDATE products SET price = 9719.75, updated_at = NOW() WHERE code = '4227'; -- COOKIES CHOCOLATE CONFITE
UPDATE products SET price = 9719.75, updated_at = NOW() WHERE code = '4226'; -- COOKIES VAINILLA C/ CHIPS CHO.
UPDATE products SET price = 15951.06, updated_at = NOW() WHERE code = '4225'; -- COOKIES DE CHOCOLATE CON CHIPS
UPDATE products SET price = 17699.57, updated_at = NOW() WHERE code = '226';  -- SCONS
UPDATE products SET price = 17699.57, updated_at = NOW() WHERE code = '235';  -- PEPAS DE MEMBRILLO
UPDATE products SET price = 15432.68, updated_at = NOW() WHERE code = '217';  -- GALL. MANTECA LIMON
UPDATE products SET price = 17743.48, updated_at = NOW() WHERE code = '219';  -- GALL. MANTECA VAINILLA
UPDATE products SET price = 18962.42, updated_at = NOW() WHERE code = '236';  -- ROSQUITAS ESPAÑOLAS
UPDATE products SET price = 4352.39, updated_at = NOW() WHERE code = '336';  -- PASTA FROLA BATATA
UPDATE products SET price = 27581.71, updated_at = NOW() WHERE code = '479';  -- MASAS SECAS II
UPDATE products SET price = 24101.64, updated_at = NOW() WHERE code = '450';  -- MASAS SECAS I
UPDATE products SET price = 4352.39, updated_at = NOW() WHERE code = '340';  -- PASTA FROLA MEMBRILLO
UPDATE products SET price = 7022.52, updated_at = NOW() WHERE code = '4333'; -- TARTA COCO C/ DULCE DE LECHE
UPDATE products SET price = 8792.59, updated_at = NOW() WHERE code = '4391'; -- TARTA DE COPITOS
UPDATE products SET price = 11461.57, updated_at = NOW() WHERE code = '6317'; -- TIRA FROLA DE MEMBRILLO
UPDATE products SET price = 16660.87, updated_at = NOW() WHERE code = '6296'; -- TIRA MARQUISSE
UPDATE products SET price = 17492.76, updated_at = NOW() WHERE code = '6310'; -- TIRA BROWNIE
UPDATE products SET price = 17492.76, updated_at = NOW() WHERE code = '6312'; -- TIRA RICOTA

-- ========== GALLETITAS Y VARIOS (10 productos) ==========
UPDATE products SET price = 9983.81, updated_at = NOW() WHERE code = '212';  -- GRISSIN TRADICIONAL
UPDATE products SET price = 11697.27, updated_at = NOW() WHERE code = '205';  -- GALL DE QUESO
UPDATE products SET price = 11645.28, updated_at = NOW() WHERE code = '202';  -- GALL. CON SEMILLAS
UPDATE products SET price = 1028.31, updated_at = NOW() WHERE code = '194';   -- INDIVIDUAL TOMATE
UPDATE products SET price = 1028.31, updated_at = NOW() WHERE code = '195';   -- INDIVIDUAL CEBOLLA
UPDATE products SET price = 2726.74, updated_at = NOW() WHERE code = '196';  -- PIZZETAS DE TOMATE
UPDATE products SET price = 4042.74, updated_at = NOW() WHERE code = '187';  -- PREPIZZA CEBOLLA
UPDATE products SET price = 6687.46, updated_at = NOW() WHERE code = '186';  -- PREPIZZA TOMATE
UPDATE products SET price = 1807.05, updated_at = NOW() WHERE code = '141';  -- FIGASA ARABE REDONDA
UPDATE products SET price = 6376.65, updated_at = NOW() WHERE code = '139';  -- FIGASSA ARABE

COMMIT;

-- ==========================================
-- VERIFICACIÓN: Ejecutar después del UPDATE
-- ==========================================
SELECT 
    category,
    COUNT(*) as total_productos,
    MIN(price) as precio_minimo,
    MAX(price) as precio_maximo,
    ROUND(AVG(price)::numeric, 2) as precio_promedio
FROM products 
WHERE is_active = true
GROUP BY category
ORDER BY category;
