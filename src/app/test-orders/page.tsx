'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function TestOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    const logMessage = `${timestamp}: ${message}`
    setLogs(prev => [...prev, logMessage])
    console.log(logMessage)
  }

  const testOrdersAPI = async () => {
    addLog('🔍 Probando API de orders...')
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '10'
      })

      addLog(`📞 Haciendo fetch a: /api/orders?${params}`)
      
      const response = await fetch(`/api/orders?${params}`)
      
      addLog(`📥 Respuesta recibida - Status: ${response.status}`)

      if (!response.ok) {
        const errorText = await response.text()
        addLog(`❌ Error en respuesta: ${errorText}`)
        throw new Error(`Error ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      addLog(`✅ Datos recibidos: ${JSON.stringify(data, null, 2)}`)

      setOrders(data.orders || [])
      addLog(`📊 Pedidos cargados: ${data.orders?.length || 0}`)
      addLog(`📄 Total de páginas: ${data.totalPages || 0}`)

    } catch (err: any) {
      addLog(`❌ Error en test: ${err.message}`)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const clearLogs = () => {
    setLogs([])
    setOrders([])
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🧪 Test API Orders - Oeste Pan
          </h1>

          {/* Controles */}
          <div className="flex gap-4 mb-6">
            <Button 
              onClick={testOrdersAPI} 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? '⏳ Probando...' : '🔍 Probar API Orders'}
            </Button>
            <Button onClick={clearLogs} variant="outline">
              🗑️ Limpiar
            </Button>
            <a href="/orders" className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
              📋 Ver Página Orders Real
            </a>
          </div>

          {/* Estado actual */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-red-900 mb-2">❌ Error</h3>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {orders.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-green-900 mb-2">✅ Pedidos Cargados</h3>
              <p className="text-green-700">Se encontraron {orders.length} pedidos</p>
              <div className="mt-2 text-sm">
                {orders.map((order, index) => (
                  <div key={order.id} className="border-b py-2">
                    <strong>#{index + 1}:</strong> {order.id} - {order.status} - ${order.total_amount}
                    {order.user?.profile?.company_name && (
                      <span className="text-gray-600"> - {order.user.profile.company_name}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Logs */}
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
            <h3 className="text-white font-bold mb-2">📝 Logs de Test</h3>
            <div className="max-h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-gray-500">Esperando test...</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="py-1">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Enlaces útiles */}
          <div className="mt-6 text-center space-x-4">
            <a href="/orders" className="text-blue-600 hover:underline">
              📋 Página Orders Real
            </a>
            <a href="/debug-login" className="text-purple-600 hover:underline">
              🔧 Debug Login
            </a>
            <a href="/debug-session" className="text-blue-600 hover:underline">
              🛠️ Debug Session
            </a>
          </div>
        </div>
      </div>
    </div>
  )
} 