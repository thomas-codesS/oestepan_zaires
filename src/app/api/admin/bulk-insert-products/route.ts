import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface ProductToInsert {
  code: string
  name: string
  unit: string
  price: number
  category: string
}

interface BulkInsertRequest {
  products: ProductToInsert[]
}

export async function POST(request: NextRequest) {
  try {
    const { products }: BulkInsertRequest = await request.json()

    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { error: 'Se requiere un array de productos válido' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Verificar que el usuario sea admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acceso denegado. Solo administradores pueden insertar productos masivamente.' },
        { status: 403 }
      )
    }

    // Preparar datos para inserción
    const productsToInsert = products.map(product => ({
      code: product.code,
      name: product.name,
      description: product.unit,
      price: product.price,
      category: product.category,
      iva_rate: 21.00, // IVA general del 21%
      is_active: true,
      stock_quantity: 0, // Iniciar con stock 0
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }))

    console.log(`Iniciando inserción de ${productsToInsert.length} productos...`)

    // Insertar en lotes para evitar timeouts
    const batchSize = 50
    const batches = []
    
    for (let i = 0; i < productsToInsert.length; i += batchSize) {
      batches.push(productsToInsert.slice(i, i + batchSize))
    }

    let totalInserted = 0
    let totalErrors = 0
    const details: string[] = []

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i]
      
      try {
        console.log(`Procesando lote ${i + 1}/${batches.length} (${batch.length} productos)...`)

        const { data, error } = await supabase
          .from('products')
          .insert(batch)
          .select('code, name')

        if (error) {
          console.error(`Error en lote ${i + 1}:`, error.message)
          totalErrors += batch.length
          details.push(`Error en lote ${i + 1}: ${error.message}`)
          
          // Si hay error de código duplicado, intentar insertar uno por uno
          if (error.message.includes('duplicate') || error.message.includes('unique')) {
            details.push(`Intentando inserción individual para lote ${i + 1}...`)
            
            for (const product of batch) {
              try {
                const { error: individualError } = await supabase
                  .from('products')
                  .insert([product])

                if (individualError) {
                  if (individualError.message.includes('duplicate') || individualError.message.includes('unique')) {
                    details.push(`❌ Código ${product.code} ya existe: ${product.name}`)
                  } else {
                    details.push(`❌ Error al insertar ${product.code}: ${individualError.message}`)
                  }
                } else {
                  totalInserted++
                  details.push(`✅ Insertado: ${product.code} - ${product.name}`)
                }
              } catch (err) {
                details.push(`❌ Error crítico al insertar ${product.code}: ${err}`)
              }
              
              // Reducir total de errores ya que estamos manejando individualmente
              totalErrors--
            }
          }
        } else {
          console.log(`✅ Lote ${i + 1} insertado exitosamente (${data.length} productos)`)
          totalInserted += data.length
          details.push(`✅ Lote ${i + 1}: ${data.length} productos insertados correctamente`)
        }
      } catch (err) {
        console.error(`Error ejecutando lote ${i + 1}:`, err)
        totalErrors += batch.length
        details.push(`❌ Error crítico en lote ${i + 1}: ${err}`)
      }

      // Pequeña pausa entre lotes
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    console.log(`=== RESUMEN ===`)
    console.log(`✅ Productos insertados: ${totalInserted}`)
    console.log(`❌ Productos con error: ${totalErrors}`)

    return NextResponse.json({
      success: totalInserted,
      errors: totalErrors,
      total: products.length,
      details
    })

  } catch (error) {
    console.error('Error en bulk insert:', error)
    return NextResponse.json(
      { error: `Error interno del servidor: ${error}` },
      { status: 500 }
    )
  }
}
