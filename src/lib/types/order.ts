// Tipos para el sistema de pedidos

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'

export interface Order {
  id: string
  user_id: string
  status: OrderStatus
  total_amount: number
  delivery_date: string | null
  delivery_address: string | null
  phone: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_code: string
  product_name: string
  quantity: number
  unit_price: number // Precio sin IVA
  unit_price_with_iva: number // Precio con IVA
  iva_rate: number
  line_total: number // quantity * unit_price_with_iva
  created_at: string
}

export interface OrderWithItems extends Order {
  items: OrderItem[]
  user?: {
    id: string
    email: string
    profile?: {
      full_name: string | null
      company_name: string | null
    }
  }
}

// Tipos para crear pedidos
export interface CreateOrderRequest {
  delivery_date?: string
  delivery_address?: string
  phone?: string
  notes?: string
  items: CreateOrderItemRequest[]
}

export interface CreateOrderItemRequest {
  product_id: string
  product_code: string
  product_name: string
  quantity: number
  unit_price: number
  unit_price_with_iva: number
  iva_rate: number
}

// Tipos para actualizar pedidos
export interface UpdateOrderRequest {
  status?: OrderStatus
  delivery_date?: string
  delivery_address?: string
  phone?: string
  notes?: string
}

// Tipos para filtros y listados
export interface OrderFilters {
  status?: OrderStatus
  user_id?: string
  delivery_date_from?: string
  delivery_date_to?: string
  created_at_from?: string
  created_at_to?: string
  page?: number
  limit?: number
  sortBy?: 'created_at' | 'delivery_date' | 'total_amount' | 'status'
  sortOrder?: 'asc' | 'desc'
}

export interface OrderListResponse {
  orders: OrderWithItems[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Tipos para el carrito al checkout
export interface CartItem {
  id: string
  name: string
  description: string
  price: number
  price_with_iva: number
  iva_rate: number
  category: string
  code: string
  quantity: number
}

export interface CheckoutData {
  delivery_date?: string
  delivery_address?: string
  phone?: string
  notes?: string
}

// Estados de pedido con metadata para UI
export const ORDER_STATUS_CONFIG = {
  pending: {
    label: 'Pendiente',
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-200',
    description: 'Pedido recibido, esperando confirmación'
  },
  confirmed: {
    label: 'Confirmado',
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    description: 'Pedido confirmado, en cola de preparación'
  },
  preparing: {
    label: 'En Preparación',
    color: 'orange',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-200',
    description: 'Pedido siendo preparado en panadería'
  },
  ready: {
    label: 'Listo',
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
    description: 'Pedido listo para entrega'
  },
  delivered: {
    label: 'Entregado',
    color: 'gray',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-200',
    description: 'Pedido entregado exitosamente'
  },
  cancelled: {
    label: 'Cancelado',
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
    description: 'Pedido cancelado'
  }
} as const

// Helper para obtener configuración de estado
export function getOrderStatusConfig(status: OrderStatus) {
  return ORDER_STATUS_CONFIG[status]
}

// Helper para obtener próximo estado válido
export function getNextValidStatuses(currentStatus: OrderStatus): OrderStatus[] {
  switch (currentStatus) {
    case 'pending':
      return ['confirmed', 'cancelled']
    case 'confirmed':
      return ['preparing', 'delivered', 'cancelled'] // Agregamos 'delivered' para permitir salto directo
    case 'preparing':
      return ['ready', 'delivered', 'cancelled'] // También permitir salto desde preparing
    case 'ready':
      return ['delivered']
    case 'delivered':
      return [] // Estado final
    case 'cancelled':
      return [] // Estado final
    default:
      return []
  }
}

// Helper para validar transición de estado
export function canTransitionToStatus(from: OrderStatus, to: OrderStatus): boolean {
  const validNextStatuses = getNextValidStatuses(from)
  return validNextStatuses.includes(to)
}

// Tipos para errores de pedidos
export interface OrderError {
  type: 'validation_error' | 'insufficient_stock' | 'invalid_status_transition' | 'unauthorized' | 'not_found' | 'server_error'
  message: string
  field?: string
} 