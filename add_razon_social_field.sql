-- Agregar campo razon_social a la tabla profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS razon_social TEXT;
