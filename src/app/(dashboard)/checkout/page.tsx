'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/auth-context'
import { useCartStore } from '@/lib/store/cart-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatPrice, formatCartPriceBreakdown } from '@/lib/utils/format'
import { CreateOrderRequest, OrderError } from '@/lib/types/order'
import {
  getDeliveryWindow,
  formatDeliveryDateForApi,
  formatDateDisplay,
  formatDateTimeDisplay,
} from '@/lib/utils/delivery-schedule'
import { ORDER_RULES } from '@/lib/constants/business'

export default function CheckoutPage() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const { items, total, clearCart, updateQuantity, removeItem } = useCartStore()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    delivery_address: '',
    phone: '',
    notes: '',
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirectTo=/checkout')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (items.length === 0) {
      router.push('/catalog')
    }
  }, [items, router])

  // Calcular la ventana de pedido activa para este usuario
  const deliveryWindow = useMemo(() => {
    const deliveryDays = profile?.delivery_days ?? []
    return getDeliveryWindow(deliveryDays)
  }, [profile?.delivery_days])

  // String YYYY-MM-DD para enviar a la API
  const deliveryDateForApi = useMemo(() => {
    if (!deliveryWindow.isOpen || !deliveryWindow.deliveryDate) return ''
    return formatDeliveryDateForApi(deliveryWindow.deliveryDate)
  }, [deliveryWindow])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!user) {
        throw new Error('No se pudo obtener el usuario. Por favor, inicia sesión nuevamente.')
      }

      if (!deliveryWindow.isOpen || !deliveryDateForApi) {
        throw new Error('El horario de pedidos está cerrado. No se pueden enviar pedidos en este momento.')
      }

      const orderData: CreateOrderRequest = {
        delivery_date: deliveryDateForApi,
        delivery_address: formData.delivery_address || undefined,
        phone: formData.phone || undefined,
        notes: formData.notes || undefined,
        items: items.map(item => ({
          product_id: item.product.id,
          product_code: item.product.code,
          product_name: item.product.name,
          quantity: item.quantity,
          unit_price: item.product.price,
          unit_price_with_iva: item.product.price_with_iva,
          iva_rate: item.product.iva_rate,
        })),
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(orderData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al crear el pedido')
      }

      const order = await response.json()
      clearCart()
      router.push(`/orders/confirmation/${order.id}`)
    } catch (err) {
      console.error('Error creating order:', err)
      setError(err instanceof Error ? err.message : 'Error al procesar el pedido')
    } finally {
      setLoading(false)
    }
  }

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

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Tu carrito está vacío</h2>
          <p className="text-gray-600 mb-6">Agrega algunos productos antes de hacer un pedido</p>
          <Link href="/catalog">
            <Button className="bg-orange-600 hover:bg-orange-700 text-white">Ver Catálogo</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Sin días de entrega configurados
  if (!profile?.delivery_days || profile.delivery_days.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="max-w-md mx-auto text-center p-8 bg-white rounded-xl shadow-lg border border-orange-100">
          <div className="text-5xl mb-4">📋</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Sin días de entrega</h2>
          <p className="text-gray-600 mb-6">
            Tu cuenta no tiene días de entrega configurados. Contactá al administrador para habilitarlos.
          </p>
          <Link href="/catalog">
            <Button variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-50">
              Volver al Catálogo
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // Ventana de pedido cerrada
  if (!deliveryWindow.isOpen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="max-w-md mx-auto text-center p-8 bg-white rounded-xl shadow-lg border border-red-100">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Pedidos cerrados</h2>
          <p className="text-gray-600 mb-4">
            El horario de pedidos ya cerró. Los pedidos se reciben hasta las{' '}
            <strong>{ORDER_RULES.CUTOFF_HOUR}:00 hs</strong> del día habilitado.
          </p>
          {deliveryWindow.nextWindowOpens && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6 text-sm text-orange-800">
              <p className="font-semibold mb-1">Próxima apertura:</p>
              <p className="capitalize">{formatDateTimeDisplay(deliveryWindow.nextWindowOpens)} hs</p>
            </div>
          )}
          <p className="text-xs text-gray-500 mb-6">
            Para agregar productos a un pedido existente, comunicáte directamente con nosotros.
          </p>
          <Link href="/catalog">
            <Button variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-50">
              Volver al Catálogo
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="bg-white shadow-lg border-b border-orange-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                Confirmar Pedido
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                Revisa tu pedido y completa los datos de entrega
              </p>
            </div>
            <Link href="/catalog">
              <Button variant="outline" className="w-full sm:w-auto border-orange-300 text-orange-600 hover:bg-orange-50">
                <span className="hidden sm:inline">← Seguir Comprando</span>
                <span className="sm:hidden">← Volver al Catálogo</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulario */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="text-orange-500 mr-2">📝</span>
              Datos de Entrega
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}

              {/* Fecha de entrega: solo lectura, calculada automáticamente */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Fecha de Entrega
                </label>
                <div className="w-full px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg text-gray-800 font-medium capitalize">
                  {deliveryWindow.deliveryDate
                    ? formatDateDisplay(deliveryWindow.deliveryDate)
                    : '—'}
                </div>
                {deliveryWindow.orderDate && (
                  <p className="text-xs text-gray-500 mt-1">
                    Pedidos hasta el{' '}
                    <strong className="text-orange-700">
                      {formatDateDisplay(deliveryWindow.orderDate)} a las {ORDER_RULES.CUTOFF_HOUR}:00 hs
                    </strong>
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="delivery_address" className="block text-sm font-semibold text-gray-700 mb-2">
                  Dirección de Entrega
                </label>
                <Input
                  type="text"
                  id="delivery_address"
                  name="delivery_address"
                  value={formData.delivery_address}
                  onChange={handleInputChange}
                  placeholder="Calle, número, piso, departamento"
                  className="border-orange-200 focus:border-orange-400 focus:ring-orange-200"
                />
                <p className="text-xs text-gray-500 mt-1">Especificar bien la dirección de entrega</p>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                  Teléfono de Contacto
                </label>
                <Input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+54 11 1234-5678"
                  className="border-orange-200 focus:border-orange-400 focus:ring-orange-200"
                />
                <p className="text-xs text-gray-500 mt-1">Para coordinar la entrega</p>
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 mb-2">
                  Notas Especiales
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Instrucciones especiales, alergias, preferencias..."
                  className="w-full p-3 border border-orange-200 rounded-lg focus:ring-orange-200 focus:border-orange-400 resize-none"
                />
              </div>

              {/* Aviso de no agregados */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                <p className="font-semibold mb-1">Importante</p>
                <p>
                  Una vez enviado el pedido, <strong>no se pueden hacer agregados por la página</strong>.
                  Para sumar productos a un pedido ya enviado, comunicáte directamente con nosotros.
                </p>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 text-lg font-semibold disabled:bg-gray-400"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Procesando...
                    </div>
                  ) : (
                    `Confirmar Pedido — ${formatCartPriceBreakdown(items).total}`
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Resumen del pedido */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="text-orange-500 mr-2">🛒</span>
              Resumen del Pedido
            </h2>

            <div className="space-y-4">
              {items.map(item => (
                <div key={item.product.id} className="pb-4 border-b border-gray-100">
                  <div className="flex flex-col space-y-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{item.product.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mt-1">{item.product.description}</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                        <p className="text-sm font-medium text-orange-600">{formatPrice(item.product.price)} c/u</p>
                        <p className="text-xs text-gray-500">IVA {item.product.iva_rate}%</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm text-gray-500 font-medium">
                        Subtotal: {formatPrice(item.product.price * item.quantity)}
                      </span>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors text-lg font-bold"
                          disabled={item.quantity <= 1}
                        >
                          −
                        </button>
                        <span className="min-w-[2.5rem] text-center font-bold text-base sm:text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-orange-100 hover:bg-orange-200 flex items-center justify-center text-orange-600 transition-colors text-lg font-bold"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center text-red-600 transition-colors ml-2 text-xl font-bold"
                          title="Eliminar producto"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4 mt-6">
              {(() => {
                const breakdown = formatCartPriceBreakdown(items)
                return (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Total productos:</span>
                      <span className="text-gray-900">{breakdown.subtotal}</span>
                    </div>
                    {breakdown.ivaBreakdown.map(ivaItem => (
                      <div key={ivaItem.rate} className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">IVA ({ivaItem.rate}%):</span>
                        <span className="text-gray-900">{formatPrice(ivaItem.amount)}</span>
                      </div>
                    ))}
                    <hr className="border-gray-200" />
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">Total:</span>
                      <span className="text-2xl font-bold text-orange-600">{breakdown.total}</span>
                    </div>
                  </div>
                )
              })()}
              <p className="text-xs text-gray-500 mt-1 text-right">Total final con IVA incluido</p>
            </div>

            <div className="mt-6 p-3 sm:p-4 bg-orange-50 rounded-lg border border-orange-200">
              <h3 className="font-semibold text-orange-800 mb-2 text-sm sm:text-base">Información Importante</h3>
              <ul className="text-xs sm:text-sm text-orange-700 space-y-1">
                <li>• Los pedidos se preparan frescos diariamente</li>
                <li>• Horarios de entrega: 8:00 - 18:00</li>
                <li>
                  • Pedidos hasta las <strong>{ORDER_RULES.CUTOFF_HOUR}:00 hs</strong> del día habilitado
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
