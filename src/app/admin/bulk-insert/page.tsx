'use client'

import { useState } from 'react'

interface ProductData {
  code: string
  name: string
  unit: string
  price: number
  category: string
}

// Función para parsear texto libre de productos
function parseProductText(text: string): ProductData[] {
  const lines = text.split('\n').filter(line => line.trim())
  const products: ProductData[] = []
  let currentCategory = 'SIN CATEGORIA'

  for (const line of lines) {
    const trimmedLine = line.trim()
    
    // Detectar categorías (líneas que terminan con mayúsculas y no tienen números al inicio)
    if (trimmedLine.match(/^[A-ZÁÉÍÓÚÑ\s]+$/) && trimmedLine.length > 5) {
      currentCategory = trimmedLine
      continue
    }

    // Parsear líneas de productos
    // Formato esperado: CODE DESCRIPCION UM PRECIO
    const productMatch = trimmedLine.match(/^(\S+)\s+(.+?)\s+([0-9,.]+ ?[A-Z]+)\s+\$?([0-9,.]+)$/)
    
    if (productMatch) {
      const [, code, name, unit, priceStr] = productMatch
      const price = parseFloat(priceStr.replace(/[,.]/g, match => match === ',' ? '.' : ''))
      
      if (!isNaN(price)) {
        products.push({
          code: code.trim(),
          name: name.trim(),
          unit: unit.trim(),
          price,
          category: currentCategory
        })
      }
    }
  }

  return products
}

export default function BulkProductInsert() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<{
    success: number
    errors: number
    details: string[]
  } | null>(null)
  
  const [textInput, setTextInput] = useState('')
  const [parsedProducts, setParsedProducts] = useState<ProductData[]>([])

  const handleParseText = () => {
    try {
      const products = parseProductText(textInput)
      setParsedProducts(products)
      
      if (products.length === 0) {
        alert('No se pudieron parsear productos del texto. Verifica el formato.')
      }
    } catch (error) {
      alert('Error al parsear el texto: ' + error)
    }
  }

  const handleBulkInsert = async (products: ProductData[]) => {
    if (products.length === 0) {
      alert('No hay productos para insertar')
      return
    }

    setLoading(true)
    setResults(null)

    try {
      const response = await fetch('/api/admin/bulk-insert-products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ products }),
      })

      const result = await response.json()

      if (response.ok) {
        setResults(result)
      } else {
        setResults({
          success: 0,
          errors: products.length,
          details: [result.error || 'Error desconocido']
        })
      }
    } catch (error) {
      setResults({
        success: 0,
        errors: products.length,
        details: [`Error de conexión: ${error}`]
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Inserción Masiva de Productos</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        {/* Instrucciones */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">📋 Cómo usar esta herramienta</h2>
          <p className="text-blue-800 text-sm mb-3">
            Pega tu lista de productos en el campo de texto y la aplicación los procesará automáticamente.
          </p>
          <div className="bg-white p-3 rounded text-sm">
            <p className="font-medium text-gray-700 mb-2">Formato esperado:</p>
            <div className="font-mono text-gray-600 text-xs">
              CATEGORIA DE PRODUCTOS<br/>
              CODIGO NOMBRE_PRODUCTO UNIDAD $PRECIO<br/>
              6100 BAGUETTE 5.5 KG $14.672,49<br/>
              6108 FLAUTA BLANCA SEMILLADA 6.3 KG $21.833,79<br/>
              <br/>
              OTRA CATEGORIA<br/>
              641 BUDIN DE LIMÓN CLASICO 4 UN $7.009,79
            </div>
          </div>
        </div>

        {/* Campo de texto para pegar productos */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Pega tu lista de productos:</h3>
          
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Pega aquí tu lista de productos...

Ejemplo:
PANES
6100 BAGUETTE 5.5 KG $14.672,49
6108 FLAUTA BLANCA SEMILLADA 6.3 KG $21.833,79

DULCES
641 BUDIN DE LIMÓN CLASICO 4 UN $7.009,79"
            className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          
          <div className="flex justify-between items-center mt-3">
            <span className="text-sm text-gray-500">
              Líneas: {textInput.split('\n').filter(l => l.trim()).length}
            </span>
            
            <div className="flex space-x-3">
              {textInput.trim() && (
                <button
                  onClick={() => setTextInput('')}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 text-sm"
                >
                  Limpiar
                </button>
              )}
              
              <button
                onClick={handleParseText}
                disabled={!textInput.trim()}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Parsear Productos
              </button>
            </div>
          </div>
        </div>

        {/* Mostrar productos parseados */}
        {parsedProducts.length > 0 && (
          <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                ✅ Productos parseados exitosamente
              </h2>
              <button
                onClick={() => {setParsedProducts([]); setResults(null)}}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Limpiar resultados
              </button>
            </div>
            
            <p className="text-gray-600 mb-4">
              Total de productos encontrados: <strong className="text-green-600">{parsedProducts.length}</strong>
            </p>
            
            {/* Resumen por categorías */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {Array.from(new Set(parsedProducts.map(p => p.category))).map(category => (
                <div key={category} className="bg-white p-3 rounded border">
                  <h3 className="font-medium text-sm text-gray-900">{category}</h3>
                  <p className="text-sm text-gray-600">
                    {parsedProducts.filter(p => p.category === category).length} productos
                  </p>
                </div>
              ))}
            </div>

            {/* Vista previa de productos */}
            <div className="mb-4">
              <h3 className="font-medium mb-2 text-gray-900">Vista previa (primeros 5 productos):</h3>
              <div className="bg-white border rounded p-3 text-sm">
                {parsedProducts.slice(0, 5).map((product, index) => (
                  <div key={index} className="flex justify-between items-center py-1 border-b border-gray-100 last:border-b-0">
                    <span>
                      <span className="font-mono text-blue-600 mr-2">{product.code}</span>
                      <span className="text-gray-900">{product.name}</span>
                      <span className="text-gray-500 ml-2">({product.unit})</span>
                    </span>
                    <span className="font-semibold text-green-600">
                      ${product.price.toLocaleString('es-AR')}
                    </span>
                  </div>
                ))}
                {parsedProducts.length > 5 && (
                  <div className="text-center text-gray-500 italic pt-2">
                    ... y {parsedProducts.length - 5} productos más
                  </div>
                )}
              </div>
            </div>

            {/* Botón de inserción */}
            <button
              onClick={() => handleBulkInsert(parsedProducts)}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed w-full font-semibold"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Insertando productos...
                </span>
              ) : (
                `🚀 Insertar ${parsedProducts.length} Productos en la Base de Datos`
              )}
            </button>
          </div>
        )}

        {/* Resultados de inserción */}
        {results && (
          <div className="mt-6 p-4 rounded-lg border">
            <h3 className="font-semibold mb-3">📊 Resultados de la Inserción</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">✅</span>
                  <div>
                    <p className="font-semibold text-green-800">Exitosos</p>
                    <p className="text-2xl font-bold text-green-600">{results.success}</p>
                  </div>
                </div>
              </div>
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">❌</span>
                  <div>
                    <p className="font-semibold text-red-800">Errores</p>
                    <p className="text-2xl font-bold text-red-600">{results.errors}</p>
                  </div>
                </div>
              </div>
            </div>

            {results.details.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Detalles del proceso:</h4>
                <div className="bg-gray-50 border rounded p-3 max-h-60 overflow-y-auto">
                  {results.details.map((detail, index) => (
                    <p key={index} className="text-sm text-gray-700 mb-1 font-mono">
                      {detail}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
