'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatPrice, formatDate } from '@/lib/utils/format'
import { 
  OrderWithItems, 
  OrderListResponse, 
  OrderStatus,
  getOrderStatusConfig 
} from '@/lib/types/order'
import { ChevronLeft, ChevronRight, Search, Eye, Calendar, Package } from 'lucide-react'

export default function OrdersPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  
  // Filtros
  const [filters, setFilters] = useState({
    status: '' as OrderStatus | '',
    search: '',
    dateFrom: '',
    dateTo: ''
  })

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // Cargar pedidos cuando cambian los filtros o la página
  useEffect(() => {
    if (user) {
      loadOrders()
    }
  }, [user, currentPage, filters])

  const loadOrders = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      })

      if (filters.status) params.append('status', filters.status)
      if (filters.search) params.append('search', filters.search)
      if (filters.dateFrom) params.append('created_at_from', filters.dateFrom)
      if (filters.dateTo) params.append('created_at_to', filters.dateTo)

      const response = await fetch(`/api/orders?${params}`)
      
      if (!response.ok) {
        throw new Error('Error al cargar pedidos')
      }

      const data: OrderListResponse = await response.json()
      console.log('📦 Datos de pedidos recibidos:', data)
      console.log('📦 Primer pedido completo:', data.orders[0])
      if (data.orders[0]?.items) {
        console.log('📦 Items del primer pedido:', data.orders[0].items)
        console.log('📦 Cantidad de items:', data.orders[0].items.length)
      } else {
        console.log('⚠️ El primer pedido NO tiene items o items es undefined')
        console.log('📦 Estructura del primer pedido:', Object.keys(data.orders[0] || {}))
      }
      setOrders(data.orders)
      setTotalPages(data.totalPages)
    } catch (err) {
      console.error('Error loading orders:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar pedidos')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1) // Reset to first page when filtering
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Mostrar loading mientras se autentica
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-orange-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                Mis Pedidos
              </h1>
              <p className="text-gray-600 mt-1">
                Historial y seguimiento de tus pedidos
              </p>
            </div>
            <div className="flex space-x-4">
              <Link href="/catalog">
                <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                  Hacer Nuevo Pedido
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-50">
                  ← Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Search className="h-5 w-5 text-orange-500 mr-2" />
            Filtros de Búsqueda
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Búsqueda por texto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <Input
                type="text"
                placeholder="Número de pedido, producto..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="border-orange-200 focus:border-orange-400 focus:ring-orange-200"
              />
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full p-2 border border-orange-200 rounded-lg focus:border-orange-400 focus:ring-orange-200"
              >
                <option value="">Todos los estados</option>
                <option value="pending">Pendiente</option>
                <option value="confirmed">Confirmado</option>
                <option value="preparing">En Preparación</option>
                <option value="ready">Listo</option>
                <option value="delivered">Entregado</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>

            {/* Fecha desde */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Desde
              </label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="border-orange-200 focus:border-orange-400 focus:ring-orange-200"
              />
            </div>

            {/* Fecha hasta */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hasta
              </label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="border-orange-200 focus:border-orange-400 focus:ring-orange-200"
              />
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button 
              onClick={() => {
                setFilters({ status: '', search: '', dateFrom: '', dateTo: '' })
                setCurrentPage(1)
              }}
              variant="outline"
              className="border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              Limpiar Filtros
            </Button>
          </div>
        </div>

        {/* Lista de Pedidos */}
        <div className="bg-white rounded-xl shadow-lg border border-orange-100">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando pedidos...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <div className="text-red-500 mb-4">❌</div>
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={loadOrders} className="bg-orange-600 hover:bg-orange-700 text-white">
                Reintentar
              </Button>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay pedidos
              </h3>
              <p className="text-gray-600 mb-6">
                Aún no has realizado ningún pedido. ¡Explora nuestro catálogo!
              </p>
              <Link href="/catalog">
                <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                  Explorar Catálogo
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {orders.map((order) => {
                const statusConfig = getOrderStatusConfig(order.status)
                return (
                  <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Pedido #{order.id.slice(-8).toUpperCase()}
                          </h3>
                          <p className="text-sm text-gray-600 flex items-center mt-1">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(order.created_at)}
                          </p>
                        </div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor} border`}>
                          {statusConfig.label}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-orange-600">
                          {formatPrice(order.total_amount)}
                        </div>
                        <p className="text-sm text-gray-500">
                          {order.items?.length || 0} {(order.items?.length || 0) === 1 ? 'producto' : 'productos'}
                        </p>
                      </div>
                    </div>

                    {/* Productos del pedido (resumen) */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {(order.items || []).slice(0, 3).map((item, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-700">
                            {item.product_name} x{item.quantity}
                          </span>
                        ))}
                        {(order.items?.length || 0) > 3 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                            +{(order.items?.length || 0) - 3} más
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Información adicional */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                      {order.delivery_date && (
                        <div>
                          <span className="font-medium">Entrega: </span>
                          {formatDate(order.delivery_date)}
                        </div>
                      )}
                      {order.delivery_address && (
                        <div>
                          <span className="font-medium">Dirección: </span>
                          {order.delivery_address}
                        </div>
                      )}
                      {order.phone && (
                        <div>
                          <span className="font-medium">Teléfono: </span>
                          {order.phone}
                        </div>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-500">
                        {statusConfig.description}
                      </div>
                      <div className="flex space-x-2">
                        <Link href={`/orders/${order.id}`}>
                          <Button variant="outline" size="sm" className="border-orange-300 text-orange-600 hover:bg-orange-50">
                            <Eye className="h-4 w-4 mr-1" />
                            Ver Detalles
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Página {currentPage} de {totalPages}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="border-orange-300 text-orange-600 hover:bg-orange-50 disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="border-orange-300 text-orange-600 hover:bg-orange-50 disabled:opacity-50"
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 