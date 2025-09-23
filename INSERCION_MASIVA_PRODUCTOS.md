# Inserción Masiva de Productos - OestePan

Este documento explica cómo agregar los productos proporcionados a la base de datos usando dos métodos diferentes.

## Productos a Insertar

Se van a insertar **113 productos** organizados en las siguientes categorías:

- **PANES**: 42 productos
- **MEDIALUNAS Y FACTURAS**: 20 productos  
- **BUDINES Y MUFFINS**: 22 productos
- **DULCES**: 29 productos
- **GALLETITAS Y VARIOS**: 10 productos

## Método 1: Interfaz Web (Recomendado)

### Pasos:

1. **Acceder a la aplicación**
   - Asegurate de que el servidor esté ejecutándose: `npm run dev`
   - Ve a: http://localhost:3004

2. **Iniciar sesión como administrador**
   - Usa las credenciales de administrador

3. **Navegar a Carga Masiva**
   - En el header, click en "Carga Masiva"
   - O ve directamente a: http://localhost:3004/admin/bulk-insert

4. **Ejecutar la inserción**
   - Revisa la lista de productos a insertar
   - Click en "Insertar Todos los Productos"
   - Espera a que termine el proceso

5. **Revisar resultados**
   - La interfaz mostrará:
     - Número de productos insertados exitosamente
     - Número de errores (códigos duplicados, etc.)
     - Detalles específicos de cada operación

### Ventajas:
- ✅ Interfaz visual fácil de usar
- ✅ Manejo de errores y códigos duplicados
- ✅ Verificación de permisos automática
- ✅ Feedback en tiempo real

## Método 2: Script SQL Directo

### Pasos:

1. **Acceder a Supabase Dashboard**
   - Ve a: https://supabase.com/dashboard
   - Selecciona tu proyecto

2. **SQL Editor**
   - Ve a la sección "SQL Editor"
   - Crea una nueva consulta

3. **Ejecutar el script**
   - Copia y pega el contenido de `scripts/insert-productos-sql.sql`
   - Ejecuta el script

4. **Verificar resultados**
   - El script incluye una consulta de verificación al final
   - Muestra el conteo de productos por categoría

### Ventajas:
- ✅ Ejecución rápida
- ✅ No requiere la aplicación web
- ✅ Manejo automático de duplicados con `ON CONFLICT (code) DO NOTHING`

## Configuración de Productos

Todos los productos se insertan con:
- **IVA**: 21% (tasa general)
- **Estado**: Activo (`is_active = true`)
- **Stock inicial**: 0 unidades
- **Descripción**: Unidad de medida (ej: "7.0 KG", "32 UNI")

## Verificación Post-Inserción

Después de cualquier método, puedes verificar en:

1. **Interfaz Admin**: 
   - Ve a http://localhost:3004/admin/products
   - Filtra por categoría para revisar

2. **Base de datos**:
   ```sql
   SELECT 
       category,
       COUNT(*) as total_productos
   FROM products 
   WHERE category IN ('PANES', 'MEDIALUNAS Y FACTURAS', 'BUDINES Y MUFFINS', 'DULCES', 'GALLETITAS Y VARIOS')
   GROUP BY category
   ORDER BY category;
   ```

## Manejo de Errores Comunes

### Códigos Duplicados
- **Problema**: Si un código ya existe en la base de datos
- **Solución**: Los scripts manejan esto automáticamente
  - Método Web: Salta productos duplicados
  - Método SQL: Usa `ON CONFLICT (code) DO NOTHING`

### Permisos
- **Problema**: Usuario sin permisos de administrador
- **Solución**: Solo usuarios con `role = 'admin'` pueden usar el método web

### Timeout de Conexión
- **Problema**: Muchos productos a la vez
- **Solución**: El método web usa lotes de 50 productos

## Archivos Creados

- `src/app/admin/bulk-insert/page.tsx`: Interfaz web
- `src/app/api/admin/bulk-insert-products/route.ts`: API endpoint
- `scripts/insert-productos-sql.sql`: Script SQL directo
- `scripts/bulk-insert-products.ts`: Script TypeScript (alternativo)

## Precios

Todos los precios están en pesos argentinos y **NO incluyen IVA** según especifica la lista original:
> "Los precios no incluyen IVA ni IMPUESTO"

## Vigencia

Los precios tienen vigencia a partir del **12-08-2025** según la lista original.
