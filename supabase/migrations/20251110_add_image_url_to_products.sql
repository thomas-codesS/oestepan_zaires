-- Agregar campo image_url a la tabla products
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Comentario para documentar el campo
COMMENT ON COLUMN products.image_url IS 'URL de la imagen del producto almacenada en Supabase Storage';
