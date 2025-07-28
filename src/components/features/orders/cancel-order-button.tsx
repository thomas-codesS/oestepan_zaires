'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cancelOrder, canCancelOrder, getCancelReasonMessage } from '@/lib/services/order-service'

interface CancelOrderButtonProps {
  orderId: string
  orderStatus: string
  onSuccess?: () => void
  onError?: (error: string) => void
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
}

export function CancelOrderButton({
  orderId,
  orderStatus,
  onSuccess,
  onError,
  variant = 'destructive',
  size = 'default',
  className = ''
}: CancelOrderButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  // Verificar si el pedido se puede cancelar
  const canCancel = canCancelOrder(orderStatus)

  const handleCancelClick = () => {
    setShowConfirmation(true)
  }

  const handleConfirmCancel = async () => {
    setIsLoading(true)
    setShowConfirmation(false)

    try {
      const result = await cancelOrder(orderId)

      if (result.success) {
        console.log('✅ Pedido cancelado exitosamente')
        onSuccess?.()
      } else {
        console.error('❌ Error al cancelar:', result.error)
        onError?.(result.error || 'Error desconocido')
      }
    } catch (error) {
      console.error('💥 Error inesperado:', error)
      onError?.('Error de conexión')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelConfirmation = () => {
    setShowConfirmation(false)
  }

  // Si no se puede cancelar, mostrar botón deshabilitado con tooltip
  if (!canCancel) {
    return (
      <div className="relative group">
        <Button
          variant="outline"
          size={size}
          disabled
          className={`opacity-50 cursor-not-allowed ${className}`}
        >
          No se puede cancelar
        </Button>
        
        {/* Tooltip explicativo */}
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 
                        bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap
                        opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          {getCancelReasonMessage(orderStatus)}
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Botón principal */}
      <Button
        variant={variant}
        size={size}
        onClick={handleCancelClick}
        disabled={isLoading}
        className={className}
      >
        {isLoading ? (
          <>
            <span className="animate-spin mr-2">⏳</span>
            Cancelando...
          </>
        ) : (
          '🚫 Cancelar Pedido'
        )}
      </Button>

      {/* Modal de confirmación */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ¿Confirmar cancelación?
              </h3>
              <p className="text-gray-600">
                ¿Estás seguro que deseas cancelar este pedido? Esta acción no se puede deshacer.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Los productos se devolverán automáticamente al inventario.
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={handleCancelConfirmation}
                disabled={isLoading}
              >
                No, mantener pedido
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmCancel}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Cancelando...
                  </>
                ) : (
                  'Sí, cancelar pedido'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 