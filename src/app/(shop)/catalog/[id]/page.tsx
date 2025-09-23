'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils/format'
import { useCartStore } from '@/lib/store/cart-store'

interface Product {
  id: string
  code: string
  name: string
  description: string
  price: number
  iva_rate: number
  category: string
  is_active: boolean
  stock_quantity: number
  created_at: string
  updated_at: string
}

interface ProductDetailPageProps {
  params: Promise<{ id: string }>
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [productId, setProductId] = useState<string | null>(null)
  
  const addItem = useCartStore(state => state.addItem)

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setProductId(resolvedParams.id)
    }
    getParams()
  }, [params])

  useEffect(() => {
    if (productId) {
      loadProduct()
    }
  }, [productId])

  const loadProduct = async () => {
    if (!productId) return

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/products/${productId}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Producto no encontrado')
        }
        throw new Error('Error al cargar producto')
      }

      const productData = await response.json()
      
      // Verificar que el producto esté activo para el catálogo público
      if (!productData.is_active) {
        throw new Error('Este producto no está disponible')
      }
      
      setProduct(productData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const calculatePriceWithIVA = (price: number, ivaRate: number): number => {
    return price * (1 + ivaRate / 100)
  }

  const handleAddToCart = () => {
    if (!product) return

    const priceWithIVA = calculatePriceWithIVA(product.price, product.iva_rate)
    
    const cartProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      price_with_iva: priceWithIVA,
      iva_rate: product.iva_rate,
      category: product.category,
      code: product.code
    }
    
    addItem(cartProduct, 1)
    
    // Mostrar feedback al usuario
    // TODO: Implementar toast notification
    alert(`${product.name} agregado al carrito`)
  }

  const getCategoryEmoji = (category: string): string => {
    const categoryEmojis: Record<string, string> = {
      'panaderia': '🍞',
      'pasteleria': '🍰',
      'bolleria': '🥐',
      'confiteria': '🧁',
      'bebidas': '☕',
      'especiales': '⭐'
    }
    return categoryEmojis[category?.toLowerCase()] || '🥖'
  }

  if (!productId || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando producto...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <div className="bg-white border border-red-200 rounded-xl shadow-lg p-8">
              <div className="text-6xl mb-4">😔</div>
              <h2 className="text-2xl font-bold text-red-700 mb-4">
                {error === 'Producto no encontrado' ? 'Producto no encontrado' : 'Error al cargar'}
              </h2>
              <p className="text-red-600 mb-6">{error}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/catalog">
                  <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                    ← Volver al Catálogo
                  </Button>
                </Link>
                <Button 
                  onClick={loadProduct} 
                  variant="outline"
                  className="border-orange-300 text-orange-600 hover:bg-orange-50"
                >
                  Intentar Nuevamente
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const priceWithIVA = calculatePriceWithIVA(product.price, product.iva_rate)

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Header con navegación */}
      <div className="bg-white shadow-lg border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link href="/catalog">
              <Button 
                variant="outline" 
                className="border-orange-300 text-orange-600 hover:bg-orange-50"
              >
                ← Volver al Catálogo
              </Button>
            </Link>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              Detalle del Producto
            </h1>
            <div></div> {/* Spacer for flex layout */}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-orange-100">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Imagen del producto (placeholder) */}
            <div className="space-y-4">
              <div className="aspect-square bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl flex items-center justify-center border-2 border-orange-200">
                <div className="text-center">
                  <div className="text-6xl mb-4">{getCategoryEmoji(product.category)}</div>
                  <p className="text-orange-600 font-medium">Imagen del producto</p>
                  <p className="text-orange-500 text-sm">Próximamente</p>
                </div>
              </div>
              
              {/* Información adicional */}
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <h3 className="font-semibold text-orange-900 mb-2">Información del Producto</h3>
                <div className="space-y-2 text-sm text-orange-800">
                  <div className="flex justify-between">
                    <span>Código:</span>
                    <span className="font-mono">{product.code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Categoría:</span>
                    <span className="capitalize">{product.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estado:</span>
                    <span className="text-green-700">
                      Disponible
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Información del producto */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{getCategoryEmoji(product.category)}</span>
                  <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium capitalize">
                    {product.category}
                  </span>
                </div>
              </div>

              {/* Descripción */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Descripción</h2>
                <p className="text-gray-600 leading-relaxed">
                  {product.description || 'Producto fresco de panadería, elaborado con ingredientes de primera calidad.'}
                </p>
              </div>

              {/* Precios */}
              <div className="bg-gray-50 rounded-lg p-6 border">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Precios</h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Precio base:</span>
                    <span className="text-lg font-semibold">{formatPrice(product.price)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>IVA ({product.iva_rate}%):</span>
                    <span>+ {formatPrice(product.price * (product.iva_rate / 100))}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-gray-900">Precio final:</span>
                      <span className="text-2xl font-bold text-orange-600">
                        {formatPrice(priceWithIVA)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botón de agregar al carrito */}
              <div className="space-y-4">
                <Button 
                  onClick={handleAddToCart}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 text-lg font-semibold"
                >
                  🛒 Agregar al Carrito - {formatPrice(priceWithIVA)}
                </Button>
                
                <div className="text-center">
                  <Link href="/catalog">
                    <Button 
                      variant="outline"
                      className="border-orange-300 text-orange-600 hover:bg-orange-50"
                    >
                      Seguir Comprando
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Información de entrega */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                  🚚 Información de Entrega
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Entrega coordinada según disponibilidad</li>
                  <li>• Productos frescos del día</li>
                  <li>• Consultar por pedidos especiales</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 