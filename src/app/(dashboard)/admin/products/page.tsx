'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Product, ProductFilters } from '@/lib/types/product'
import { productService } from '@/lib/services/product-service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<ProductFilters>({
    page: 1,
    limit: 20
  })
  const [totalProducts, setTotalProducts] = useState(0)

  useEffect(() => {
    loadProducts()
  }, [filters])

  const loadProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/products?' + new URLSearchParams({
        ...filters,
        page: filters.page?.toString() || '1',
        limit: filters.limit?.toString() || '20',
        is_active: filters.is_active?.toString() || ''
      }).toString())
      
      if (!response.ok) {
        throw new Error('Error al cargar productos')
      }
      
      const data = await response.json()
      setProducts(data.products || [])
      setTotalProducts(data.total || 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      setProducts([]) // Asegurar que products sea siempre un array
      setTotalProducts(0)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (id: string) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'PATCH'
      })
      
      if (!response.ok) {
        throw new Error('Error al cambiar estado del producto')
      }
      
      // Recargar productos
      loadProducts()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error desconocido')
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar "${name}"?`)) {
      return
    }
    
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Error al eliminar producto')
      }
      
      // Recargar productos
      loadProducts()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error desconocido')
    }
  }

  const formatPrice = (price: number, ivaRate: number) => {
    const priceWithIVA = price * (1 + ivaRate / 100)
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(priceWithIVA)
  }

  const statusOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'true', label: 'Activos' },
    { value: 'false', label: 'Inactivos' }
  ]

  const totalPages = Math.ceil(totalProducts / (filters.limit || 20))

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Productos</h1>
          <p className="text-gray-600 mt-2">
            Total: {totalProducts} productos
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button>
            + Nuevo Producto
          </Button>
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg border mb-6">
        <h2 className="text-lg font-semibold mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Buscar"
            placeholder="Código, nombre o descripción..."
            value={filters.search || ''}
            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
          />
          
          <Input
            label="Categoría"
            placeholder="Categoría del producto"
            value={filters.category || ''}
            onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}
          />
          
          <Select
            label="Estado"
            options={statusOptions}
            value={filters.is_active?.toString() || ''}
            onChange={(e) => setFilters({ 
              ...filters, 
              is_active: e.target.value ? e.target.value === 'true' : undefined,
              page: 1 
            })}
          />
        </div>
      </div>

      {/* Lista de productos */}
      {loading ? (
        <div className="text-center py-8">
          <p>Cargando productos...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
          <Button 
            variant="outline" 
            onClick={loadProducts}
            className="mt-2"
          >
            Intentar de nuevo
          </Button>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Código
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio + IVA
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(products || []).map((product) => (
                    <tr key={product.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {product.code}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          {product.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {product.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.category || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatPrice(product.price, product.iva_rate)}
                        <div className="text-xs text-gray-500">
                          Base: ${product.price} + {product.iva_rate}% IVA
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.stock_quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          product.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <Link href={`/admin/products/${product.id}`}>
                          <Button variant="outline" size="sm">
                            Editar
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(product.id)}
                        >
                          {product.is_active ? 'Desactivar' : 'Activar'}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(product.id, product.name)}
                        >
                          Eliminar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <p className="text-sm text-gray-700">
                Página {filters.page} de {totalPages} 
                ({totalProducts} productos total)
              </p>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  disabled={filters.page === 1}
                  onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  disabled={filters.page === totalPages}
                  onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
} 