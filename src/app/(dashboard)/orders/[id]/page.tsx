'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils/format'
import { OrderWithItems } from '@/lib/types/order'
import { ArrowLeft, Calendar, MapPin, Phone, FileText } from 'lucide-react'

interface OrderDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [order, setOrder] = useState<OrderWithItems | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)

  // Obtener el ID del pedido de los parámetros
  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setOrderId(resolvedParams.id)
    }
    getParams()
  }, [params])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user && orderId) {
      fetchOrder()
    }
  }, [user, orderId])

  const fetchOrder = async () => {
    if (!orderId) return
    
    try {
      setLoading(true)
      const response = await fetch(`/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${user?.access_token}`,
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        },
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Error al cargar el pedido')
      }

      const orderData = await response.json()
      setOrder(orderData)
    } catch (err) {
      console.error('Error fetching order:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar el pedido')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-amber-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-amber-200 rounded w-64 mb-6"></div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="h-4 bg-amber-200 rounded w-full mb-4"></div>
              <div className="h-4 bg-amber-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-amber-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-amber-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Button 
              onClick={() => router.push('/orders')}
              variant="outline"
            >
              Volver a mis pedidos
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-amber-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">Pedido no encontrado</p>
            <Button 
              onClick={() => router.push('/orders')}
              variant="outline"
            >
              Volver a mis pedidos
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'pending': { 
        label: 'Pendiente', 
        className: 'bg-amber-100 text-amber-800 border-amber-200' 
      },
      'confirmed': { 
        label: 'Confirmado', 
        className: 'bg-blue-100 text-blue-800 border-blue-200' 
      },
      'preparing': { 
        label: 'Preparando', 
        className: 'bg-orange-100 text-orange-800 border-orange-200' 
      },
      'ready': { 
        label: 'Listo', 
        className: 'bg-green-100 text-green-800 border-green-200' 
      },
      'delivered': { 
        label: 'Entregado', 
        className: 'bg-emerald-100 text-emerald-800 border-emerald-200' 
      },
      'cancelled': { 
        label: 'Cancelado', 
        className: 'bg-red-100 text-red-800 border-red-200' 
      }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.className}`}>
        {config.label}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-amber-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button 
            onClick={() => router.push('/orders')}
            variant="ghost"
            className="mb-4 text-amber-700 hover:text-amber-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a mis pedidos
          </Button>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-amber-900 mb-2">
                Pedido #{order.id.slice(-8).toUpperCase()}
              </h1>
              <p className="text-gray-600">
                Realizado el {new Date(order.created_at).toLocaleDateString('es-AR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            {getStatusBadge(order.status)}
          </div>
        </div>

        {/* Order Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Delivery Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-amber-900 mb-4">
              Información de Entrega
            </h2>
            
            {order.delivery_date && (
              <div className="flex items-center mb-3">
                <Calendar className="w-5 h-5 text-amber-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Fecha de entrega</p>
                  <p className="font-medium">
                    {new Date(order.delivery_date).toLocaleDateString('es-AR')}
                  </p>
                </div>
              </div>
            )}
            
            {order.delivery_address && (
              <div className="flex items-start mb-3">
                <MapPin className="w-5 h-5 text-amber-600 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Dirección</p>
                  <p className="font-medium">{order.delivery_address}</p>
                </div>
              </div>
            )}
            
            {order.phone && (
              <div className="flex items-center mb-3">
                <Phone className="w-5 h-5 text-amber-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Teléfono</p>
                  <p className="font-medium">{order.phone}</p>
                </div>
              </div>
            )}
            
            {order.notes && (
              <div className="flex items-start">
                <FileText className="w-5 h-5 text-amber-600 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Notas</p>
                  <p className="font-medium">{order.notes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-amber-900 mb-4">
              Resumen del Pedido
            </h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Productos ({order.items?.length || 0})</span>
                <span className="font-medium">{order.items?.length || 0} items</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">
                  {formatPrice(order.items?.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0) || 0)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">IVA</span>
                <span className="font-medium">
                  {formatPrice(order.items?.reduce((sum, item) => sum + (item.quantity * (item.unit_price_with_iva - item.unit_price)), 0) || 0)}
                </span>
              </div>
              
              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-amber-900">Total</span>
                  <span className="text-lg font-bold text-amber-900">
                    {formatPrice(order.total_amount || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-amber-900 mb-4">
            Productos del Pedido
          </h2>
          
          {order.items && order.items.length > 0 ? (
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">
                        {item.product_name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Código: {item.product_code}
                      </p>
                      <div className="text-sm text-gray-600">
                        <span>Cantidad: {item.quantity}</span>
                        <span className="mx-2">•</span>
                        <span>Precio unitario: {formatPrice(item.unit_price)}</span>
                        <span className="mx-2">•</span>
                        <span>IVA: {item.iva_rate}%</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold text-amber-900">
                        {formatPrice(item.quantity * item.unit_price_with_iva)}
                      </p>
                      <p className="text-xs text-gray-500">
                        (inc. IVA)
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">
              No se encontraron productos en este pedido
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
