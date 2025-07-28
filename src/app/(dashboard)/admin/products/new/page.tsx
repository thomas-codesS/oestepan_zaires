'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CreateProductRequest } from '@/lib/types/product'
import { ProductForm } from '@/components/forms/product-form'
import { Button } from '@/components/ui/button'

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (data: CreateProductRequest) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al crear producto')
      }

      // Redirigir a la lista de productos después de crear
      router.push('/admin/products')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/admin/products')
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
        <h1 className="text-3xl font-bold text-gray-900">Crear Nuevo Producto</h1>
        <p className="text-gray-600 mt-2">
          Completa la información del producto siguiendo los estándares de Oeste Pan.
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Formulario */}
      <div className="bg-white rounded-lg border p-6">
        <ProductForm
          onSubmit={handleSubmit}
          isLoading={loading}
          onCancel={handleCancel}
        />
      </div>

      {/* Información adicional */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-md p-4">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Información importante</h3>
        <ul className="text-blue-800 space-y-1 text-sm">
          <li>• El código debe ser único y seguir el formato establecido (ej: PAN-001)</li>
          <li>• Los precios se ingresan sin IVA, el sistema calculará automáticamente el precio final</li>
          <li>• Los productos se crean como "Activos" por defecto</li>
          <li>• La categoría ayuda a organizar el catálogo para los clientes</li>
        </ul>
      </div>
    </div>
  )
} 