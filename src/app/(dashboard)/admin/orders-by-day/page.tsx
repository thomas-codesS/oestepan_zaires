'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatPrice, formatDate } from '@/lib/utils/format'
import { 
  Calendar,
  MapPin,
  Phone,
  User,
  Package,
  FileText,
  ArrowLeft,
  Filter,
  Search,
  Download,
  Eye,
  X
} from 'lucide-react'

interface OrdersByDayItem {
  delivery_date: string
  total_amount: number
  total_orders: number
  clients: Array<{
    client_name: string
    client_email: string
    delivery_address: string | null
    phone: string | null
    order_count: number
    total_amount: number
    orders: Array<{
      id: string
      status: string
      created_at: string
      items_count: number
      notes: string | null
      total_amount: number
    }>
  }>
}

interface OrdersByDayStats {
  total_days: number
  total_orders: number
  total_amount: number
  unique_clients: number
  date_range: { startDate: string; endDate: string }
}

export default function OrdersByDayPage() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  
  const [ordersByDay, setOrdersByDay] = useState<OrdersByDayItem[]>([])
  const [stats, setStats] = useState<OrdersByDayStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Estados para el resumen de productos
  const [showingSummary, setShowingSummary] = useState<string | null>(null)
  const [productsSummary, setProductsSummary] = useState<any[]>([])
  const [summaryLoading, setSummaryLoading] = useState(false)
  
  // Filtros - Rango más amplio para incluir pedidos futuros
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Últimos 90 días
  )
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Hasta 1 año futuro
  )
  const [searchTerm, setSearchTerm] = useState('')

  // Redirigir si no está autenticado o no es admin
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login')
      } else if (profile?.role !== 'admin') {
        router.push('/dashboard')
      }
    }
  }, [user, profile, authLoading, router])

  // Cargar datos
  const loadOrdersByDay = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        startDate,
        endDate
      })

      const response = await fetch(`/api/admin/dashboard/orders-by-day?${params}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al cargar pedidos')
      }

      const data = await response.json()
      setOrdersByDay(data.orders_by_day || [])
      setStats(data.stats)
    } catch (err) {
      console.error('Error loading orders by day:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  // Cargar resumen de productos por fecha
  const loadProductsSummary = async (date: string) => {
    try {
      setSummaryLoading(true)
      const response = await fetch(`/api/admin/dashboard/products-summary?date=${date}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al cargar resumen de productos')
      }

      const data = await response.json()
      setProductsSummary(data.products || [])
      setShowingSummary(date)
    } catch (err) {
      console.error('Error loading products summary:', err)
      alert(err instanceof Error ? err.message : 'Error al cargar resumen de productos')
    } finally {
      setSummaryLoading(false)
    }
  }

  // Manejar cambio de estado de pedido
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al actualizar estado del pedido')
      }

      // Recargar datos para reflejar el cambio
      await loadOrdersByDay()
      
      // Mostrar notificación de éxito
      const statusText = newStatus === 'delivered' ? 'entregado' : 'confirmado'
      alert(`Pedido marcado como ${statusText} exitosamente`)
    } catch (err) {
      console.error('Error updating order status:', err)
      alert(err instanceof Error ? err.message : 'Error al actualizar estado del pedido')
    }
  }

  useEffect(() => {
    if (user && profile?.role === 'admin') {
      loadOrdersByDay()
    }
  }, [user, profile, startDate, endDate])

  // Filtrar por término de búsqueda
  const filteredOrders = ordersByDay.filter(day => 
    day.clients.some(client =>
      client.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.client_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.delivery_address && client.delivery_address.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  ).map(day => ({
    ...day,
    clients: day.clients.filter(client =>
      searchTerm === '' ||
      client.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.client_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.delivery_address && client.delivery_address.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }))

  // Obtener status badge
  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { label: string; bgColor: string; textColor: string } } = {
      pending: { label: 'Pendiente', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' },
      confirmed: { label: 'Confirmado', bgColor: 'bg-blue-100', textColor: 'text-blue-800' },
      preparing: { label: 'Preparando', bgColor: 'bg-orange-100', textColor: 'text-orange-800' },
      ready: { label: 'Listo', bgColor: 'bg-green-100', textColor: 'text-green-800' },
      delivered: { label: 'Entregado', bgColor: 'bg-green-100', textColor: 'text-green-800' },
      cancelled: { label: 'Cancelado', bgColor: 'bg-red-100', textColor: 'text-red-800' }
    }
    
    const config = statusConfig[status] || statusConfig.pending
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${config.bgColor} ${config.textColor}`}>
        {config.label}
      </span>
    )
  }

  // Mostrar loading mientras se autentica
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
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
              <Link href="/admin/dashboard">
                <Button variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-50">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver al Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  Pedidos por Día
                </h1>
                <p className="text-gray-600 mt-1">
                  Vista agrupada por fecha, cliente y dirección de entrega
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
        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-orange-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <Filter className="h-5 w-5 text-orange-500 mr-2" />
            Filtros y Búsqueda
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Inicio
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border-orange-200 focus:border-orange-400 focus:ring-orange-200"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Fin
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border-orange-200 focus:border-orange-400 focus:ring-orange-200"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar Cliente o Dirección
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Nombre, email o dirección..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-orange-200 focus:border-orange-400 focus:ring-orange-200"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Días con Pedidos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_days}</p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Pedidos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_orders}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
                  <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.total_amount)}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">$</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Clientes Únicos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.unique_clients}</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lista de Pedidos Agrupados */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="space-y-8">
          {filteredOrders.map((day, dayIndex) => (
            <div key={`${day.delivery_date}-${dayIndex}`} className="bg-white rounded-xl shadow-lg border border-orange-100">
              {/* Header del Día - Naranja */}
              <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-4 rounded-t-xl text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-6 w-6 text-white" />
                      <span className="text-xl font-bold">
                        📅 {formatDate(day.delivery_date)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadProductsSummary(day.delivery_date)}
                      className="border-white text-white bg-transparent hover:bg-white hover:text-orange-600"
                    >
                      <Package className="h-4 w-4 mr-2" />
                      Ver Resumen Productos
                    </Button>
                    <div className="text-right">
                      <p className="text-sm opacity-90">{day.clients.length} cliente(s) • {day.total_orders} pedido(s)</p>
                      <p className="text-xl font-bold">Total del día: {formatPrice(day.total_amount)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resumen de Productos (si está activo para esta fecha) */}
              {showingSummary === day.delivery_date && (
                <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Package className="h-5 w-5 text-blue-600 mr-2" />
                      Resumen Total de Productos - {formatDate(day.delivery_date)}
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowingSummary(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {summaryLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-3 text-gray-600">Cargando resumen...</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {productsSummary.map((product) => (
                        <div key={product.product_id} className="bg-white rounded-lg p-4 border border-blue-200">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900">{product.product_name}</h5>
                              <p className="text-sm text-gray-500">Código: {product.product_code}</p>
                              <p className="text-sm text-gray-600">{formatPrice(product.price)} c/u</p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-blue-600">{product.total_quantity}</p>
                              <p className="text-xs text-gray-500">unidades</p>
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-sm text-gray-600">
                              Total: <span className="font-semibold">{formatPrice(product.price * product.total_quantity)}</span>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {!summaryLoading && productsSummary.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No hay productos en pedidos para esta fecha.
                    </div>
                  )}
                </div>
              )}

              {/* Lista de Clientes */}
              <div className="px-6 py-4 space-y-6">
                {day.clients.map((client, clientIndex) => (
                  <div key={`${client.client_email}-${clientIndex}`} className="border border-orange-200 rounded-lg overflow-hidden">
                    {/* Header del Cliente - Naranja */}
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3 text-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <User className="h-5 w-5" />
                          <div>
                            <span className="font-bold">👤 {client.client_name}</span>
                            <span className="text-sm opacity-90 ml-2">({client.client_email})</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm opacity-90">{client.order_count} pedido(s)</p>
                          <p className="font-bold">{formatPrice(client.total_amount)}</p>
                        </div>
                      </div>
                      
                      {/* Información de contacto */}
                      {(client.delivery_address || client.phone) && (
                        <div className="mt-2 flex flex-wrap items-center gap-4 text-sm opacity-90">
                          {client.delivery_address && (
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-4 w-4" />
                              <span>{client.delivery_address}</span>
                            </div>
                          )}
                          
                          {client.phone && (
                            <div className="flex items-center space-x-1">
                              <Phone className="h-4 w-4" />
                              <span>{client.phone}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Lista de Pedidos del Cliente */}
                    <div className="p-4 space-y-3 bg-gray-50">
                      {client.orders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                          <div className="flex items-center space-x-4">
                            <div>
                              <p className="font-semibold text-gray-900">
                                Pedido #{order.id.slice(-8).toUpperCase()} - {order.items_count} producto(s)
                              </p>
                              <p className="text-sm text-gray-500">
                                {formatDate(order.created_at)} • {formatPrice(order.total_amount)}
                              </p>
                              {order.notes && (
                                <div className="flex items-center space-x-1 mt-1">
                                  <FileText className="h-3 w-3 text-gray-400" />
                                  <p className="text-xs text-gray-500 italic">{order.notes}</p>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            {getStatusBadge(order.status)}
                            
                            {/* Botones de estado */}
                            {order.status !== 'delivered' && order.status !== 'cancelled' && (
                              <Button 
                                size="sm" 
                                onClick={() => handleStatusChange(order.id, 'delivered')}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                ✓ Entregar
                              </Button>
                            )}
                            
                            {order.status === 'pending' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleStatusChange(order.id, 'confirmed')}
                                className="border-blue-300 text-blue-600 hover:bg-blue-50"
                              >
                                Confirmar
                              </Button>
                            )}
                            
                            <Link href={`/admin/orders/${order.id}`}>
                              <Button size="sm" variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-50">
                                <Eye className="h-4 w-4 mr-1" />
                                Ver
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {filteredOrders.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No hay pedidos para mostrar
            </h3>
            <p className="text-gray-600">
              {searchTerm ? 'No se encontraron resultados para tu búsqueda.' : 'No hay pedidos en el rango de fechas seleccionado.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}