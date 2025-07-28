# Configuración de Base de Datos - Oeste Pan Platform

## 🚀 Pasos para configurar la base de datos

### 1. Acceder a Supabase
1. Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Inicia sesión con tu cuenta
3. Selecciona tu proyecto `oeste-pan-platform`

### 2. Ejecutar las migraciones de base de datos
1. En el dashboard de Supabase, ve a la sección **SQL Editor**

2. **Primera migración** - Crear tabla de productos:
   - Crea una nueva consulta
   - Copia y pega el contenido del archivo `supabase/migrations/001_create_products_table.sql`
   - Ejecuta la consulta haciendo clic en **RUN**

3. **Segunda migración** - Arreglar políticas RLS para desarrollo:
   - Crea otra nueva consulta
   - Copia y pega el contenido del archivo `supabase/migrations/002_fix_rls_policies_for_development.sql`
   - Ejecuta la consulta haciendo clic en **RUN**

> ⚠️ **Importante**: La segunda migración es temporal para desarrollo. En producción se debe rehabilitar RLS con autenticación completa.

### 3. Verificar la instalación
Después de ejecutar la migración, deberías ver:

#### En la sección "Table Editor":
- Nueva tabla `products` con las siguientes columnas:
  - `id` (UUID, Primary Key)
  - `code` (Text, Unique)
  - `name` (Text)
  - `description` (Text, nullable)
  - `price` (Decimal)
  - `iva_rate` (Decimal, default: 21.00)
  - `category` (Text, nullable)
  - `is_active` (Boolean, default: true)
  - `stock_quantity` (Integer, default: 0)
  - `created_at` (Timestamp)
  - `updated_at` (Timestamp)

#### Productos de ejemplo insertados:
- **PAN-001**: Pan de Molde Integral ($850 + IVA)
- **PAN-002**: Croissant de Manteca ($320 + IVA)
- **PAST-001**: Torta Rogel ($2800 + IVA)
- **BEB-001**: Café Americano ($450 + IVA)
- **CONF-001**: Alfajores de Maicena ($1200 + IVA)

### 4. Probar el CRUD
Una vez configurada la base de datos:

1. Ejecuta el servidor de desarrollo:
   ```bash
   npm run dev
   ```

2. Ve a [http://localhost:3004/admin/products](http://localhost:3004/admin/products)

3. Deberías ver la lista de productos con las siguientes funcionalidades:
   - ✅ Ver lista de productos con paginación
   - ✅ Filtrar por nombre, categoría y estado
   - ✅ Crear nuevos productos
   - ✅ Editar productos existentes
   - ✅ Activar/Desactivar productos
   - ✅ Eliminar productos

## 🔧 Solución de problemas

### Error: "products table does not exist"
- Verifica que la migración SQL se ejecutó correctamente
- Revisa que no haya errores en el SQL Editor de Supabase

### Error: "Row Level Security policy violation"
- **Solución**: Ejecuta la segunda migración (`002_fix_rls_policies_for_development.sql`)
- Verifica en Supabase que las nuevas políticas se crearon correctamente
- Las políticas deben permitir acceso público temporal para desarrollo

### Error: "Invalid URL or Key"
- Revisa que las variables de entorno en `.env.local` sean correctas
- Confirma que `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` estén configuradas

## 📊 Estructura de datos

### Productos
```sql
-- Ejemplo de producto
INSERT INTO products (code, name, description, price, iva_rate, category, stock_quantity) 
VALUES (
  'PAN-003',                    -- Código único
  'Facturas Surtidas',         -- Nombre del producto
  'Facturas variadas x12',     -- Descripción
  1500.00,                     -- Precio sin IVA
  21.00,                       -- Tasa IVA (21% general)
  'bolleria',                  -- Categoría
  40                           -- Stock disponible
);
```

### Categorías disponibles
- `panaderia` - Panadería
- `bolleria` - Bollería  
- `pasteleria` - Pastelería
- `confiteria` - Confitería
- `sandwiches` - Sandwiches
- `bebidas` - Bebidas
- `otros` - Otros

## 🎯 Próximos pasos

Una vez que el CRUD de productos esté funcionando, los siguientes pasos según el plan de trabajo son:

1. **Autenticación de usuarios** (Fase 2)
2. **Sistema de carrito** (Fase 4)
3. **Panel administrativo completo** (Fase 5)
4. **Testing y optimización** (Fases 6-7)

¡El CRUD de productos está listo para usar! 🎉 