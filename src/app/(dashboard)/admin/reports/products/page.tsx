'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { 
  ArrowLeft, 
  Package, 
  TrendingUp, 
  DollarSign,
  Eye,
  Search,
  Filter,
  Download,
  BarChart3
} from 'lucide-react'
import { formatPrice } from '@/lib/utils/format'

interface ProductReport {
  id: string
  name: string
  code: string
  category: string
  price: number
  price_with_iva: number
  stock: number
  is_available: boolean
  total_sold: number
  total_revenue: number
  last_sale_date: string | null
  created_at: string
}

export default function ProductsReportPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const [products, setProducts] = useState<ProductReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'total_sold' | 'total_revenue' | 'stock'>('total_revenue')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const loadProductsReport = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/admin/dashboard/top-products?limit=all')
      if (!response.ok) {
        throw new Error('Error al cargar reporte de productos')
      }

      const data = await response.json()
      setProducts(data || [])
    } catch (err) {
      console.error('Error loading products report:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user && profile?.role === 'admin') {
      loadProductsReport()
    }
  }, [user, profile])

  // Filtrar y ordenar productos
  const processedProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.code.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = !categoryFilter || product.category === categoryFilter
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      let aValue = a[sortBy]
      let bValue = b[sortBy]
      
      if (sortBy === 'name') {
        aValue = a.name.toLowerCase()
        bValue = b.name.toLowerCase()
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

  // Obtener categorías únicas
  const categories = [...new Set(products.map(p => p.category))].sort()

  // Calcular estadísticas
  const stats = {
    totalProducts: products.length,
    totalSold: products.reduce((sum, p) => sum + (p.total_sold || 0), 0),
    totalRevenue: products.reduce((sum, p) => sum + (p.total_revenue || 0), 0),
    averagePrice: products.length > 0 ? products.reduce((sum, p) => sum + p.price_with_iva, 0) / products.length : 0,
    outOfStock: products.filter(p => p.stock === 0).length,
    topSeller: products.sort((a, b) => (b.total_sold || 0) - (a.total_sold || 0))[0]
  }

  // Mostrar loading mientras se autentica
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando reporte...</p>
        </div>
      </div>
    )
  }

  if (!user || profile?.role !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin/reports">
                <Button variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-50">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver a Reportes
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  Reporte de Productos
                </h1>
                <p className="text-gray-600 mt-1">
                  Análisis detallado de productos, ventas y rentabilidad
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={() => window.print()} className="border-orange-300 text-orange-600 hover:bg-orange-50">
                <Download className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estadísticas Generales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Productos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                <p className="text-sm text-red-500 mt-1">{stats.outOfStock} sin stock</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Package className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unidades Vendidas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSold}</p>
                <p className="text-sm text-gray-500 mt-1">Total histórico</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
                <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.totalRevenue)}</p>
                <p className="text-sm text-gray-500 mt-1">Por productos</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Precio Promedio</p>
                <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.averagePrice)}</p>
                <p className="text-sm text-gray-500 mt-1">Con IVA incluido</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-orange-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <Filter className="h-5 w-5 text-orange-500 mr-2" />
            Filtros y Ordenamiento
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar Producto
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Nombre o código..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-orange-200 focus:border-orange-400 focus:ring-orange-200"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                options={[
                  { value: '', label: 'Todas las categorías' },
                  ...categories.map(category => ({ value: category, label: category }))
                ]}
                className="border-orange-200 focus:border-orange-400 focus:ring-orange-200"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ordenar por
              </label>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                options={[
                  { value: 'total_revenue', label: 'Ingresos' },
                  { value: 'total_sold', label: 'Unidades Vendidas' },
                  { value: 'name', label: 'Nombre' },
                  { value: 'stock', label: 'Stock' }
                ]}
                className="border-orange-200 focus:border-orange-400 focus:ring-orange-200"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Orden
              </label>
              <Select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                options={[
                  { value: 'desc', label: 'Mayor a menor' },
                  { value: 'asc', label: 'Menor a mayor' }
                ]}
                className="border-orange-200 focus:border-orange-400 focus:ring-orange-200"
              />
            </div>
          </div>
        </div>

        {/* Tabla de Productos */}
        <div className="bg-white rounded-xl shadow-lg border border-orange-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              Detalle de Productos ({processedProducts.length} productos)
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendidos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ingresos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {processedProducts.map((product, index) => (
                  <tr key={product.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.code}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatPrice(product.price_with_iva)}</div>
                      <div className="text-xs text-gray-500">Sin IVA: {formatPrice(product.price)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        product.stock === 0 ? 'bg-red-100 text-red-800' :
                        product.stock < 10 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {product.stock} unidades
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.total_sold || 0} unidades
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatPrice(product.total_revenue || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        product.is_available ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.is_available ? 'Disponible' : 'No disponible'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Producto más vendido destacado */}
        {stats.topSeller && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border border-orange-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
              Producto Más Vendido
            </h2>
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{stats.topSeller.name}</h3>
                  <p className="text-gray-600">{stats.topSeller.code} • {stats.topSeller.category}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Precio: {formatPrice(stats.topSeller.price_with_iva)} • Stock: {stats.topSeller.stock}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">{stats.topSeller.total_sold || 0}</p>
                  <p className="text-sm text-gray-600">unidades vendidas</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {formatPrice(stats.topSeller.total_revenue || 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 