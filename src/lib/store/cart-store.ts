import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Tipos para el carrito
export interface CartProduct {
  id: string
  name: string
  description: string
  price: number
  price_with_iva: number
  iva_rate: number
  category: string
  code: string
}

export interface CartItem {
  product: CartProduct
  quantity: number
  subtotal: number // price_with_iva * quantity
}

export interface CartState {
  items: CartItem[]
  total: number
  itemCount: number
  isOpen: boolean
}

export interface CartActions {
  // Gestión de productos
  addItem: (product: CartProduct, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  
  // UI del carrito
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  
  // Utilidades
  getItemQuantity: (productId: string) => number
  isItemInCart: (productId: string) => boolean
  calculateTotals: () => void
}

export type CartStore = CartState & CartActions

// Helper para calcular subtotal
const calculateSubtotal = (product: CartProduct, quantity: number): number => {
  return product.price_with_iva * quantity
}

// Helper para calcular totales del carrito
const calculateCartTotals = (items: CartItem[]) => {
  const total = items.reduce((sum, item) => sum + item.subtotal, 0)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  return { total, itemCount }
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      items: [],
      total: 0,
      itemCount: 0,
      isOpen: false,

      // Agregar producto al carrito
      addItem: (product: CartProduct, quantity: number = 1) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            item => item.product.id === product.id
          )

          let newItems: CartItem[]

          if (existingItemIndex >= 0) {
            // Si el producto ya existe, aumentar cantidad
            newItems = state.items.map((item, index) => {
              if (index === existingItemIndex) {
                const newQuantity = item.quantity + quantity
                return {
                  ...item,
                  quantity: newQuantity,
                  subtotal: calculateSubtotal(item.product, newQuantity)
                }
              }
              return item
            })
          } else {
            // Si es un producto nuevo, agregarlo
            const newItem: CartItem = {
              product,
              quantity,
              subtotal: calculateSubtotal(product, quantity)
            }
            newItems = [...state.items, newItem]
          }

          const { total, itemCount } = calculateCartTotals(newItems)

          return {
            items: newItems,
            total,
            itemCount
          }
        })
      },

      // Remover producto del carrito
      removeItem: (productId: string) => {
        set((state) => {
          const newItems = state.items.filter(
            item => item.product.id !== productId
          )
          
          const { total, itemCount } = calculateCartTotals(newItems)

          return {
            items: newItems,
            total,
            itemCount
          }
        })
      },

      // Actualizar cantidad de un producto
      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }

        set((state) => {
          const newItems = state.items.map(item => {
            if (item.product.id === productId) {
              return {
                ...item,
                quantity,
                subtotal: calculateSubtotal(item.product, quantity)
              }
            }
            return item
          })

          const { total, itemCount } = calculateCartTotals(newItems)

          return {
            items: newItems,
            total,
            itemCount
          }
        })
      },

      // Limpiar carrito
      clearCart: () => {
        set({
          items: [],
          total: 0,
          itemCount: 0,
          isOpen: false
        })
      },

      // Abrir carrito
      openCart: () => {
        set({ isOpen: true })
      },

      // Cerrar carrito
      closeCart: () => {
        set({ isOpen: false })
      },

      // Toggle carrito
      toggleCart: () => {
        set((state) => ({ isOpen: !state.isOpen }))
      },

      // Obtener cantidad de un producto específico
      getItemQuantity: (productId: string) => {
        const item = get().items.find(item => item.product.id === productId)
        return item?.quantity || 0
      },

      // Verificar si un producto está en el carrito
      isItemInCart: (productId: string) => {
        return get().items.some(item => item.product.id === productId)
      },

      // Recalcular totales (útil para debugging)
      calculateTotals: () => {
        set((state) => {
          const { total, itemCount } = calculateCartTotals(state.items)
          return { total, itemCount }
        })
      }
    }),
    {
      name: 'oeste-pan-cart', // Nombre para localStorage
      // Solo persistir el estado, no las funciones
      partialize: (state) => ({
        items: state.items,
        total: state.total,
        itemCount: state.itemCount
      }),
      // Versión del store para manejar migraciones futuras
      version: 1,
    }
  )
)

// Hook personalizado para obtener estadísticas del carrito
export const useCartStats = () => {
  const items = useCartStore(state => state.items)
  const total = useCartStore(state => state.total)
  const itemCount = useCartStore(state => state.itemCount)

  return {
    items,
    total,
    itemCount,
    isEmpty: items.length === 0,
    hasItems: items.length > 0
  }
}

// Hook para obtener un producto específico del carrito
export const useCartItem = (productId: string) => {
  return useCartStore(state => 
    state.items.find(item => item.product.id === productId)
  )
} 