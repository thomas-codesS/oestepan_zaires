'use client'

import React, { useState } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle, Wrench } from 'lucide-react'

export default function FixTotalsPage() {
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFixTotals = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/admin/fix-totals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al ejecutar reparación')
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  if (profile?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Acceso Denegado</h1>
          <p className="text-gray-600">Solo los administradores pueden acceder a esta página.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center mb-6">
            <Wrench className="h-8 w-8 text-orange-500 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">
              Reparar Totales de Pedidos
            </h1>
          </div>

          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              Esta herramienta recalcula los totales de todos los pedidos basándose en sus items.
              Úsala si ves pedidos con totales en NaN o incorrectos.
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
                <div>
                  <h3 className="font-medium text-yellow-800">Advertencia</h3>
                  <p className="text-yellow-700 text-sm mt-1">
                    Esta operación modificará los totales de pedidos en la base de datos.
                    Asegúrate de que sea necesario antes de ejecutarla.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Button
            onClick={handleFixTotals}
            disabled={loading}
            className="bg-orange-600 hover:bg-orange-700 text-white mb-6"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Reparando...
              </>
            ) : (
              <>
                <Wrench className="h-4 w-4 mr-2" />
                Ejecutar Reparación
              </>
            )}
          </Button>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                <div>
                  <h3 className="font-medium text-red-800">Error</h3>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {result && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-start mb-4">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <div>
                  <h3 className="font-medium text-green-800">Reparación Completada</h3>
                  <p className="text-green-700 text-sm mt-1">{result.message}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <h4 className="font-medium text-gray-900 mb-2">Resumen</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>Pedidos procesados: {result.summary.totalProcessed}</li>
                    <li>Pedidos corregidos: {result.summary.fixed}</li>
                    <li>Pedidos sin items: {result.summary.noItems}</li>
                    <li>Pedidos con total: {result.summary.ordersWithTotal}/{result.summary.totalOrders}</li>
                  </ul>
                </div>

                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <h4 className="font-medium text-gray-900 mb-2">Ingresos</h4>
                  <p className="text-2xl font-bold text-green-600">
                    ${result.summary.totalRevenue.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">Ingresos totales (sin cancelados)</p>
                </div>
              </div>

              {result.results && result.results.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Primeros resultados:</h4>
                  <div className="bg-white rounded-lg border border-green-200 p-4 max-h-60 overflow-y-auto">
                    {result.results.map((item: any, index: number) => (
                      <div key={index} className="text-sm py-1 border-b border-gray-100 last:border-b-0">
                        <span className="font-mono text-gray-600">{item.orderId.slice(-8)}</span>
                        <span className="mx-2">
                          {item.status === 'fixed' && '✅ Corregido'}
                          {item.status === 'no_items' && '⚠️ Sin items'}
                          {item.status === 'error' && '❌ Error'}
                        </span>
                        <span className="text-gray-600">
                          ${item.oldTotal} → ${item.newTotal}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
