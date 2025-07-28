-- =============================================
-- Script: Arreglar políticas RLS para tabla orders
-- Fecha: Julio 2025
-- Descripción: Diagnostica estructura de orders y crea políticas RLS correctas
-- =============================================

-- =============================================
-- PASO 1: DIAGNÓSTICO DE LA TABLA ORDERS
-- =============================================

-- Verificar si la tabla orders existe y mostrar su estructura
DO $$
DECLARE
    table_exists boolean;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'orders' AND table_schema = 'public'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE '✅ La tabla orders existe';
        
        -- Mostrar columnas de la tabla orders
        RAISE NOTICE '📋 Columnas de la tabla orders:';
        FOR rec IN 
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'orders' AND table_schema = 'public'
            ORDER BY ordinal_position
        LOOP
            RAISE NOTICE '  - %: % (nullable: %, default: %)', 
                rec.column_name, rec.data_type, rec.is_nullable, rec.column_default;
        END LOOP;
    ELSE
        RAISE NOTICE '❌ La tabla orders NO existe';
    END IF;
END $$;

-- =============================================
-- PASO 2: VERIFICAR POLÍTICAS RLS EXISTENTES
-- =============================================

-- Mostrar políticas RLS existentes para orders
SELECT 
    'POLÍTICA EXISTENTE' as tipo,
    policyname as nombre,
    cmd as operacion,
    qual as condicion
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'orders';

-- =============================================
-- PASO 3: LIMPIAR POLÍTICAS EXISTENTES (SI HAY CONFLICTOS)
-- =============================================

-- Eliminar políticas existentes para empezar limpio
DO $$
BEGIN
    -- Eliminar políticas una por una si existen
    BEGIN
        DROP POLICY IF EXISTS "orders_select_own" ON public.orders;
        DROP POLICY IF EXISTS "orders_select_admin" ON public.orders;
        DROP POLICY IF EXISTS "orders_insert_own" ON public.orders;
        DROP POLICY IF EXISTS "orders_update_admin" ON public.orders;
        RAISE NOTICE '🧹 Políticas anteriores eliminadas';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '⚠️ Error eliminando políticas: %', SQLERRM;
    END;
END $$;

-- =============================================
-- PASO 4: HABILITAR RLS EN LA TABLA ORDERS
-- =============================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders' AND table_schema = 'public') THEN
        ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE '🔒 RLS habilitado en tabla orders';
    END IF;
END $$;

-- =============================================
-- PASO 5: CREAR POLÍTICAS RLS CORRECTAS
-- =============================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders' AND table_schema = 'public') THEN
        
        -- Verificar si existe column user_id o customer_id
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'user_id') THEN
            
            -- Usar user_id (estructura actual)
            RAISE NOTICE '📝 Creando políticas con campo user_id';
            
            -- Política: Usuarios pueden ver sus propios pedidos
            CREATE POLICY "orders_select_own" 
            ON public.orders FOR SELECT 
            USING (user_id = auth.uid());
            
            -- Política: Admins pueden ver todos los pedidos
            CREATE POLICY "orders_select_admin" 
            ON public.orders FOR SELECT 
            USING (
                EXISTS (
                    SELECT 1 FROM public.profiles p 
                    WHERE p.id = auth.uid() AND p.role = 'admin'
                )
            );
            
            -- Política: Usuarios pueden crear sus propios pedidos
            CREATE POLICY "orders_insert_own" 
            ON public.orders FOR INSERT 
            WITH CHECK (user_id = auth.uid());
            
            -- Política: Usuarios pueden actualizar sus propios pedidos
            CREATE POLICY "orders_update_own" 
            ON public.orders FOR UPDATE 
            USING (user_id = auth.uid());
            
            -- Política: Admins pueden actualizar cualquier pedido
            CREATE POLICY "orders_update_admin" 
            ON public.orders FOR UPDATE 
            USING (
                EXISTS (
                    SELECT 1 FROM public.profiles p 
                    WHERE p.id = auth.uid() AND p.role = 'admin'
                )
            );
            
        ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'customer_id') THEN
            
            -- Usar customer_id (estructura alternativa)
            RAISE NOTICE '📝 Creando políticas con campo customer_id';
            
            CREATE POLICY "orders_select_own" 
            ON public.orders FOR SELECT 
            USING (customer_id = auth.uid());
            
            CREATE POLICY "orders_select_admin" 
            ON public.orders FOR SELECT 
            USING (
                EXISTS (
                    SELECT 1 FROM public.profiles p 
                    WHERE p.id = auth.uid() AND p.role = 'admin'
                )
            );
            
            CREATE POLICY "orders_insert_own" 
            ON public.orders FOR INSERT 
            WITH CHECK (customer_id = auth.uid());
            
            CREATE POLICY "orders_update_own" 
            ON public.orders FOR UPDATE 
            USING (customer_id = auth.uid());
            
            CREATE POLICY "orders_update_admin" 
            ON public.orders FOR UPDATE 
            USING (
                EXISTS (
                    SELECT 1 FROM public.profiles p 
                    WHERE p.id = auth.uid() AND p.role = 'admin'
                )
            );
            
        ELSE
            RAISE NOTICE '❌ No se encontró campo user_id ni customer_id en tabla orders';
        END IF;
        
        RAISE NOTICE '✅ Políticas RLS creadas para tabla orders';
    ELSE
        RAISE NOTICE '❌ Tabla orders no existe';
    END IF;
END $$;

-- =============================================
-- PASO 6: VERIFICAR POLÍTICAS CREADAS
-- =============================================

-- Mostrar políticas finales
SELECT 
    '✅ POLÍTICA CREADA' as estado,
    policyname as nombre,
    cmd as operacion,
    qual as condicion
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'orders'
ORDER BY policyname;

-- =============================================
-- PASO 7: MOSTRAR ESTADO FINAL
-- =============================================

-- Verificar estado RLS
SELECT 
    '🔒 ESTADO RLS' as info,
    tablename as tabla,
    rowsecurity as rls_habilitado
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'orders';

RAISE NOTICE '🎉 Script de políticas RLS para orders completado';
RAISE NOTICE '📋 Revisa los resultados arriba para confirmar que todo está correcto'; 