'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
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

// Hook de debounce para evitar llamadas excesivas a la API
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debouncedValue
}

const ITEMS_PER_PAGE = 30

export default function CatalogPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)

  // Carrito
  const addItem = useCartStore(state => state.addItem)

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({ min: '', max: '' })
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // Debounce para búsqueda y precios (evita una petición por cada tecla)
  const debouncedSearch = useDebounce(searchTerm, 400)
  const debouncedMinPrice = useDebounce(priceRange.min, 500)
  const debouncedMaxPrice = useDebounce(priceRange.max, 500)

  // Ref para el sentinel del infinite scroll
  const sentinelRef = useRef<HTMLDivElement>(null)
  // Ref para controlar peticiones en curso
  const isLoadingRef = useRef(false)

  const categories = useMemo(() => [
    'Panaderia',
    'Pasteleria',
    'Bolleria',
    'Confiteria',
    'Bebidas',
    'Especiales'
  ], [])

  const sortOptions = useMemo(() => [
    { value: 'name', label: 'Nombre' },
    { value: 'price', label: 'Precio' },
    { value: 'created_at', label: 'Más recientes' }
  ], [])

  // Función para cargar productos (memoizada con useCallback)
  const loadProducts = useCallback(async (pageNum: number, append: boolean = false) => {
    if (isLoadingRef.current) return
    isLoadingRef.current = true

    try {
      if (append) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }
      setError(null)

      const filters: ProductFilters = {
        search: debouncedSearch || undefined,
        category: selectedCategory || undefined,
        minPrice: debouncedMinPrice ? parseFloat(debouncedMinPrice) : undefined,
        maxPrice: debouncedMaxPrice ? parseFloat(debouncedMaxPrice) : undefined,
        isActive: true,
      }

      const queryParams = new URLSearchParams({
        page: pageNum.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        sortBy,
        sortOrder,
        ...Object.fromEntries(
          Object.entries(filters)
            .filter(([, v]) => v !== undefined)
            .map(([k, v]) => [k, String(v)])
        )
      })

      const response = await fetch(`/api/products?${queryParams}`)
      if (!response.ok) {
        throw new Error('Error al cargar productos')
      }

      const data: ProductListResponse = await response.json()

      if (append) {
        setAllProducts(prev => [...prev, ...data.products])
      } else {
        setAllProducts(data.products)
      }

      setTotal(data.total)
      setHasMore(pageNum < data.totalPages)
    } catch (err) {
      console.error('Error loading products:', err)
      setError('Error al cargar el catálogo. Por favor, intenta nuevamente.')
    } finally {
      setLoading(false)
      setLoadingMore(false)
      isLoadingRef.current = false
    }
  }, [debouncedSearch, selectedCategory, debouncedMinPrice, debouncedMaxPrice, sortBy, sortOrder])

  // Cuando cambian los filtros, resetear y cargar desde página 1
  useEffect(() => {
    setPage(1)
    setAllProducts([])
    setHasMore(true)
    loadProducts(1, false)
  }, [loadProducts])

  // Infinite scroll con IntersectionObserver
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry.isIntersecting && hasMore && !isLoadingRef.current) {
          const nextPage = page + 1
          setPage(nextPage)
          loadProducts(nextPage, true)
        }
      },
      { rootMargin: '200px', threshold: 0.1 }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, page, loadProducts])

  // Limpiar filtros
  const clearFilters = useCallback(() => {
    setSearchTerm('')
    setSelectedCategory('')
    setPriceRange({ min: '', max: '' })
    setSortBy('name')
    setSortOrder('asc')
  }, [])

  // Agregar producto al carrito
  const handleAddToCart = useCallback((product: Product, quantity: number = 1) => {
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
  }, [addItem])

  if (error && allProducts.length === 0) {
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
                onClick={() => loadProducts(1, false)}
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
      {/* Header */}
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
              {total > 0 && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-700">
                    {total} productos disponibles
                    {allProducts.length < total && ` · Mostrando ${allProducts.length}`}
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
          {/* Sidebar de Filtros con sticky */}
          <div className="mb-8 lg:mb-0">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100 lg:sticky lg:top-4">
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

          {/* Lista de Productos con Scroll Infinito */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-lg p-6 animate-pulse border border-orange-100">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <div className="h-4 bg-orange-100 rounded-lg mb-2 w-1/4"></div>
                        <div className="h-5 bg-orange-100 rounded-lg mb-2 w-1/2"></div>
                        <div className="h-4 bg-orange-100 rounded-lg w-1/3"></div>
                      </div>
                      <div className="h-10 bg-orange-100 rounded-lg w-24"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : allProducts.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-white rounded-xl shadow-lg p-12 border border-orange-100">
                  <div className="text-8xl mb-6">🔍</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    No encontramos productos
                  </h3>
                  <p className="text-gray-600 mb-8 text-lg">
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
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-6 py-4 border-b border-orange-100 sticky top-0 z-10">
                  <h3 className="text-lg font-semibold text-gray-900">Productos Disponibles</h3>
                  <p className="text-sm text-gray-600">{total} productos encontrados</p>
                </div>

                {/* Lista de productos con scroll infinito */}
                <div className="divide-y divide-gray-100">
                  {allProducts.map((product) => (
                    <ProductRow
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>

                {/* Sentinel para infinite scroll */}
                <div ref={sentinelRef} className="h-4" />

                {/* Indicador de carga de más productos */}
                {loadingMore && (
                  <div className="flex justify-center py-8">
                    <div className="flex items-center space-x-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
                      <span className="text-gray-600 font-medium">Cargando más productos...</span>
                    </div>
                  </div>
                )}

                {/* Indicador de fin de lista */}
                {!hasMore && allProducts.length > 0 && (
                  <div className="text-center py-6 border-t border-gray-100">
                    <p className="text-gray-500 text-sm">
                      ✅ Has visto todos los {total} productos
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente memoizado para cada fila de producto (evita re-renders innecesarios)
const ProductRow = React.memo(function ProductRow({
  product,
  onAddToCart,
}: {
  product: Product
  onAddToCart: (product: Product, quantity: number) => void
}) {
  const priceWithIVA = calculatePriceWithIVA(product.price, product.iva_rate)
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
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
              ref={inputRef}
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
              const quantity = parseInt(inputRef.current?.value || '1')
              onAddToCart(product, quantity)
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
}) 