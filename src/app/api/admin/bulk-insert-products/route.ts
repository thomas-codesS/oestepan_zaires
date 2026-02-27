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
      return NextResponse.json(
        { error: 'Acceso denegado. Solo administradores pueden insertar productos masivamente.' },
        { status: 403 }
      )
    }

    const productsToInsert = products.map(product => ({
      code: product.code,
      name: product.name,
      description: product.unit,
      price: product.price,
      category: product.category,
      iva_rate: 21.00,
      is_active: true,
      stock_quantity: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }))

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
        const { data, error } = await supabase
          .from('products')
          .insert(batch)
          .select('code, name')

        if (error) {
          totalErrors += batch.length
          details.push(`Error en lote ${i + 1}: ${error.message}`)

          if (error.message.includes('duplicate') || error.message.includes('unique')) {
            for (const product of batch) {
              try {
                const { error: individualError } = await supabase
                  .from('products')
                  .insert([product])

                if (individualError) {
                  details.push(`Código ${product.code} ya existe o error: ${product.name}`)
                } else {
                  totalInserted++
                }
              } catch {
                // Continue with next product
              }
              totalErrors--
            }
          }
        } else {
          totalInserted += data.length
          details.push(`Lote ${i + 1}: ${data.length} productos insertados correctamente`)
        }
      } catch (err) {
        totalErrors += batch.length
        details.push(`Error en lote ${i + 1}`)
      }

      await new Promise(resolve => setTimeout(resolve, 100))
    }

    return NextResponse.json({
      success: totalInserted,
      errors: totalErrors,
      total: products.length,
      details
    })

  } catch (error) {
    console.error('Error en bulk insert:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
