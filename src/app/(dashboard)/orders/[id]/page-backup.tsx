'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/auth-context'
import { Button } from '@/components/ui/button'
import { formatPrice, formatDate, formatPriceBreakdown } from '@/lib/utils/format'
import { 
  OrderWithItems, 
  getOrderStatusConfig
} from '@/lib/types/order'
import { 
  ArrowLeft,
  Calendar,
  MapPin,
  Phone,
  FileText,
  Package,
  User
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
    } catch (err) {
      console.error('Error loading order:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar el pedido')
    } finally {
      setLoading(false)
    }
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
          <div className="bg-white border border-red-200 rounded-xl shadow-lg p-8 max-w-md">
            <div className="text-6xl mb-4">😔</div>
            <h2 className="text-2xl font-bold text-red-700 mb-4">Error al cargar</h2>
            <p className="text-red-600 mb-6">{error}</p>
            <div className="flex flex-col gap-4">
              <Button onClick={loadOrder} className="bg-orange-600 hover:bg-orange-700 text-white">
                Intentar Nuevamente
              </Button>
              <Link href="/orders">
                <Button variant="outline" className="w-full border-orange-300 text-orange-600 hover:bg-orange-50">
                  ← Volver a Mis Pedidos
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
          <div className="bg-white border border-red-200 rounded-xl shadow-lg p-8 max-w-md">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-gray-700 mb-4">Pedido no encontrado</h2>
            <p className="text-gray-600 mb-6">No se pudo encontrar el pedido solicitado.</p>
            <Link href="/orders">
              <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                ← Volver a Mis Pedidos
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const statusConfig = getOrderStatusConfig(order.status)
  const isAdmin = profile?.role === 'admin'

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-orange-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/orders">
                <Button variant="ghost" size="sm" className="mr-4 text-orange-600 hover:bg-orange-50">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Volver
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  Pedido #{order.id.slice(-8).toUpperCase()}
                </h1>
                <div className="flex items-center mt-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig.colorClass}`}>
                    {statusConfig.label}
                  </span>
                  <span className="ml-4 text-gray-500 text-sm">
                    {formatDate(order.created_at)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Información del pedido */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Información general */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-orange-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <FileText className="text-orange-500 mr-2" size={20} />
                Información del Pedido
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Calendar className="text-gray-400 mr-3" size={16} />
                    <div>
                      <p className="text-sm text-gray-600">Fecha del pedido</p>
                      <p className="font-semibold">{formatDate(order.created_at)}</p>
                    </div>
                  </div>
                  
                  {order.delivery_date && (
                    <div className="flex items-center">
                      <Calendar className="text-gray-400 mr-3" size={16} />
                      <div>
                        <p className="text-sm text-gray-600">Fecha de entrega solicitada</p>
                        <p className="font-semibold">{formatDate(order.delivery_date)}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {order.delivery_address && (
                    <div className="flex items-start">
                      <MapPin className="text-gray-400 mr-3 mt-1" size={16} />
                      <div>
                        <p className="text-sm text-gray-600">Dirección de entrega</p>
                        <p className="font-semibold">{order.delivery_address}</p>
                      </div>
                    </div>
                  )}
                  
                  {order.phone && (
                    <div className="flex items-center">
                      <Phone className="text-gray-400 mr-3" size={16} />
                      <div>
                        <p className="text-sm text-gray-600">Teléfono</p>
                        <p className="font-semibold">{order.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {order.notes && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Notas adicionales</p>
                  <p className="bg-gray-50 rounded-lg p-4 text-gray-700">{order.notes}</p>
                </div>
              )}
            </div>

            {/* Items del pedido */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-orange-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Package className="text-orange-500 mr-2" size={20} />
                Productos del Pedido
              </h3>
              
              <div className="space-y-4">
                {order.items.map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{item.product_name}</h4>
                      <p className="text-sm text-gray-600">Código: {item.product_code}</p>
                      <p className="text-sm text-gray-500">Cantidad: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totales */}
              <div className="border-t pt-6 mt-6">
                {(() => {
                  const breakdown = formatPriceBreakdown(order.total_amount, 21)
                  return (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="text-gray-900">{breakdown.subtotal}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">IVA (21%):</span>
                        <span className="text-gray-900">{breakdown.iva}</span>
                      </div>
                      <hr className="border-gray-200" />
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total:</span>
                        <span className="text-orange-600">{breakdown.total}</span>
                      </div>
                    </div>
                  )
                })()}
              </div>
            </div>
          </div>

          {/* Información del cliente - Solo visible para admin */}
          {isAdmin && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-8 border border-orange-100 sticky top-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <User className="text-orange-500 mr-2" size={20} />
                  Información del Cliente
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Cliente</p>
                    <p className="font-semibold">{order.profiles?.full_name || 'Sin nombre'}</p>
                  </div>
                  
                  {order.profiles?.email && (
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold text-sm">{order.profiles.email}</p>
                    </div>
                  )}
                  
                  {order.profiles?.company && (
                    <div>
                      <p className="text-sm text-gray-600">Empresa</p>
                      <p className="font-semibold">{order.profiles.company}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
