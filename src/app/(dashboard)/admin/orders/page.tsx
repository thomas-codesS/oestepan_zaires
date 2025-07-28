'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
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
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react'

interface Order {
  id: string
  user_email: string
  user_full_name: string
  user_company_name: string
  status: string
  total_amount: number
  delivery_date: string | null
  delivery_address: string | null
  phone: string | null
  notes: string | null
  created_at: string
  items_count: number
}

export default function AdminOrdersPage() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

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

  // Cargar pedidos
  const loadOrders = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: ordersData, error: ordersError } = await fetch('/api/orders').then(res => res.json())
      
      if (ordersError) {
        throw new Error(ordersError)
      }

      // Usar función helper para obtener pedidos con información del usuario
      const response = await fetch('/api/admin/dashboard/recent-orders?limit=100')
      
      if (!response.ok) {
        throw new Error('Error al cargar pedidos')
      }
      
      const data = await response.json()
      setOrders(data || [])
    } catch (err) {
      console.error('Error loading orders:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar pedidos')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user && profile?.role === 'admin') {
      loadOrders()
    }
  }, [user, profile])

  // Filtrar pedidos
  const filteredOrders = (orders || []).filter(order => {
    const matchesSearch = !searchTerm || 
      order.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user_full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user_company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.delivery_address && order.delivery_address.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = !statusFilter || order.status === statusFilter
    
    const orderDate = new Date(order.created_at).toISOString().split('T')[0]
    const matchesStartDate = !startDate || orderDate >= startDate
    const matchesEndDate = !endDate || orderDate <= endDate
    
    return matchesSearch && matchesStatus && matchesStartDate && matchesEndDate
  })

  // Obtener status badge
  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { label: string; bgColor: string; textColor: string; icon: React.ReactNode } } = {
      pending: { label: 'Pendiente', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800', icon: <Clock className="w-4 h-4" /> },
      confirmed: { label: 'Confirmado', bgColor: 'bg-blue-100', textColor: 'text-blue-800', icon: <CheckCircle className="w-4 h-4" /> },
      preparing: { label: 'Preparando', bgColor: 'bg-orange-100', textColor: 'text-orange-800', icon: <Package className="w-4 h-4" /> },
      ready: { label: 'Listo', bgColor: 'bg-green-100', textColor: 'text-green-800', icon: <CheckCircle className="w-4 h-4" /> },
      delivered: { label: 'Entregado', bgColor: 'bg-green-100', textColor: 'text-green-800', icon: <CheckCircle className="w-4 h-4" /> },
      cancelled: { label: 'Cancelado', bgColor: 'bg-red-100', textColor: 'text-red-800', icon: <XCircle className="w-4 h-4" /> }
    }
    
    const config = statusConfig[status] || statusConfig.pending
    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${config.bgColor} ${config.textColor}`}>
        {config.icon}
        <span className="ml-1">{config.label}</span>
      </span>
    )
  }

  // Cambiar estado de pedido
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

      // Recargar pedidos
      await loadOrders()
      
      const statusText = newStatus === 'delivered' ? 'entregado' : newStatus === 'confirmed' ? 'confirmado' : newStatus
      alert(`Pedido marcado como ${statusText} exitosamente`)
    } catch (err) {
      console.error('Error updating order status:', err)
      alert(err instanceof Error ? err.message : 'Error al actualizar estado del pedido')
    }
  }

  const statusOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'pending', label: 'Pendiente' },
    { value: 'confirmed', label: 'Confirmado' },
    { value: 'preparing', label: 'Preparando' },
    { value: 'ready', label: 'Listo' },
    { value: 'delivered', label: 'Entregado' },
    { value: 'cancelled', label: 'Cancelado' }
  ]

  // Mostrar loading mientras se autentica
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando pedidos...</p>
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
                  Gestión de Pedidos
                </h1>
                <p className="text-gray-600 mt-1">
                  Administra todos los pedidos del sistema
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link href="/admin/orders-by-day">
                <Button variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-50">
                  <Calendar className="h-4 w-4 mr-2" />
                  Vista por Día
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-orange-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <Filter className="h-5 w-5 text-orange-500 mr-2" />
            Filtros de Búsqueda
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar Cliente o Dirección
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Email, nombre, empresa o dirección..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-orange-200 focus:border-orange-400 focus:ring-orange-200"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <Select
                options={statusOptions}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border-orange-200 focus:border-orange-400 focus:ring-orange-200"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Desde
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border-orange-200 focus:border-orange-400 focus:ring-orange-200"
              />
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Lista de Pedidos */}
        <div className="bg-white rounded-xl shadow-lg border border-orange-100 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Pedidos ({filteredOrders.length})
            </h3>
          </div>
          
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay pedidos</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter ? 'No se encontraron pedidos que coincidan con los filtros.' : 'Aún no hay pedidos registrados.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.user_full_name || 'Sin nombre'}
                          </div>
                          <div className="text-sm text-gray-500">{order.user_email}</div>
                          {order.user_company_name && (
                            <div className="text-xs text-gray-400">{order.user_company_name}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                        {formatPrice(order.total_amount)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-6 py-4 text-sm space-x-2">
                        {/* Botones de cambio de estado */}
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
                            Ver Detalle
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 