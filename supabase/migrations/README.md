# Migraciones de Base de Datos - Sistema de Imágenes de Productos

## Descripción
Este directorio contiene las migraciones SQL necesarias para agregar soporte de imágenes a los productos.

## Migraciones Incluidas

### 1. `20251110_add_image_url_to_products.sql`
Agrega el campo `image_url` a la tabla `products` para almacenar la URL de la imagen del producto.

### 2. `20251110_create_product_images_bucket.sql`
Crea el bucket de Storage en Supabase llamado `product-images` con las políticas de acceso necesarias:
- Lectura pública para todos
- Subida, actualización y eliminación solo para usuarios autenticados

## Cómo Aplicar las Migraciones

### Opción 1: Usando el Dashboard de Supabase
1. Ve a tu proyecto en [https://app.supabase.com](https://app.supabase.com)
2. Navega a "SQL Editor" en el menú lateral
3. Copia y pega el contenido de cada archivo `.sql` en orden
4. Ejecuta cada script

### Opción 2: Usando Supabase CLI (si lo tienes instalado)
```bash
# Ejecutar las migraciones
supabase db push
```

### Opción 3: Ejecutar manualmente desde SQL
Conectate a tu base de datos y ejecuta:

```sql
-- Primero, agregar el campo a la tabla
\i 20251110_add_image_url_to_products.sql

-- Luego, crear el bucket de storage
\i 20251110_create_product_images_bucket.sql
```

## Verificación

Después de aplicar las migraciones, verifica que:

1. **Campo agregado**: 
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'products' AND column_name = 'image_url';
   ```

2. **Bucket creado**:
   - Ve a Storage > Buckets en el dashboard de Supabase
   - Deberías ver un bucket llamado "product-images"
   - Verifica que sea público

## Uso

Una vez aplicadas las migraciones:

1. Los productos podrán tener una imagen asociada
2. Las imágenes se subirán automáticamente al bucket `product-images` en Supabase Storage
3. Las URLs se guardarán en el campo `image_url` de cada producto
4. Si un producto no tiene imagen, se mostrará solo el ícono de la categoría (sin mensaje "Próximamente")

## Rollback

Si necesitas revertir los cambios:

```sql
-- Eliminar el campo image_url
ALTER TABLE products DROP COLUMN IF EXISTS image_url;

-- Eliminar el bucket (esto eliminará todas las imágenes)
DELETE FROM storage.buckets WHERE id = 'product-images';
```

**⚠️ ADVERTENCIA**: El rollback eliminará permanentemente todas las imágenes subidas.
