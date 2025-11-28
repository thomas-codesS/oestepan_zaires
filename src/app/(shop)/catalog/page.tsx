'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatPrice } from '@/lib/utils/format'
import { useCartStore } from '@/lib/store/cart-store'
import { CartButton } from '@/components/features/cart/cart-sidebar'

// Tipos actualizados para el catálogo
interface Product {
  id: string
  code: string
  name: string
  description: string
  price: number // Precio sin IVA
  iva_rate: number // Tasa de IVA
  category: string
  is_active: boolean
  stock_quantity: number
  created_at: string
  updated_at: string
}

interface ProductListResponse {
  products: Product[]
  total: number
  totalPages: number
  currentPage: number
}

interface ProductFilters {
  search?: string
  category?: string
  minPrice?: number
  maxPrice?: number
  isActive?: boolean
}

// Función helper para calcular precio con IVA
const calculatePriceWithIVA = (price: number, ivaRate: number): number => {
  return price * (1 + ivaRate / 100)
}

// Función helper para obtener emoji de categoría
const getCategoryEmoji = (category: string): string => {
  const categoryEmojis: Record<string, string> = {
    'panaderia': '🍞',
    'pasteleria': '🍰',
    'bolleria': '🥐',
    'confiteria': '🧁',
    'bebidas': '☕',
    'pan': '🥖',
    'facturas': '🥐',
    'tortas': '🎂',
    'galletas': '🍪',
    'especiales': '⭐'
  }
  return categoryEmojis[category.toLowerCase()] || '🥖'
}

export default function CatalogPage() {
  const [products, setProducts] = useState<ProductListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Carrito
  const addItem = useCartStore(state => state.addItem)

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({ min: '', max: '' })
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // Paginación
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  const categories = [
    'Panaderia',
    'Pasteleria', 
    'Bolleria',
    'Confiteria',
    'Bebidas',
    'Especiales'
  ]

  const sortOptions = [
    { value: 'name', label: 'Nombre' },
    { value: 'price', label: 'Precio' },
    { value: 'created_at', label: 'Más recientes' }
  ]

  // Función para cargar productos
  const loadProducts = async () => {
    try {
      setLoading(true)
      setError(null)

      const filters: ProductFilters = {
        search: searchTerm || undefined,
        category: selectedCategory || undefined,
        minPrice: priceRange.min ? parseFloat(priceRange.min) : undefined,
        maxPrice: priceRange.max ? parseFloat(priceRange.max) : undefined,
        isActive: true, // Solo productos activos en el catálogo público
      }

      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        sortBy,
        sortOrder,
        ...Object.fromEntries(
          Object.entries(filters)
            .filter(([_, v]) => v !== undefined)
            .map(([k, v]) => [k, String(v)])
        )
      })

      const response = await fetch(`/api/products?${queryParams}`)
      if (!response.ok) {
        throw new Error('Error al cargar productos')
      }

      const data: ProductListResponse = await response.json()
      setProducts(data)
    } catch (err) {
      console.error('Error loading products:', err)
      setError('Error al cargar el catálogo. Por favor, intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  // Cargar productos al montar el componente y cuando cambien los filtros
  useEffect(() => {
    loadProducts()
  }, [searchTerm, selectedCategory, priceRange, sortBy, sortOrder, currentPage])

  // Manejar cambio de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Limpiar filtros
  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('')
    setPriceRange({ min: '', max: '' })
    setSortBy('name')
    setSortOrder('asc')
    setCurrentPage(1)
  }

  // Agregar producto al carrito
  const handleAddToCart = (product: Product, quantity: number = 1) => {
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
    
    addItem(cartProduct, quantity)
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="bg-white border border-red-200 rounded-xl shadow-lg p-8">
              <div className="text-6xl mb-4">😔</div>
              <h2 className="text-2xl font-bold text-red-700 mb-4">
                ¡Ups! Algo salió mal
              </h2>
              <p className="text-red-600 mb-6">{error}</p>
              <Button 
                onClick={loadProducts}
                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium"
              >
                Intentar Nuevamente
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Header Elegante */}
      <div className="bg-white shadow-lg border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <div className="flex items-center space-x-3 mb-2">
                <div className="text-2xl sm:text-3xl">🥖</div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  Catálogo Oeste Pan
                </h1>
              </div>
              <p className="text-gray-600 text-lg">
                Productos frescos horneados diariamente con amor y tradición
              </p>
              {products && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-700">
                    {products.total} productos disponibles
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <CartButton />
              <Link href="/dashboard">
                <Button 
                  variant="outline" 
                  className="border-orange-300 text-orange-600 hover:bg-orange-50"
                >
                  ← Volver al Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Sidebar de Filtros Moderno */}
          <div className="mb-8 lg:mb-0">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <span className="text-orange-500 mr-2">🔍</span>
                  Filtros
                </h2>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearFilters}
                  className="text-sm border-orange-300 text-orange-600 hover:bg-orange-50"
                >
                  Limpiar
                </Button>
              </div>

              {/* Búsqueda */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Buscar
                </label>
                <Input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-orange-200 focus:border-orange-400 focus:ring-orange-200"
                />
              </div>

              {/* Categoría */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Categoría
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-3 border border-orange-200 rounded-lg focus:ring-orange-200 focus:border-orange-400 bg-white"
                >
                  <option value="">Todas las categorías</option>
                  {categories.map((category) => (
                    <option key={category} value={category.toLowerCase()}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rango de Precios */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Rango de Precios
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="number"
                    placeholder="Mín"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                    className="border-orange-200 focus:border-orange-400 focus:ring-orange-200"
                  />
                  <Input
                    type="number"
                    placeholder="Máx"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                    className="border-orange-200 focus:border-orange-400 focus:ring-orange-200"
                  />
                </div>
              </div>

              {/* Ordenar por */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Ordenar por
                </label>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-')
                    setSortBy(field)
                    setSortOrder(order as 'asc' | 'desc')
                  }}
                  className="w-full p-3 border border-orange-200 rounded-lg focus:ring-orange-200 focus:border-orange-400 bg-white"
                >
                  {sortOptions.map((option) => (
                    <React.Fragment key={option.value}>
                      <option value={`${option.value}-asc`}>
                        {option.label} (A-Z)
                      </option>
                      <option value={`${option.value}-desc`}>
                        {option.label} (Z-A)
                      </option>
                    </React.Fragment>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Grid de Productos */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-lg p-6 animate-pulse border border-orange-100">
                    <div className="w-full h-48 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl mb-4"></div>
                    <div className="h-4 bg-orange-100 rounded-lg mb-2"></div>
                    <div className="h-4 bg-orange-100 rounded-lg w-2/3 mb-4"></div>
                    <div className="h-8 bg-orange-100 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : products?.products?.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-white rounded-xl shadow-lg p-12 border border-orange-100">
                  <div className="text-8xl mb-6">🔍</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    No encontramos productos
                  </h3>
                  <p clas
                  cls
                  sName="text-gray-600 mb-8 text-lg">
                    Intenta ajustar tus filtros o busca algo diferente
                  </p>
                  <Button 
                    onClick={clearFilters}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg font-medium"
                  >
                    Limpiar Filtros
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg border border-orange-100 overflow-hidden">
                {/* Header de la lista */}
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-6 py-4 border-b border-orange-100">
                  <h3 className="text-lg font-semibold text-gray-900">Productos Disponibles</h3>
                  <p className="text-sm text-gray-600">{products?.total || 0} productos encontrados</p>
                </div>

                {/* Lista de productos */}
                <div className="divide-y divide-gray-100">
                  {products?.products?.map((product) => {
                    const priceWithIVA = calculatePriceWithIVA(product.price, product.iva_rate)
                    
                    return (
                      <div key={product.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0">
                          {/* Info del producto */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-700">
                                {product.category}
                              </span>
                              <span className="text-xs text-gray-500">#{product.code}</span>
                            </div>
                            
                            <h4 className="text-lg font-semibold text-gray-900 mb-1">
                              {product.name}
                            </h4>
                            
                            {product.description && (
                              <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                                {product.description}
                              </p>
                            )}
                            
                            <div className="flex items-center space-x-4 text-sm">
                              <span className="font-semibold text-gray-900">
                                {formatPrice(priceWithIVA)}
                              </span>
                              <span className="text-gray-500">
                                IVA {product.iva_rate}% incl.
                              </span>
                            </div>
                          </div>

                          {/* Controles de cantidad y agregar */}
                          <div className="flex items-center justify-between sm:justify-end space-x-3 w-full sm:w-auto mt-2 sm:mt-0 sm:ml-4">
                            <div className="flex items-center space-x-2">
                              <label htmlFor={`qty-${product.id}`} className="text-sm text-gray-600">
                                Cant:
                              </label>
                              <input
                                id={`qty-${product.id}`}
                                type="number"
                                min="1"
                                defaultValue="1"
                                className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                              />
                            </div>
                            
                            <Button 
                              size="sm"
                              onClick={() => {
                                const input = document.getElementById(`qty-${product.id}`) as HTMLInputElement
                                const quantity = parseInt(input?.value || '1')
                                handleAddToCart(product, quantity)
                              }}
                              className="bg-orange-600 hover:bg-orange-700 text-white px-6"
                            >
                              + Agregar
                            </Button>
                            
                            <Link href={`/catalog/${product.id}`}>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="border-orange-300 text-orange-600 hover:bg-orange-50"
                              >
                                Ver
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Paginación Elegante */}
            {products && products.totalPages > 1 && (
              <div className="flex justify-center mt-12">
                <div className="flex items-center space-x-2 bg-white rounded-xl shadow-lg p-2 border border-orange-100">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="border-orange-300 text-orange-600 hover:bg-orange-50 disabled:text-gray-400"
                  >
                    ← Anterior
                  </Button>
                  
                  {[...Array(products.totalPages)].map((_, i) => (
                    <Button
                      key={i + 1}
                      variant={currentPage === i + 1 ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(i + 1)}
                      className={currentPage === i + 1 
                        ? "bg-orange-600 hover:bg-orange-700 text-white"
                        : "border-orange-300 text-orange-600 hover:bg-orange-50"
                      }
                    >
                      {i + 1}
                    </Button>
                  ))}
                  
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === products.totalPages}
                    className="border-orange-300 text-orange-600 hover:bg-orange-50 disabled:text-gray-400"
                  >
                    Siguiente →
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 