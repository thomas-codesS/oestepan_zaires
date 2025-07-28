'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useCartStore, useCartStats } from '@/lib/store/cart-store'
import { formatPrice } from '@/lib/utils/format'
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'

export function CartSidebar() {
  const { 
    isOpen, 
    closeCart, 
    updateQuantity, 
    removeItem, 
    clearCart 
  } = useCartStore()
  
  const { items, total, itemCount, isEmpty } = useCartStats()

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={closeCart}
      />
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        shadow-xl flex flex-col
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gray-50">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="h-5 w-5 text-orange-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Carrito de Compras
            </h2>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={closeCart}
            className="p-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Badge de cantidad */}
        {itemCount > 0 && (
          <div className="px-6 py-3 bg-orange-50 border-b">
            <p className="text-sm text-orange-800">
              {itemCount} {itemCount === 1 ? 'producto' : 'productos'} en tu carrito
            </p>
          </div>
        )}

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto">
          {isEmpty ? (
            /* Carrito vacío */
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Tu carrito está vacío
              </h3>
              <p className="text-gray-600 mb-6">
                Agrega algunos productos deliciosos de nuestra panadería
              </p>
              <Link href="/catalog">
                <Button onClick={closeCart}>
                  Explorar Catálogo
                </Button>
              </Link>
            </div>
          ) : (
            /* Lista de productos */
            <div className="p-6 space-y-4">
              {items.map((item) => (
                <div key={item.product.id} className="bg-gray-50 rounded-lg p-4">
                  {/* Información del producto */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">
                        {item.product.name}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {item.product.category}
                      </p>
                      <p className="text-sm font-medium text-orange-600">
                        {formatPrice(item.product.price_with_iva)} c/u
                      </p>
                    </div>
                    
                    {/* Botón eliminar */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.product.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Controles de cantidad */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      
                      <span className="font-medium w-8 text-center">
                        {item.quantity}
                      </span>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    {/* Subtotal */}
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatPrice(item.subtotal)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer - Total y acciones */}
        {!isEmpty && (
          <div className="border-t bg-gray-50 p-6 space-y-4">
            {/* Total */}
            <div className="flex justify-between items-center text-lg font-semibold">
              <span className="text-gray-900">Total:</span>
              <span className="text-orange-600">
                {formatPrice(total)}
              </span>
            </div>

            {/* Botones de acción */}
            <div className="space-y-3">
              <Link href="/checkout" className="block">
                <Button 
                  className="w-full"
                  size="lg"
                  onClick={closeCart}
                >
                  Proceder al Checkout
                </Button>
              </Link>
              
              <div className="flex space-x-3">
                <Link href="/catalog" className="flex-1">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={closeCart}
                  >
                    Seguir Comprando
                  </Button>
                </Link>
                
                <Button
                  variant="outline"
                  onClick={clearCart}
                  className="px-4"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Info adicional */}
            <div className="text-xs text-gray-500 text-center">
              Los precios incluyen IVA
            </div>
          </div>
        )}
      </div>
    </>
  )
}

// Componente del botón flotante del carrito
export function CartButton() {
  const { toggleCart } = useCartStore()
  const { itemCount } = useCartStats()

  return (
    <Button
      onClick={toggleCart}
      className="relative"
      variant="outline"
    >
      <ShoppingBag className="h-4 w-4" />
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
      <span className="ml-2 hidden sm:inline">
        Carrito {itemCount > 0 && `(${itemCount})`}
      </span>
    </Button>
  )
}

// Hook para mostrar notificaciones cuando se agrega al carrito
export function useCartNotifications() {
  const addItem = useCartStore(state => state.addItem)

  const addItemWithNotification = (product: any, quantity: number = 1) => {
    addItem(product, quantity)
    
    // Aquí podrías agregar una notificación toast si quieres
    console.log(`✅ ${product.name} agregado al carrito`)
  }

  return { addItemWithNotification }
} 