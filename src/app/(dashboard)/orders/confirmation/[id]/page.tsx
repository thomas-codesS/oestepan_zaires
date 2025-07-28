'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/auth-context'
import { Button } from '@/components/ui/button'
import { formatPrice, formatDate } from '@/lib/utils/format'
import { OrderWithItems } from '@/lib/types/order'

interface OrderConfirmationPageProps {
  params: Promise<{ id: string }>
}

export default function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [order, setOrder] = useState<OrderWithItems | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setOrderId(resolvedParams.id)
    }
    getParams()
  }, [params])

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user && orderId) {
      loadOrder()
    }
  }, [user, orderId])

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
        if (response.status === 403) {
          throw new Error('No tienes permisos para ver este pedido')
        }
        throw new Error('Error al cargar el pedido')
      }

      const orderData = await response.json()
      setOrder(orderData)
    } catch (err) {
      console.error('Error loading order:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'preparing': return 'bg-purple-100 text-purple-800'
      case 'ready': return 'bg-green-100 text-green-800'
      case 'delivered': return 'bg-green-200 text-green-900'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente'
      case 'confirmed': return 'Confirmado'
      case 'preparing': return 'Preparando'
      case 'ready': return 'Listo para entrega'
      case 'delivered': return 'Entregado'
      case 'cancelled': return 'Cancelado'
      default: return status
    }
  }

  // Mostrar loading mientras se autentica
  if (authLoading || !orderId) {
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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando pedido...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-16">
            <div className="bg-white border border-red-200 rounded-xl shadow-lg p-8">
              <div className="text-6xl mb-4">😔</div>
              <h2 className="text-2xl font-bold text-red-700 mb-4">
                {error === 'Pedido no encontrado' ? 'Pedido no encontrado' : 'Error al cargar pedido'}
              </h2>
              <p className="text-red-600 mb-6">{error}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/orders">
                  <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                    ← Ver Mis Pedidos
                  </Button>
                </Link>
                <Button 
                  onClick={loadOrder} 
                  variant="outline"
                  className="border-orange-300 text-orange-600 hover:bg-orange-50"
                >
                  Intentar Nuevamente
                </Button>
              </div>
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                ¡Pedido Confirmado!
              </h1>
              <p className="text-gray-600 mt-2">
                Tu pedido ha sido recibido correctamente
              </p>
            </div>
            <Link href="/orders">
              <Button variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-50">
                Ver Mis Pedidos
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mensaje de confirmación */}
        <div className="bg-green-50 border border-green-200 rounded-xl shadow-lg p-8 mb-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✅</span>
            </div>
            <h2 className="text-2xl font-bold text-green-900 mb-3">
              ¡Gracias por tu pedido!
            </h2>
                         <p className="text-green-800 mb-4">
               Hemos recibido tu pedido <strong>#{order.id.slice(-8).toUpperCase()}</strong> y lo estamos procesando.
             </p>
            <p className="text-green-700">
              Te contactaremos pronto para coordinar la entrega.
            </p>
          </div>
        </div>

        {/* Información del pedido */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-orange-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="text-orange-500 mr-2">📋</span>
            Detalles del Pedido
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Información General</h4>
              <div className="space-y-2 text-sm">
                                 <div className="flex justify-between">
                   <span className="text-gray-600">Número de pedido:</span>
                   <span className="font-semibold">#{order.id.slice(-8).toUpperCase()}</span>
                 </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fecha del pedido:</span>
                  <span>{formatDate(order.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estado:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Entrega</h4>
              <div className="space-y-2 text-sm">
                {order.delivery_date && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fecha solicitada:</span>
                    <span>{formatDate(order.delivery_date)}</span>
                  </div>
                )}
                {order.delivery_address && (
                  <div>
                    <span className="text-gray-600">Dirección:</span>
                    <p className="text-gray-900">{order.delivery_address}</p>
                  </div>
                )}
                {order.phone && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Teléfono:</span>
                    <span>{order.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {order.notes && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Notas adicionales</h4>
              <p className="text-gray-700 text-sm">{order.notes}</p>
            </div>
          )}
        </div>

        {/* Items del pedido */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-orange-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="text-orange-500 mr-2">🛒</span>
            Productos del Pedido
          </h3>
          
                     <div className="space-y-4 mb-6">
             {order.items.map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{item.product_name}</h4>
                  <p className="text-sm text-gray-600">Código: {item.product_code}</p>
                                     <p className="text-sm text-gray-500">
                     {formatPrice(item.unit_price_with_iva)} × {item.quantity}
                   </p>
                 </div>
                 <div className="text-right">
                   <p className="font-bold text-lg">
                     {formatPrice(item.line_total)}
                   </p>
                </div>
              </div>
            ))}
          </div>

          {/* Totales */}
                     <div className="border-t pt-4">
             <div className="space-y-2 text-sm">
               <div className="flex justify-between text-lg font-bold">
                 <span>Total:</span>
                 <span className="text-orange-600">{formatPrice(order.total_amount)}</span>
               </div>
             </div>
           </div>
        </div>

        {/* Acciones */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-orange-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6">¿Qué sigue?</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                <span className="mr-2">📞</span>
                Te contactaremos
              </h4>
              <p className="text-blue-800 text-sm">
                Nuestro equipo se pondrá en contacto contigo para coordinar la entrega y confirmar todos los detalles.
              </p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-6 border border-green-200">
              <h4 className="font-semibold text-green-900 mb-2 flex items-center">
                <span className="mr-2">🥖</span>
                Preparamos tu pedido
              </h4>
              <p className="text-green-800 text-sm">
                Comenzaremos a preparar tus productos frescos según la fecha de entrega acordada.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
            <Link href="/catalog">
              <Button 
                size="lg"
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                Seguir Comprando
              </Button>
            </Link>
            <Link href="/orders">
              <Button 
                size="lg" 
                variant="outline"
                className="border-orange-300 text-orange-600 hover:bg-orange-50"
              >
                Ver Mis Pedidos
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 