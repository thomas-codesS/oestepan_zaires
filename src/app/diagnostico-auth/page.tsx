'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface DiagnosticResult {
  test: string
  status: 'success' | 'error' | 'warning' | 'info'
  message: string
  details?: string
}

export default function DiagnosticoAuthPage() {
  const [results, setResults] = useState<DiagnosticResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    runDiagnostics()
  }, [])

  const runDiagnostics = async () => {
    const diagnostics: DiagnosticResult[] = []
    const supabase = createClient()

    // Test 1: Variables de entorno
    diagnostics.push({
      test: 'Variables de Entorno',
      status: process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
        ? 'success' 
        : 'error',
      message: process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        ? 'Variables de entorno configuradas correctamente'
        : 'Faltan variables de entorno',
      details: `URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅' : '❌'} | ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅' : '❌'}`
    })

    // Test 2: Conexión con Supabase
    try {
      const { data, error } = await supabase.auth.getSession()
      diagnostics.push({
        test: 'Conexión con Supabase',
        status: error ? 'error' : 'success',
        message: error ? 'Error conectando con Supabase' : 'Conexión exitosa con Supabase',
        details: error?.message
      })
    } catch (error: any) {
      diagnostics.push({
        test: 'Conexión con Supabase',
        status: 'error',
        message: 'Error al intentar conectar',
        details: error.message
      })
    }

    // Test 3: Estado de sesión actual
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        diagnostics.push({
          test: 'Sesión Actual',
          status: 'success',
          message: `Usuario logueado: ${session.user.email}`,
          details: `ID: ${session.user.id} | Expira: ${new Date(session.expires_at! * 1000).toLocaleString()}`
        })
      } else {
        diagnostics.push({
          test: 'Sesión Actual',
          status: 'info',
          message: 'No hay usuario logueado',
          details: 'Esto es normal si no has iniciado sesión'
        })
      }
    } catch (error: any) {
      diagnostics.push({
        test: 'Sesión Actual',
        status: 'error',
        message: 'Error obteniendo sesión',
        details: error.message
      })
    }

    // Test 4: Verificar tabla profiles
    try {
      const { error } = await supabase.from('profiles').select('id').limit(1)
      diagnostics.push({
        test: 'Tabla profiles',
        status: error ? 'error' : 'success',
        message: error ? 'Error accediendo a tabla profiles' : 'Tabla profiles accesible',
        details: error?.message
      })
    } catch (error: any) {
      diagnostics.push({
        test: 'Tabla profiles',
        status: 'error',
        message: 'Error verificando tabla',
        details: error.message
      })
    }

    // Test 5: Verificar tabla products
    try {
      const { error } = await supabase.from('products').select('id').limit(1)
      diagnostics.push({
        test: 'Tabla products',
        status: error ? 'error' : 'success',
        message: error ? 'Error accediendo a tabla products' : 'Tabla products accesible',
        details: error?.message
      })
    } catch (error: any) {
      diagnostics.push({
        test: 'Tabla products',
        status: 'error',
        message: 'Error verificando tabla',
        details: error.message
      })
    }

    // Test 6: Verificar configuración de Auth
    diagnostics.push({
      test: 'Configuración de Auth',
      status: 'warning',
      message: 'Verifica manualmente en Supabase Dashboard',
      details: 'Authentication → Settings → Email Auth: "Enable email confirmations" debe estar deshabilitado para desarrollo'
    })

    // Test 7: URLs de callback
    const callbackUrl = `${window.location.origin}/auth/callback`
    diagnostics.push({
      test: 'URL de Callback',
      status: 'info',
      message: 'Verifica que esta URL esté en Redirect URLs de Supabase',
      details: callbackUrl
    })

    setResults(diagnostics)
    setLoading(false)
  }

  const getStatusColor = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success': return 'bg-green-50 border-green-200 text-green-800'
      case 'error': return 'bg-red-50 border-red-200 text-red-800'
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-800'
    }
  }

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success': return '✅'
      case 'error': return '❌'
      case 'warning': return '⚠️'
      case 'info': return 'ℹ️'
    }
  }

  const getStatusBadge = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success': return 'bg-green-500'
      case 'error': return 'bg-red-500'
      case 'warning': return 'bg-yellow-500'
      case 'info': return 'bg-blue-500'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                🔍 Diagnóstico de Autenticación
              </h1>
              <p className="text-gray-600">
                Verificación del sistema de autenticación y configuración de Supabase
              </p>
            </div>
            <button
              onClick={() => {
                setLoading(true)
                runDiagnostics()
              }}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              disabled={loading}
            >
              {loading ? '⏳ Ejecutando...' : '🔄 Reejecutar'}
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-600">Ejecutando diagnósticos...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 ${getStatusColor(result.status)}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{getStatusIcon(result.status)}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-lg">{result.test}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs text-white ${getStatusBadge(result.status)}`}>
                          {result.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="mb-2">{result.message}</p>
                      {result.details && (
                        <p className="text-sm opacity-75 font-mono bg-black/5 px-3 py-2 rounded">
                          {result.details}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 pt-8 border-t border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4">📋 Pasos Siguientes</h2>
            <div className="space-y-3 text-gray-700">
              <div className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">1.</span>
                <p>
                  Si ves errores arriba, revisa{' '}
                  <code className="bg-orange-100 px-2 py-1 rounded text-sm">
                    SOLUCION_PROBLEMAS_AUTH.md
                  </code>
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">2.</span>
                <p>
                  Verifica la configuración de Supabase en{' '}
                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-600 hover:underline font-semibold"
                  >
                    Dashboard → Authentication → Settings
                  </a>
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">3.</span>
                <p>
                  Si todo está OK, prueba{' '}
                  <a href="/register" className="text-orange-600 hover:underline font-semibold">
                    registrar un usuario
                  </a>{' '}
                  o{' '}
                  <a href="/login" className="text-orange-600 hover:underline font-semibold">
                    iniciar sesión
                  </a>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">💡 Consejo</h3>
            <p className="text-blue-700 text-sm">
              Si encuentras problemas, abre la consola del navegador (F12) para ver logs detallados
              del proceso de autenticación.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">🔗 Enlaces Útiles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 border border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all"
            >
              <h3 className="font-semibold text-gray-800 mb-1">Supabase Dashboard</h3>
              <p className="text-sm text-gray-600">Administra tu proyecto</p>
            </a>
            <a
              href="/debug-session"
              className="p-4 border border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all"
            >
              <h3 className="font-semibold text-gray-800 mb-1">Debug Session</h3>
              <p className="text-sm text-gray-600">Ver estado de sesión detallado</p>
            </a>
            <a
              href="/register"
              className="p-4 border border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all"
            >
              <h3 className="font-semibold text-gray-800 mb-1">Registrar Usuario</h3>
              <p className="text-sm text-gray-600">Crear nueva cuenta</p>
            </a>
            <a
              href="/login"
              className="p-4 border border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all"
            >
              <h3 className="font-semibold text-gray-800 mb-1">Iniciar Sesión</h3>
              <p className="text-sm text-gray-600">Entrar a tu cuenta</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

