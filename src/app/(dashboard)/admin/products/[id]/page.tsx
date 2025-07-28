'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Product, CreateProductRequest } from '@/lib/types/product'
import { ProductForm } from '@/components/forms/product-form'
import { Button } from '@/components/ui/button'

interface EditProductPageProps {
  params: Promise<{ id: string }>
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [productId, setProductId] = useState<string | null>(null)

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
      setProduct(productData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: CreateProductRequest) => {
    if (!productId) return
    
    try {
      setSaving(true)
      setError(null)

      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al actualizar producto')
      }

      // Redirigir a la lista de productos después de actualizar
      router.push('/admin/products')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    router.push('/admin/products')
  }

  if (!productId || loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="text-center py-8">
          <p>Cargando producto...</p>
        </div>
      </div>
    )
  }

  if (error && !product) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
          <div className="mt-4 space-x-2">
            <Link href="/admin/products">
              <Button variant="outline">
                ← Volver a Productos
              </Button>
            </Link>
            <Button onClick={loadProduct}>
              Intentar de nuevo
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <Link href="/admin/products">
            <Button variant="outline">
              ← Volver a Productos
            </Button>
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Editar Producto</h1>
        {product && (
          <p className="text-gray-600 mt-2">
            Modificando: <span className="font-medium">{product.name}</span> ({product.code})
          </p>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Información del producto actual */}
      {product && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Información actual</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
            <div>
              <span className="font-medium">Estado:</span> 
              <span className={`ml-2 ${product.is_active ? 'text-green-600' : 'text-red-600'}`}>
                {product.is_active ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            <div>
              <span className="font-medium">Creado:</span> 
              <span className="ml-2">
                {new Date(product.created_at).toLocaleDateString('es-AR')}
              </span>
            </div>
            <div>
              <span className="font-medium">Última actualización:</span> 
              <span className="ml-2">
                {new Date(product.updated_at).toLocaleDateString('es-AR')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Formulario */}
      {product && (
        <div className="bg-white rounded-lg border p-6">
          <ProductForm
            product={product}
            onSubmit={handleSubmit}
            isLoading={saving}
            onCancel={handleCancel}
          />
        </div>
      )}

      {/* Información adicional */}
      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <h3 className="text-lg font-semibold text-yellow-900 mb-2">Consideraciones al editar</h3>
        <ul className="text-yellow-800 space-y-1 text-sm">
          <li>• Los cambios de precio afectarán nuevos pedidos, no los existentes</li>
          <li>• Cambiar el código puede afectar referencias externas</li>
          <li>• Desactivar el producto lo ocultará del catálogo de clientes</li>
          <li>• Los cambios se guardan inmediatamente al enviar el formulario</li>
        </ul>
      </div>
    </div>
  )
} 