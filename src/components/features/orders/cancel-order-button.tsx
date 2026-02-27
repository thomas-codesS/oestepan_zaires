'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { orderService } from '@/lib/services/order-service'

interface CancelOrderButtonProps {
  orderId: string
  orderStatus: string
  onSuccess?: () => void
  onError?: (error: string) => void
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
}

const CANCELLABLE_STATUSES = ['pending']

function canCancelOrder(status: string): boolean {
  return CANCELLABLE_STATUSES.includes(status)
}

function getCancelReasonMessage(status: string): string {
  switch (status) {
    case 'confirmed':
    case 'preparing':
    case 'ready':
      return 'El pedido ya está en proceso y no se puede cancelar desde aquí'
    case 'delivered':
      return 'El pedido ya fue entregado'
    case 'cancelled':
      return 'El pedido ya está cancelado'
    default:
      return 'No se puede cancelar este pedido'
  }
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

  const canCancel = canCancelOrder(orderStatus)

  const handleCancelClick = () => {
    setShowConfirmation(true)
  }

  const handleConfirmCancel = async () => {
    setIsLoading(true)
    setShowConfirmation(false)

    try {
      await orderService.cancelOrder(orderId)
      onSuccess?.()
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Error de conexión')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelConfirmation = () => {
    setShowConfirmation(false)
  }

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
      <Button
        variant={variant}
        size={size}
        onClick={handleCancelClick}
        disabled={isLoading}
        className={className}
      >
        {isLoading ? 'Cancelando...' : 'Cancelar Pedido'}
      </Button>

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
                {isLoading ? 'Cancelando...' : 'Sí, cancelar pedido'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
