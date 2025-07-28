'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/auth-context'
import { Button } from '@/components/ui/button'
import { formatPrice, formatDate } from '@/lib/utils/format'
import { 
  Calendar,
  MapPin,
  Phone,
  User,
  Package,
  FileText,
  ArrowLeft,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Mail,
  Building,
  ShoppingCart
} from 'lucide-react'

interface OrderItem {
  id: string
  product_code: string
  product_name: string
  quantity: number
  unit_price: number
  unit_price_with_iva: number
  iva_rate: number
  line_total: number
}

interface OrderDetail {
  id: string
  status: string
  total_amount: number
  delivery_date: string | null
  delivery_address: string | null
  phone: string | null
  notes: string | null
  created_at: string
  updated_at: string
  user?: {
    id: string
    email: string
    profile?: {
      full_name?: string
      company_name?: string
    }
  }
  items: OrderItem[]
}

interface OrderDetailPageProps {
  params: Promise<{ id: string }>
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)

  // Obtener el ID del pedido de los parámetros
  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setOrderId(resolvedParams.id)
    }
    getParams()
  }, [params])

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

  // Cargar detalles del pedido
  const loadOrder = async () => {
    if (!orderId) return
    
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/orders/${orderId}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Pedido no encontrado')
        }
        throw new Error('Error al cargar el pedido')
      }
      
      const orderData = await response.json()
      setOrder(orderData)
    } catch (err) {
      console.error('Error loading order:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar el pedido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (orderId && user && profile?.role === 'admin') {
      loadOrder()
    }
  }, [orderId, user, profile])

  // Cambiar estado del pedido
  const handleStatusChange = async (newStatus: string) => {
    if (!order) return
    
    try {
      setUpdating(true)
      
      const response = await fetch(`/api/orders/${order.id}`, {
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

      // Recargar el pedido
      await loadOrder()
      
      const statusText = newStatus === 'delivered' ? 'entregado' : newStatus === 'confirmed' ? 'confirmado' : newStatus
      alert(`Pedido marcado como ${statusText} exitosamente`)
    } catch (err) {
      console.error('Error updating order status:', err)
      alert(err instanceof Error ? err.message : 'Error al actualizar estado del pedido')
    } finally {
      setUpdating(false)
    }
  }

  // Obtener configuración del estado
  const getStatusConfig = (status: string) => {
    const statusConfig: { [key: string]: { label: string; bgColor: string; textColor: string; icon: React.ReactNode } } = {
      pending: { label: 'Pendiente', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800', icon: <Clock className="w-5 h-5" /> },
      confirmed: { label: 'Confirmado', bgColor: 'bg-blue-100', textColor: 'text-blue-800', icon: <CheckCircle className="w-5 h-5" /> },
      preparing: { label: 'Preparando', bgColor: 'bg-orange-100', textColor: 'text-orange-800', icon: <Package className="w-5 h-5" /> },
      ready: { label: 'Listo', bgColor: 'bg-green-100', textColor: 'text-green-800', icon: <CheckCircle className="w-5 h-5" /> },
      delivered: { label: 'Entregado', bgColor: 'bg-green-100', textColor: 'text-green-800', icon: <CheckCircle className="w-5 h-5" /> },
      cancelled: { label: 'Cancelado', bgColor: 'bg-red-100', textColor: 'text-red-800', icon: <XCircle className="w-5 h-5" /> }
    }
    return statusConfig[status] || statusConfig.pending
  }

  // Mostrar loading mientras se autentica
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando pedido...</p>
        </div>
      </div>
    )
  }

  if (!user || profile?.role !== 'admin') {
    return null
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <XCircle className="w-6 h-6 text-red-500 mr-2" />
              <h2 className="text-lg font-semibold text-red-700">Error</h2>
            </div>
            <p className="text-red-600 mb-4">{error}</p>
            <div className="space-x-2">
              <Link href="/admin/orders">
                <Button variant="outline">
                  ← Volver a Pedidos
                </Button>
              </Link>
              <Button onClick={loadOrder}>
                Intentar de nuevo
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">Pedido no encontrado</h2>
            <Link href="/admin/orders">
              <Button className="mt-4">← Volver a Pedidos</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const statusConfig = getStatusConfig(order.status)

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin/orders">
                <Button variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-50">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver a Pedidos
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  Pedido #{order.id.slice(-8).toUpperCase()}
                </h1>
                <p className="text-gray-600 mt-1">
                  Detalles completos del pedido
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}>
                {statusConfig.icon}
                <span className="ml-2">{statusConfig.label}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Información del Cliente */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 text-orange-500 mr-2" />
                Información del Cliente
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{order.user?.email}</p>
                    <p className="text-xs text-gray-500">Email</p>
                  </div>
                </div>
                
                {order.user?.profile?.full_name && (
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{order.user.profile.full_name}</p>
                      <p className="text-xs text-gray-500">Nombre completo</p>
                    </div>
                  </div>
                )}
                
                {order.user?.profile?.company_name && (
                  <div className="flex items-center">
                    <Building className="h-4 w-4 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{order.user.profile.company_name}</p>
                      <p className="text-xs text-gray-500">Empresa</p>
                    </div>
                  </div>
                )}
                
                {order.phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{order.phone}</p>
                      <p className="text-xs text-gray-500">Teléfono</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Información de Entrega */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <MapPin className="h-5 w-5 text-orange-500 mr-2" />
                Información de Entrega
              </h2>
              
              <div className="space-y-4">
                {order.delivery_date && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{formatDate(order.delivery_date)}</p>
                      <p className="text-xs text-gray-500">Fecha de entrega</p>
                    </div>
                  </div>
                )}
                
                {order.delivery_address ? (
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 text-gray-400 mr-3 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{order.delivery_address}</p>
                      <p className="text-xs text-gray-500">Dirección de entrega</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">No especificada</p>
                      <p className="text-xs text-gray-400">Dirección de entrega</p>
                    </div>
                  </div>
                )}
                
                {order.notes && (
                  <div className="flex items-start">
                    <FileText className="h-4 w-4 text-gray-400 mr-3 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{order.notes}</p>
                      <p className="text-xs text-gray-500">Notas del pedido</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Acciones */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Acciones</h2>
              
              <div className="space-y-3">
                {order.status !== 'delivered' && order.status !== 'cancelled' && (
                  <Button 
                    onClick={() => handleStatusChange('delivered')}
                    disabled={updating}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    ✓ Marcar como Entregado
                  </Button>
                )}
                
                {order.status === 'pending' && (
                  <Button 
                    onClick={() => handleStatusChange('confirmed')}
                    disabled={updating}
                    variant="outline"
                    className="w-full border-blue-300 text-blue-600 hover:bg-blue-50"
                  >
                    Confirmar Pedido
                  </Button>
                )}
                
                {order.status === 'confirmed' && (
                  <Button 
                    onClick={() => handleStatusChange('preparing')}
                    disabled={updating}
                    variant="outline"
                    className="w-full border-orange-300 text-orange-600 hover:bg-orange-50"
                  >
                    Marcar en Preparación
                  </Button>
                )}
                
                {order.status === 'preparing' && (
                  <Button 
                    onClick={() => handleStatusChange('ready')}
                    disabled={updating}
                    variant="outline"
                    className="w-full border-green-300 text-green-600 hover:bg-green-50"
                  >
                    Marcar como Listo
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Productos del Pedido */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg border border-orange-100 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 flex items-center">
                  <ShoppingCart className="h-5 w-5 text-orange-500 mr-2" />
                  Productos del Pedido ({order.items.length})
                </h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Producto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cantidad
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Precio Unitario
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {order.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{item.product_name}</div>
                            <div className="text-sm text-gray-500">Código: {item.product_code}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{formatPrice(item.unit_price_with_iva)}</div>
                          <div className="text-xs text-gray-500">
                            Base: {formatPrice(item.unit_price)} + {item.iva_rate}% IVA
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                          {formatPrice(item.line_total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                        Total del Pedido:
                      </td>
                      <td className="px-6 py-4 text-lg font-bold text-orange-600">
                        {formatPrice(order.total_amount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Información del Pedido */}
            <div className="mt-6 bg-white rounded-xl shadow-lg p-6 border border-orange-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Información del Pedido</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <p className="text-gray-500">Fecha de creación</p>
                  <p className="font-medium text-gray-900">{formatDate(order.created_at)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Última actualización</p>
                  <p className="font-medium text-gray-900">{formatDate(order.updated_at)}</p>
                </div>
                <div>
                  <p className="text-gray-500">ID del pedido</p>
                  <p className="font-medium text-gray-900 font-mono">{order.id}</p>
                </div>
                <div>
                  <p className="text-gray-500">Estado actual</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}>
                    {statusConfig.icon}
                    <span className="ml-1">{statusConfig.label}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 