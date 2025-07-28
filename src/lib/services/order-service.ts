// Servicio para operaciones de pedidos

export interface CancelOrderResponse {
  success: boolean
  message: string
  error?: string
}

/**
 * Cancela un pedido específico
 * @param orderId ID del pedido a cancelar
 * @returns Respuesta con resultado de la operación
 */
export async function cancelOrder(orderId: string): Promise<CancelOrderResponse> {
  try {
    console.log(`🚫 Cancelando pedido ${orderId}...`)

    const response = await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'cancelled'
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error(`❌ Error cancelando pedido:`, errorData)
      
      return {
        success: false,
        message: 'Error al cancelar el pedido',
        error: errorData.error || 'Error desconocido'
      }
    }

    const data = await response.json()
    console.log(`✅ Pedido cancelado exitosamente:`, data)

    return {
      success: true,
      message: data.message || 'Pedido cancelado exitosamente'
    }

  } catch (error) {
    console.error('💥 Error en cancelOrder:', error)
    
    return {
      success: false,
      message: 'Error de conexión al cancelar el pedido',
      error: 'Network error'
    }
  }
}

/**
 * Verifica si un pedido se puede cancelar según su estado
 * @param status Estado actual del pedido
 * @returns true si se puede cancelar, false si no
 */
export function canCancelOrder(status: string): boolean {
  const cancellableStatuses = ['pending', 'confirmed', 'preparing']
  return cancellableStatuses.includes(status)
}

/**
 * Obtiene el mensaje explicativo de por qué no se puede cancelar un pedido
 * @param status Estado actual del pedido
 * @returns Mensaje explicativo
 */
export function getCancelReasonMessage(status: string): string {
  switch (status) {
    case 'ready':
      return 'No se puede cancelar porque el pedido ya está listo'
    case 'delivered':
      return 'No se puede cancelar porque el pedido ya fue entregado'
    case 'cancelled':
      return 'El pedido ya está cancelado'
    default:
      return 'Este pedido no se puede cancelar'
  }
} 