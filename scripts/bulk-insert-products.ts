// Para scripts, usaremos el cliente directo
import { createClient } from '@supabase/supabase-js'

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Datos de productos organizados por categorías
const productData = [
  // PANES
  { code: '6106', name: 'MIGNONCITO', unit: '7.0 KG', price: 18673.88, category: 'PANES' },
  { code: '6100', name: 'BAGUETTE', unit: '5.5 KG', price: 14672.49, category: 'PANES' },
  { code: '6108', name: 'FLAUTA BLANCA SEMILLADA', unit: '6.3 KG', price: 21833.79, category: 'PANES' },
  { code: '6135', name: 'FLAUTA SANDWICH', unit: '5.9 KG', price: 15740.69, category: 'PANES' },
  { code: '6137', name: 'PANINI', unit: '5.9 KG', price: 15740.69, category: 'PANES' },
  { code: '6102', name: 'MINI-BAGUETTE', unit: '6.3 KG', price: 16807.80, category: 'PANES' },
  { code: '6109', name: 'FLAUTA', unit: '6.3 KG', price: 16507.17, category: 'PANES' },
  { code: '6133', name: 'BAGUETTE DE SALVADO', unit: '5.5 KG', price: 17630.75, category: 'PANES' },
  { code: '6107', name: 'FLAUTON CONG', unit: '7.0 KG', price: 18674.97, category: 'PANES' },
  { code: '6103', name: 'MINI-BAGUETTE DE SALVADO', unit: '5.9 KG', price: 18913.68, category: 'PANES' },
  { code: '6104', name: 'MIGÑONCITOS DE SALVADO', unit: '7.0 KG', price: 19768.24, category: 'PANES' },
  { code: '6122', name: 'PETIT DE SALVADO', unit: '7.0 KG', price: 19768.24, category: 'PANES' },
  { code: '6141', name: 'PETIT', unit: '7.0 KG', price: 19768.24, category: 'PANES' },
  { code: '6187', name: 'CIABATTA', unit: '24 un', price: 11772.00, category: 'PANES' },
  { code: '6194', name: 'CIABATTA CON SEMILLAS', unit: '24 un', price: 11772.00, category: 'PANES' },
  { code: '6182', name: 'CIABATTIN', unit: '45 UN', price: 11281.50, category: 'PANES' },
  { code: '6199', name: 'CIABATTIN CON SEMILLAS', unit: '45 UN', price: 11281.50, category: 'PANES' },
  { code: '6167', name: 'MINI CIABATTA PANERA', unit: '3.5 kg', price: 13352.50, category: 'PANES' },
  { code: '6168', name: 'MINI CIABATTA CEBOLLA PANERA', unit: '3.5 kg', price: 13352.50, category: 'PANES' },
  { code: '6169', name: 'MINI CIABATTA SEMILLAS PANERA', unit: '3.5 kg', price: 13352.50, category: 'PANES' },
  { code: '6195', name: 'CIABATTON', unit: '14 un', price: 10224.20, category: 'PANES' },
  { code: '6196', name: 'FOCACCIA ROMERO Y ACEITUNA', unit: '14 un', price: 15260.00, category: 'PANES' },
  { code: '6197', name: 'FOCACCIA CEBOLLA', unit: '14 un', price: 15260.00, category: 'PANES' },
  { code: '6198', name: 'FOCACCIA TOMATE', unit: '14 un', price: 15260.00, category: 'PANES' },
  { code: '6145', name: 'BOLLO CAMPESINO', unit: '4.5 KG', price: 17336.45, category: 'PANES' },
  { code: '6173', name: 'PAN MINI CAMPO', unit: '4.1 KG', price: 20313.24, category: 'PANES' },
  { code: '6171', name: 'PAN DE CAMPO', unit: '4.9 KG', price: 20674.03, category: 'PANES' },
  { code: '6138', name: 'BAGEL CON SESAMO', unit: '32 UNI', price: 20960.70, category: 'PANES' },
  { code: '6114', name: 'LOMITON DEL CHEF', unit: '45 UN', price: 36614.19, category: 'PANES' },
  { code: '6530', name: 'SCONS DE QUESO', unit: '30 UN', price: 45363.62, category: 'PANES' },
  { code: '6151', name: 'CHIPA DE QUESO', unit: '5.5 KG', price: 56881.65, category: 'PANES' },
  { code: '6116', name: 'BOLLITOS DE SALVADO', unit: '5.3 KG', price: 24918.97, category: 'PANES' },
  { code: '6162', name: 'BOLLITOS DE MANTECA', unit: '5.3 KG', price: 25371.93, category: 'PANES' },
  { code: '6152', name: 'BOLLITOS DE QUESO', unit: '5.3 KG', price: 25371.93, category: 'PANES' },
  { code: '6113', name: 'PLANCHA DE GRASA', unit: '7 UN', price: 45342.91, category: 'PANES' },
  { code: '6123', name: 'CRIOLLITOS DE GRASA', unit: '6.3 KG', price: 40674.44, category: 'PANES' },
  { code: '6160', name: 'CREMONA', unit: '13.5 KG', price: 54379.01, category: 'PANES' },
  { code: '122', name: 'PAN PARA PEBETE', unit: '10 UN', price: 3297.25, category: 'PANES' },
  { code: '128', name: 'PAN PARA HAMBURGUESA', unit: '10 UN', price: 3297.25, category: 'PANES' },
  { code: '169', name: 'PAN DOBLE SALVADO FETEADO', unit: '4 UN', price: 7599.48, category: 'PANES' },
  { code: '177', name: 'PAN BLANCO MOLDE FETEADO', unit: '4 UN', price: 7599.48, category: 'PANES' },
  { code: '178', name: 'PAN MULTIGRANO ENTERO', unit: '4 UN', price: 8385.37, category: 'PANES' },
  { code: '179', name: 'PAN MULTIGRANO FETEADO', unit: '4 UN', price: 8385.37, category: 'PANES' },

  // MEDIALUNAS Y FACTURAS
  { code: '6130', name: 'CROISSANT', unit: '32 UNI', price: 21895.92, category: 'MEDIALUNAS Y FACTURAS' },
  { code: '6731', name: 'CROISSAN EXPRESS', unit: '75 UN', price: 25436.24, category: 'MEDIALUNAS Y FACTURAS' },
  { code: '6793', name: 'MEDIALUNA SALADA', unit: '80 UN', price: 28374.88, category: 'MEDIALUNAS Y FACTURAS' },
  { code: '6739', name: 'MEDIALUNA EXTRA MANTECA B', unit: '72 UN', price: 29421.28, category: 'MEDIALUNAS Y FACTURAS' },
  { code: '6750', name: 'MEDIALUNA MANTECA CHICA', unit: '108 UN', price: 30480.76, category: 'MEDIALUNAS Y FACTURAS' },
  { code: '6740', name: 'MEDIALUNA DE MANTECA MDP', unit: '90 UN', price: 30629.00, category: 'MEDIALUNAS Y FACTURAS' },
  { code: '6792', name: 'MEDIALUNA DE MANTECA', unit: '90 UN', price: 30629.00, category: 'MEDIALUNAS Y FACTURAS' },
  { code: '6768', name: 'MEDIALUNA MULTIGRANO', unit: '80 UN', price: 32691.28, category: 'MEDIALUNAS Y FACTURAS' },
  { code: '6795', name: 'MEDIALUNA DE GRASA G.', unit: '147 UN', price: 50027.73, category: 'MEDIALUNAS Y FACTURAS' },
  { code: '6717', name: 'PALITOS DE GRASA', unit: '150 UN', price: 41660.89, category: 'MEDIALUNAS Y FACTURAS' },
  { code: '6737', name: 'MIX 4 ALEM-FRUT-RIC-MEMB', unit: '75 UN', price: 30331.43, category: 'MEDIALUNAS Y FACTURAS' },
  { code: '6789', name: 'PANAL DE MEMBRILLO', unit: '75 UN', price: 30331.43, category: 'MEDIALUNAS Y FACTURAS' },
  { code: '6791', name: 'PANAL DE BATATA', unit: '75 UN', price: 30339.06, category: 'MEDIALUNAS Y FACTURAS' },
  { code: '6794', name: 'PANAL DE PASTELERA', unit: '75 UN', price: 30339.06, category: 'MEDIALUNAS Y FACTURAS' },
  { code: '6738', name: 'MIX 5 BAT-ROS.ALM-MZNA', unit: '83 UN', price: 33566.55, category: 'MEDIALUNAS Y FACTURAS' },
  { code: '6733', name: 'ALEMANA', unit: '112 UN', price: 36982.61, category: 'MEDIALUNAS Y FACTURAS' },
  { code: '6533', name: 'ROLL DE MANZANA', unit: '36 UN', price: 49702.91, category: 'MEDIALUNAS Y FACTURAS' },
  { code: '6759', name: 'PLANCHA DE HOJALDRE', unit: '12 UN', price: 54446.59, category: 'MEDIALUNAS Y FACTURAS' },
  { code: '6532', name: 'CHURRINCHE', unit: '90 UN', price: 37868.78, category: 'MEDIALUNAS Y FACTURAS' },
  { code: '9500', name: 'ALMIBAR', unit: '1 UN', price: 19663.60, category: 'MEDIALUNAS Y FACTURAS' },

  // BUDINES Y MUFFINS (REFRIGERADOS)
  { code: '641', name: 'BUDIN DE LIMÓN CLASICO', unit: '4 UN', price: 7009.79, category: 'BUDINES Y MUFFINS' },
  { code: '642', name: 'BUDIN DE CHOCOLATE CLASICO', unit: '4 UN', price: 7009.79, category: 'BUDINES Y MUFFINS' },
  { code: '644', name: 'BUDIN DE VAINILLA CLASICO', unit: '4 UN', price: 7009.79, category: 'BUDINES Y MUFFINS' },
  { code: '645', name: 'BUDIN MARMOLADO CLASICO', unit: '4 UN', price: 7009.79, category: 'BUDINES Y MUFFINS' },
  { code: '611', name: 'BUDIN VAINILLA C/ FRAMBUESA', unit: '4 UN', price: 12835.84, category: 'BUDINES Y MUFFINS' },
  { code: '610', name: 'BUDIN NARANJA C/CHIPS', unit: '4 UN', price: 12835.84, category: 'BUDINES Y MUFFINS' },
  { code: '612', name: 'BUDIN VAINILLA C/DCE DE LECHE', unit: '4 UN', price: 12835.84, category: 'BUDINES Y MUFFINS' },
  { code: '613', name: 'BUDIN CHOCOLATE C/ CHIPS', unit: '4 UN', price: 12835.84, category: 'BUDINES Y MUFFINS' },
  { code: '614', name: 'BUDIN DE VAINILLA CON CHIPS', unit: '4 UN', price: 12835.84, category: 'BUDINES Y MUFFINS' },
  { code: '616', name: 'BUDIN VAINILLA C/ MANZANA', unit: '4 UN', price: 12835.84, category: 'BUDINES Y MUFFINS' },
  { code: '617', name: 'BUDIN MARMOLADO C/ CHOCOLATE', unit: '4 UN', price: 12835.84, category: 'BUDINES Y MUFFINS' },
  { code: '618', name: 'BUDIN VAINILLA C/ FR SECAS', unit: '4 UN', price: 12835.84, category: 'BUDINES Y MUFFINS' },
  { code: '650', name: 'BUDIN BANANA Y NUEZ', unit: '4 UN', price: 12835.84, category: 'BUDINES Y MUFFINS' },
  { code: '651', name: 'BUDIN CARROT CAKE', unit: '4 UN', price: 12835.84, category: 'BUDINES Y MUFFINS' },
  { code: '680', name: 'MUFFIN VAINILLA Y DDL', unit: '1 UN', price: 1722.20, category: 'BUDINES Y MUFFINS' },
  { code: '681', name: 'MUFFINS VAINILLA FRAMBUESA', unit: '1 UN', price: 1722.20, category: 'BUDINES Y MUFFINS' },
  { code: '682', name: 'MUFFINS CHOCO CHIPS', unit: '1 UN', price: 1722.20, category: 'BUDINES Y MUFFINS' },
  { code: '691', name: 'SUPER MUFFIN VAINILLA C/CHIP', unit: '15 UNI', price: 17098.83, category: 'BUDINES Y MUFFINS' },
  { code: '692', name: 'SUPER MUFFIN VAINILLA CON DL', unit: '15 UNI', price: 17098.83, category: 'BUDINES Y MUFFINS' },
  { code: '693', name: 'SUPER MUFFIN CHOCOLATE', unit: '15 UNI', price: 17098.83, category: 'BUDINES Y MUFFINS' },
  { code: '6685', name: 'MUFFIN DE VAINILLA CON DL', unit: '45 UN', price: 25416.62, category: 'BUDINES Y MUFFINS' },
  { code: '6687', name: 'MUFFINS DE CHOCOLATE CON CHIPS', unit: '45 UN', price: 25416.62, category: 'BUDINES Y MUFFINS' },

  // DULCES (REFRIGERADOS)
  { code: '281', name: 'ALFAJORES DE MAICENA', unit: '25 UN', price: 17651.46, category: 'DULCES' },
  { code: '284', name: 'ALFAJORCITO DE MAICENA', unit: '42 UN', price: 22218.56, category: 'DULCES' },
  { code: '277', name: 'ALFAJORCITO BLANCO', unit: '38 UN', price: 24006.16, category: 'DULCES' },
  { code: '278', name: 'ALFAJORCITO DE CHOCOLATE', unit: '38 UN', price: 24006.16, category: 'DULCES' },
  { code: '280', name: 'ALFAJOR MARPLATENSES', unit: '25 UN', price: 24006.16, category: 'DULCES' },
  { code: '206', name: 'LENGUITAS', unit: '1.4 KG', price: 11035.16, category: 'DULCES' },
  { code: '228', name: 'PALMERITAS', unit: '1.2 KG', price: 14304.07, category: 'DULCES' },
  { code: '4233', name: 'COOKIES DE AVENA Y PASAS', unit: '35 UN', price: 9719.75, category: 'DULCES' },
  { code: '4238', name: 'COOKIES DE VAINILLA Y NUEZ', unit: '35 UN', price: 9719.75, category: 'DULCES' },
  { code: '4237', name: 'COOKIES DE CHOCOLATE Y NUEZ', unit: '35 UN', price: 9719.75, category: 'DULCES' },
  { code: '4236', name: 'COOKIES DE VAINILLA Y SEMILLAS', unit: '35 UN', price: 9719.75, category: 'DULCES' },
  { code: '4231', name: 'COOKIES DE VAINILLAS Y CONFITES', unit: '35 UN', price: 9719.75, category: 'DULCES' },
  { code: '4227', name: 'COOKIES CHOCOLATE CONFITE', unit: '35 UN', price: 9719.75, category: 'DULCES' },
  { code: '4226', name: 'COOKIES VAINILLA C/ CHIPS CHO.', unit: '35 UN', price: 9719.75, category: 'DULCES' },
  { code: '4225', name: 'COOKIES DE CHOCOLATE CON CHIPS', unit: '1.2 KG', price: 15951.06, category: 'DULCES' },
  { code: '226', name: 'SCONS', unit: '1.4 KG', price: 16697.71, category: 'DULCES' },
  { code: '235', name: 'PEPAS DE MEMBRILLO', unit: '1.4 KG', price: 16697.71, category: 'DULCES' },
  { code: '217', name: 'GALL. MANTECA LIMON', unit: '1.2 KG', price: 14559.13, category: 'DULCES' },
  { code: '219', name: 'GALL. MANTECA VAINILLA', unit: '1.4 KG', price: 16739.13, category: 'DULCES' },
  { code: '236', name: 'ROSQUITAS ESPAÑOLAS', unit: '1.5 KG', price: 17889.08, category: 'DULCES' },
  { code: '336', name: 'PASTA FROLA BATATA', unit: '1 UN', price: 4106.03, category: 'DULCES' },
  { code: '479', name: 'MASAS SECAS II', unit: '1.25 KG', price: 26020.48, category: 'DULCES' },
  { code: '450', name: 'MASAS SECAS I', unit: '1.25 KG', price: 22737.40, category: 'DULCES' },
  { code: '340', name: 'PASTA FROLA MEMBRILLO', unit: '1 UN', price: 4106.03, category: 'DULCES' },
  { code: '4333', name: 'TARTA COCO C/ DULCE DE LECHE', unit: '1 UN', price: 6625.02, category: 'DULCES' },
  { code: '4391', name: 'TARTA DE COPITOS', unit: '1 UN', price: 8294.90, category: 'DULCES' },
  { code: '6317', name: 'TIRA FROLA DE MEMBRILLO', unit: '2 UN', price: 10812.80, category: 'DULCES' },
  { code: '6296', name: 'TIRA MARQUISSE', unit: '2 UN', price: 15717.80, category: 'DULCES' },
  { code: '6310', name: 'TIRA BROWNIE', unit: '2 UN', price: 16502.60, category: 'DULCES' },
  { code: '6312', name: 'TIRA RICOTA', unit: '2 UN', price: 16502.60, category: 'DULCES' },

  // GALLETITAS Y VARIOS (REFRIGERADOS)
  { code: '212', name: 'GRISSIN TRADICIONAL', unit: '1.2 KG', price: 9418.69, category: 'GALLETITAS Y VARIOS' },
  { code: '205', name: 'GALL DE QUESO', unit: '1.4 KG', price: 11035.16, category: 'GALLETITAS Y VARIOS' },
  { code: '202', name: 'GALL. CON SEMILLAS', unit: '1 UN', price: 10986.11, category: 'GALLETITAS Y VARIOS' },
  { code: '194', name: 'INDIVIDUAL TOMATE', unit: '1 UN', price: 970.10, category: 'GALLETITAS Y VARIOS' },
  { code: '195', name: 'INDIVIDUAL CEBOLLA', unit: '1 UN', price: 970.10, category: 'GALLETITAS Y VARIOS' },
  { code: '196', name: 'PIZZETAS DE TOMATE', unit: '12 UN', price: 2572.40, category: 'GALLETITAS Y VARIOS' },
  { code: '187', name: 'PREPIZZA CEBOLLA', unit: '3 UN', price: 3813.91, category: 'GALLETITAS Y VARIOS' },
  { code: '186', name: 'PREPIZZA TOMATE', unit: '6 UN', price: 6308.92, category: 'GALLETITAS Y VARIOS' },
  { code: '141', name: 'FIGASA ARABE REDONDA', unit: '4 UN', price: 1704.76, category: 'GALLETITAS Y VARIOS' },
  { code: '139', name: 'FIGASSA ARABE', unit: '10 UN', price: 6015.71, category: 'GALLETITAS Y VARIOS' },
]

async function insertProducts() {
  console.log('Iniciando inserción masiva de productos...')
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Preparar datos para inserción
    const productsToInsert = productData.map(product => ({
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

    console.log(`Insertando ${productsToInsert.length} productos...`)

    // Insertar en lotes de 50 productos para evitar timeouts
    const batchSize = 50
    const batches = []
    
    for (let i = 0; i < productsToInsert.length; i += batchSize) {
      batches.push(productsToInsert.slice(i, i + batchSize))
    }

    let totalInserted = 0
    let totalErrors = 0

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i]
      console.log(`Procesando lote ${i + 1}/${batches.length} (${batch.length} productos)...`)

      try {
        const { data, error } = await supabase
          .from('products')
          .insert(batch)
          .select('code, name')

        if (error) {
          console.error(`Error en lote ${i + 1}:`, error.message)
          totalErrors += batch.length
        } else {
          console.log(`✅ Lote ${i + 1} insertado exitosamente (${data.length} productos)`)
          totalInserted += data.length
        }
      } catch (err) {
        console.error(`Error ejecutando lote ${i + 1}:`, err)
        totalErrors += batch.length
      }

      // Pequeña pausa entre lotes
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    console.log('\n=== RESUMEN ===')
    console.log(`✅ Productos insertados exitosamente: ${totalInserted}`)
    console.log(`❌ Productos con error: ${totalErrors}`)
    console.log(`📊 Total procesados: ${totalInserted + totalErrors}`)

    if (totalErrors > 0) {
      console.log('\n⚠️  Algunos productos no pudieron insertarse. Verifica:')
      console.log('- Códigos duplicados')
      console.log('- Problemas de conexión a la base de datos')
      console.log('- Restricciones de validación')
    }

  } catch (error) {
    console.error('Error general:', error)
    process.exit(1)
  }
}

// Ejecutar el script
insertProducts()
  .then(() => {
    console.log('\n🎉 Script completado!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Error fatal:', error)
    process.exit(1)
  })
