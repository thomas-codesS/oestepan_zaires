import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verificar que el usuario sea admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    // Verificar la estructura de las tablas
    const queries = [
      // Estructura de orders
      `SELECT column_name, data_type, is_nullable 
       FROM information_schema.columns 
       WHERE table_name = 'orders' AND table_schema = 'public'
       ORDER BY ordinal_position`,
      
      // Estructura de profiles  
      `SELECT column_name, data_type, is_nullable
       FROM information_schema.columns 
       WHERE table_name = 'profiles' AND table_schema = 'public'
       ORDER BY ordinal_position`,
       
      // Verificar foreign keys
      `SELECT
         tc.table_name, 
         kcu.column_name, 
         ccu.table_name AS foreign_table_name,
         ccu.column_name AS foreign_column_name 
       FROM information_schema.table_constraints AS tc 
       JOIN information_schema.key_column_usage AS kcu
         ON tc.constraint_name = kcu.constraint_name
       JOIN information_schema.constraint_column_usage AS ccu
         ON ccu.constraint_name = tc.constraint_name
       WHERE constraint_type = 'FOREIGN KEY' 
         AND tc.table_name IN ('orders', 'profiles')`
    ]

    const results = []
    
    for (let i = 0; i < queries.length; i++) {
      const { data, error } = await supabase.rpc('exec_sql', { query: queries[i] })
      
      if (error) {
        console.error(`Query ${i + 1} error:`, error)
        results.push({ error: error.message, query: queries[i] })
      } else {
        results.push({ data, query: queries[i] })
      }
    }

    return NextResponse.json({
      message: 'Estructura de tablas verificada',
      results
    })
    
  } catch (error) {
    console.error('Error verificando estructura:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
