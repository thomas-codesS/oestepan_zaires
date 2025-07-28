'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/auth-context'
import { Button } from '@/components/ui/button'
import { formatPrice, formatDate } from '@/lib/utils/format'
import { 
  OrderWithItems, 
  getOrderStatusConfig,
  getNextValidStatuses,
  UpdateOrderRequest
} from '@/lib/types/order'
import { 
  ArrowLeft,
  Calendar,
  MapPin,
  Phone,
  FileText,
  Package,
  User,
  Edit,
  Save,
  X,
  RefreshCw
} from 'lucide-react'

interface OrderDetailPageProps {
  params: { id: string }
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const [order, setOrder] = useState<OrderWithItems | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)
  const [editing, setEditing] = useState(false)
  
  // Estado para edición
  const [editData, setEditData] = useState<UpdateOrderRequest>({})

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // Cargar datos del pedido
  useEffect(() => {
    if (user && params.id) {
      loadOrder()
    }
  }, [user, params.id])

  const loadOrder = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/orders/${params.id}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Pedido no encontrado')
        }
        if (response.status === 403) {
          throw new Error('No tienes permisos para ver este pedido')
        }
        throw new Error('Error al cargar el pedido')
      }

      const orderData = await response.json()
      setOrder(orderData)
      
      // Inicializar datos de edición
      setEditData({
        delivery_date: orderData.delivery_date || '',
        delivery_address: orderData.delivery_address || '',
        phone: orderData.phone || '',
        notes: orderData.notes || ''
      })
    } catch (err) {
      console.error('Error loading order:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar el pedido')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (newStatus: string) => {
    if (!order) return
    
    try {
      setUpdating(true)

      const response = await fetch(`/api/orders/${order.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al actualizar pedido')
      }

      const updatedOrder = await response.json()
      setOrder(updatedOrder)
    } catch (err) {
      console.error('Error updating order status:', err)
      alert(err instanceof Error ? err.message : 'Error al actualizar el pedido')
    } finally {
      setUpdating(false)
    }
  }

  const updateOrderDetails = async () => {
    if (!order) return
    
    try {
      setUpdating(true)

      const response = await fetch(`/api/orders/${order.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al actualizar pedido')
      }

      const updatedOrder = await response.json()
      setOrder(updatedOrder)
      setEditing(false)
    } catch (err) {
      console.error('Error updating order:', err)
      alert(err instanceof Error ? err.message : 'Error al actualizar el pedido')
    } finally {
      setUpdating(false)
    }
  }

  const cancelEdit = () => {
    if (order) {
      setEditData({
        delivery_date: order.delivery_date || '',
        delivery_address: order.delivery_address || '',
        phone: order.phone || '',
        notes: order.notes || ''
      })
    }
    setEditing(false)
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando pedido...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="text-center">
          <div className="bg-white rounded-xl shadow-lg p-8 border border-red-200">
            <div className="text-6xl mb-4">😞</div>
            <h2 className="text-2xl font-bold text-red-700 mb-4">
              Error al cargar pedido
            </h2>
            <p className="text-red-600 mb-6">{error}</p>
            <div className="space-x-4">
              <Button onClick={loadOrder} className="bg-orange-600 hover:bg-orange-700 text-white">
                Intentar Nuevamente
              </Button>
              <Link href={profile?.role === 'admin' ? '/admin/orders' : '/orders'}>
                <Button variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-50">
                  Volver a Pedidos
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="text-center">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Pedido no encontrado
            </h2>
            <Link href={profile?.role === 'admin' ? '/admin/orders' : '/orders'}>
              <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                Volver a Pedidos
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const statusConfig = getOrderStatusConfig(order.status)
  const nextStatuses = getNextValidStatuses(order.status)
  const isAdmin = profile?.role === 'admin'
  const canEdit = isAdmin || (order.status === 'pending' && order.user_id === user?.id)

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-orange-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href={isAdmin ? '/admin/orders' : '/orders'}>
                <Button variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-50">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
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
              <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor} border`}>
                {statusConfig.label}
              </span>
              
              {canEdit && !editing && (
                <Button 
                  onClick={() => setEditing(true)}
                  variant="outline" 
                  className="border-orange-300 text-orange-600 hover:bg-orange-50"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Información Principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Datos del Pedido */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <Package className="h-5 w-5 text-orange-500 mr-2" />
                  Información del Pedido
                </h2>
                
                {editing && (
                  <div className="flex space-x-2">
                    <Button 
                      onClick={updateOrderDetails}
                      disabled={updating}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {updating ? (
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Guardar
                    </Button>
                    <Button 
                      onClick={cancelEdit}
                      variant="outline"
                      className="border-gray-300 text-gray-600 hover:bg-gray-50"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Fecha del pedido */}
                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-1" />
                  <div>
                    <label className="text-sm font-medium text-gray-500">Fecha del pedido</label>
                    <p className="text-gray-900">{formatDate(order.created_at)}</p>
                  </div>
                </div>

                {/* Fecha de entrega */}
                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-500">Fecha de entrega</label>
                    {editing ? (
                      <input
                        type="date"
                        value={editData.delivery_date || ''}
                        onChange={(e) => setEditData(prev => ({ ...prev, delivery_date: e.target.value }))}
                        className="w-full mt-1 p-2 border border-orange-200 rounded-lg focus:border-orange-400 focus:ring-orange-200"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {order.delivery_date ? formatDate(order.delivery_date) : 'No especificada'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Dirección */}
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-500">Dirección de entrega</label>
                    {editing ? (
                      <input
                        type="text"
                        value={editData.delivery_address || ''}
                        onChange={(e) => setEditData(prev => ({ ...prev, delivery_address: e.target.value }))}
                        placeholder="Dirección completa"
                        className="w-full mt-1 p-2 border border-orange-200 rounded-lg focus:border-orange-400 focus:ring-orange-200"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {order.delivery_address || 'No especificada'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Teléfono */}
                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-500">Teléfono de contacto</label>
                    {editing ? (
                      <input
                        type="tel"
                        value={editData.phone || ''}
                        onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+54 11 1234-5678"
                        className="w-full mt-1 p-2 border border-orange-200 rounded-lg focus:border-orange-400 focus:ring-orange-200"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {order.phone || 'No especificado'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Notas */}
                <div className="md:col-span-2 flex items-start space-x-3">
                  <FileText className="h-5 w-5 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-500">Notas especiales</label>
                    {editing ? (
                      <textarea
                        value={editData.notes || ''}
                        onChange={(e) => setEditData(prev => ({ ...prev, notes: e.target.value }))}
                        rows={3}
                        placeholder="Instrucciones especiales, alergias, etc."
                        className="w-full mt-1 p-2 border border-orange-200 rounded-lg focus:border-orange-400 focus:ring-orange-200 resize-none"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {order.notes || 'Sin notas especiales'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Cliente (solo para admin) */}
                {isAdmin && order.user && (
                  <div className="md:col-span-2 flex items-start space-x-3">
                    <User className="h-5 w-5 text-gray-400 mt-1" />
                    <div>
                      <label className="text-sm font-medium text-gray-500">Cliente</label>
                      <p className="text-gray-900">{order.user.email}</p>
                      {order.user.profile?.full_name && (
                        <p className="text-sm text-gray-600">{order.user.profile.full_name}</p>
                      )}
                      {order.user.profile?.company_name && (
                        <p className="text-sm text-gray-600">{order.user.profile.company_name}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Productos */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Package className="h-5 w-5 text-orange-500 mr-2" />
                Productos ({order.items.length})
              </h2>

              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.product_name}</h3>
                      <p className="text-sm text-gray-500">Código: {item.product_code}</p>
                      <div className="flex items-center mt-2 space-x-4 text-sm text-gray-600">
                        <span>Precio unitario: {formatPrice(item.unit_price_with_iva)}</span>
                        <span>Cantidad: {item.quantity}</span>
                        <span>IVA: {item.iva_rate}%</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        {formatPrice(item.line_total)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar de Acciones */}
          <div className="space-y-6">
            {/* Resumen */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Resumen del Pedido</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Estado actual:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}>
                    {statusConfig.label}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total:</span>
                  <span className="text-xl font-bold text-orange-600">
                    {formatPrice(order.total_amount)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Productos:</span>
                  <span className="font-medium">{order.items.length}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Actualizado:</span>
                  <span className="text-sm">{formatDate(order.updated_at)}</span>
                </div>
              </div>
            </div>

            {/* Acciones de Estado */}
            {isAdmin && nextStatuses.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Cambiar Estado</h3>
                
                <div className="space-y-2">
                  {nextStatuses.map((status) => {
                    const config = getOrderStatusConfig(status)
                    return (
                      <Button
                        key={status}
                        onClick={() => updateOrderStatus(status)}
                        disabled={updating}
                        className={`w-full justify-start ${config.bgColor} ${config.textColor} hover:opacity-80 border ${config.borderColor}`}
                      >
                        {updating ? (
                          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        → {config.label}
                      </Button>
                    )
                  })}
                </div>
                
                <p className="text-xs text-gray-500 mt-3">
                  {statusConfig.description}
                </p>
              </div>
            )}

            {/* Información Adicional */}
            <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
              <h3 className="font-semibold text-orange-800 mb-3">💡 Información</h3>
              <ul className="text-sm text-orange-700 space-y-2">
                <li>• Los precios incluyen IVA</li>
                <li>• Productos preparados frescos</li>
                <li>• Horario de entrega: 8:00-18:00</li>
                {order.status === 'pending' && (
                  <li>• Puedes editar este pedido hasta que sea confirmado</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 