// Servicio para operaciones de pedidos

export interface CancelOrderResponse {
  success: boolean
  message: string
}

export class OrderService {
  async cancelOrder(orderId: string): Promise<CancelOrderResponse> {
    const response = await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status: 'cancelled' })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Error al cancelar el pedido')
    }

    const data = await response.json()
    return { success: true, message: data.message || 'Pedido cancelado exitosamente' }
  }

  async updateOrderStatus(orderId: string, newStatus: string): Promise<any> {
    const response = await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status: newStatus })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Error al actualizar el estado del pedido')
    }

    return response.json()
  }
}

export const orderService = new OrderService()
