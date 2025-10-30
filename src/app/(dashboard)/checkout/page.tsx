'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/auth-context'
import { useCartStore } from '@/lib/store/cart-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatPrice, formatPriceBreakdown } from '@/lib/utils/format'
import { CreateOrderRequest, OrderError } from '@/lib/types/order'

export default function CheckoutPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { items, total, clearCart, updateQuantity, removeItem } = useCartStore()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    delivery_date: '',
    delivery_address: '',
    phone: '',
    notes: ''
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!user?.access_token) {
        throw new Error('No se pudo obtener el token de autenticación. Por favor, inicia sesión nuevamente.')
      }

      console.log('Frontend JWT:', user.access_token)

      const orderData: CreateOrderRequest = {
        delivery_date: formData.delivery_date || undefined,
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
          iva_rate: item.product.iva_rate
        }))
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.access_token}`,
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        },
        credentials: 'include',
        body: JSON.stringify(orderData)
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Tu carrito está vacío
          </h2>
          <p className="text-gray-600 mb-6">
            Agrega algunos productos antes de hacer un pedido
          </p>
          <Link href="/catalog">
            <Button className="bg-orange-600 hover:bg-orange-700 text-white">
              Ver Catálogo
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                Confirmar Pedido
              </h1>
              <p className="text-gray-600 mt-1">
                Revisa tu pedido y completa los datos de entrega
              </p>
            </div>
            <Link href="/catalog">
              <Button variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-50">
                ← Seguir Comprando
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="text-orange-500 mr-2">📝</span>
              Datos de Entrega
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="text-sm text-red-700">
                    {error}
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="delivery_date" className="block text-sm font-semibold text-gray-700 mb-2">
                  Fecha de Entrega
                </label>
                <Input
                  type="date"
                  id="delivery_date"
                  name="delivery_date"
                  value={formData.delivery_date}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="border-orange-200 focus:border-orange-400 focus:ring-orange-200"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Especificar día de entrega
                </p>
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
                <p className="text-xs text-gray-500 mt-1">
                  Dirección de entrega - Especificar bien
                </p>
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
                <p className="text-xs text-gray-500 mt-1">
                  Para coordinar la entrega
                </p>
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
                  rows={4}
                  placeholder="Instrucciones especiales, alergias, preferencias..."
                  className="w-full p-3 border border-orange-200 rounded-lg focus:ring-orange-200 focus:border-orange-400 resize-none"
                />
              </div>

              <div className="pt-4">
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
                    `Confirmar Pedido - ${formatPriceBreakdown(total, 21).total}`
                  )}
                </Button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="text-orange-500 mr-2">🛒</span>
              Resumen del Pedido
            </h2>

            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.product.id} className="flex justify-between items-start pb-4 border-b border-gray-100">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.product.name}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{item.product.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-gray-500">
                        Cantidad: {item.quantity}
                      </span>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          −
                        </button>
                        <span className="min-w-[2rem] text-center font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full bg-orange-100 hover:bg-orange-200 flex items-center justify-center text-orange-600 transition-colors"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center text-red-600 transition-colors ml-2"
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
                const breakdown = formatPriceBreakdown(total, 21)
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
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">Total:</span>
                      <span className="text-2xl font-bold text-orange-600">{breakdown.total}</span>
                    </div>
                  </div>
                )
              })()}
              <p className="text-xs text-gray-500 mt-1 text-right">
                Precios finales con IVA incluido
              </p>
            </div>

            <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <h3 className="font-semibold text-orange-800 mb-2">ℹ️ Información Importante</h3>
              <ul className="text-sm text-orange-700 space-y-1">
                <li>• Los pedidos se preparan frescos diariamente</li>
                <li>• Horarios de entrega: 8:00 - 18:00</li>
                <li>• Para pedidos grandes, coordinaremos horario</li>
                <li>• Recibirás confirmación por email</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}