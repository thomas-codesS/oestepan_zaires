'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth/auth-context'

export default function DebugLoginPage() {
  const [credentials, setCredentials] = useState({
    email: 'panaderia.central@gmail.com',
    password: 'cliente123'
  })
  const [logs, setLogs] = useState<string[]>([])
  const [currentStep, setCurrentStep] = useState<number>(0)
  
  const { signIn } = useAuth()
  
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    const logMessage = `${timestamp}: ${message}`
    setLogs(prev => [...prev, logMessage])
    console.log(logMessage)
  }

  const clearLogs = () => {
    setLogs([])
    setCurrentStep(0)
  }

  const testSupabaseConnection = async () => {
    addLog('🔍 Paso 1: Probando conexión a Supabase...')
    setCurrentStep(1)
    
    try {
      const supabase = createClient()
      addLog('✅ Cliente Supabase creado exitosamente')
      
      // Test básico de conexión
      const { error } = await supabase.from('profiles').select('id').limit(1)
      
      if (error) {
        addLog(`❌ Error de conexión: ${error.message}`)
        return false
      } else {
        addLog('✅ Conexión a base de datos exitosa')
        return true
      }
    } catch (error) {
      addLog(`❌ Error creando cliente: ${error}`)
      return false
    }
  }

  const testLogin = async () => {
    addLog('🔐 Paso 2: Probando login directo con Supabase...')
    setCurrentStep(2)
    
    try {
      const supabase = createClient()
      
      addLog(`📧 Intentando login con: ${credentials.email}`)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      })
      
      if (error) {
        addLog(`❌ Error de autenticación: ${error.message}`)
        return false
      }
      
      if (!data.user) {
        addLog('❌ No se recibió usuario en respuesta')
        return false
      }
      
      addLog(`✅ Login exitoso - Usuario: ${data.user.email}`)
      addLog(`📊 Session válida: ${data.session ? 'Sí' : 'No'}`)
      
      return { user: data.user, session: data.session }
    } catch (error) {
      addLog(`❌ Error en login directo: ${error}`)
      return false
    }
  }

  const testSessionPersistence = async () => {
    addLog('💾 Paso 3: Verificando persistencia de sesión...')
    setCurrentStep(3)
    
    try {
      const supabase = createClient()
      
      // Esperar un momento para que se guarde
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        addLog(`❌ Error obteniendo sesión: ${error.message}`)
        return false
      }
      
      if (!session) {
        addLog('❌ No se encontró sesión guardada')
        return false
      }
      
      addLog(`✅ Sesión encontrada: ${session.user?.email}`)
      addLog(`📊 Access token: ${session.access_token ? 'Presente' : 'Ausente'}`)
      
      return session
    } catch (error) {
      addLog(`❌ Error verificando sesión: ${error}`)
      return false
    }
  }

  const testContextLogin = async () => {
    addLog('🔄 Paso 4: Probando login con contexto de la app...')
    setCurrentStep(4)
    
    try {
      await signIn(credentials)
      addLog('✅ Login con contexto exitoso')
      return true
    } catch (error) {
      addLog(`❌ Error en login con contexto: ${error}`)
      return false
    }
  }

  const runFullDiagnostic = async () => {
    clearLogs()
    addLog('🚀 Iniciando diagnóstico completo de login...')
    
    // Paso 1: Conexión
    const connectionOk = await testSupabaseConnection()
    if (!connectionOk) {
      addLog('💥 Diagnóstico detenido: Problemas de conexión')
      return
    }
    
    // Paso 2: Login directo
    const loginResult = await testLogin()
    if (!loginResult) {
      addLog('💥 Diagnóstico detenido: Problemas en autenticación')
      return
    }
    
    // Paso 3: Persistencia
    const sessionResult = await testSessionPersistence()
    if (!sessionResult) {
      addLog('💥 PROBLEMA ENCONTRADO: La sesión no persiste')
      addLog('🔧 Esto explica por qué el login no funciona')
      return
    }
    
    // Paso 4: Context
    const contextResult = await testContextLogin()
    if (!contextResult) {
      addLog('💥 PROBLEMA ENCONTRADO: El contexto no funciona')
      return
    }
    
    addLog('🎉 ¡DIAGNÓSTICO COMPLETO EXITOSO!')
    addLog('✅ Todos los componentes funcionan correctamente')
  }

  const quickLogin = async () => {
    addLog('⚡ Intentando login rápido...')
    try {
      await signIn(credentials)
      addLog('✅ Login rápido exitoso')
    } catch (error) {
      addLog(`❌ Error en login rápido: ${error}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🔧 Diagnóstico de Login - Oeste Pan
          </h1>

          {/* Formulario de credenciales */}
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-blue-900 mb-3">Credenciales de Prueba</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email:</label>
                <Input
                  value={credentials.email}
                  onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@ejemplo.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contraseña:</label>
                <Input
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="contraseña"
                />
              </div>
            </div>
          </div>

          {/* Indicador de progreso */}
          <div className="bg-gray-100 p-4 rounded-lg mb-6">
            <h3 className="font-semibold mb-2">Progreso del Diagnóstico</h3>
            <div className="flex space-x-2">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    currentStep >= step
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {step}
                </div>
              ))}
            </div>
            <div className="text-sm text-gray-600 mt-2">
              1. Conexión | 2. Login | 3. Persistencia | 4. Contexto
            </div>
          </div>

          {/* Controles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Button onClick={runFullDiagnostic} className="bg-blue-600 hover:bg-blue-700">
              🚀 Diagnóstico Completo
            </Button>
            <Button onClick={quickLogin} className="bg-green-600 hover:bg-green-700">
              ⚡ Login Rápido
            </Button>
            <Button onClick={clearLogs} variant="outline">
              🗑️ Limpiar Logs
            </Button>
          </div>

          {/* Controles individuales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-6">
            <Button onClick={testSupabaseConnection} size="sm" variant="outline">
              1️⃣ Conexión
            </Button>
            <Button onClick={testLogin} size="sm" variant="outline">
              2️⃣ Login
            </Button>
            <Button onClick={testSessionPersistence} size="sm" variant="outline">
              3️⃣ Persistencia
            </Button>
            <Button onClick={testContextLogin} size="sm" variant="outline">
              4️⃣ Contexto
            </Button>
          </div>

          {/* Logs */}
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
            <h3 className="text-white font-bold mb-2">📝 Logs de Diagnóstico</h3>
            <div className="max-h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-gray-500">Esperando diagnóstico...</div>
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
            <a href="/login" className="text-blue-600 hover:underline">
              ← Volver a Login
            </a>
            <a href="/debug-session" className="text-blue-600 hover:underline">
              Debug de Sesión →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
} 