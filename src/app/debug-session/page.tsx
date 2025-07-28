'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth/auth-context'
import { createClient } from '@/lib/supabase/client'
import { 
  clearSupabaseCookies, 
  clearLocalStorage, 
  clearSessionStorage, 
  forceLogout,
  diagnosticSessionInfo 
} from '@/lib/utils/clear-session'

export default function DebugSessionPage() {
  const { user, profile, loading, initialized } = useAuth()
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [storageInfo, setStorageInfo] = useState<any>(null)
  const [logs, setLogs] = useState<string[]>([])
  
  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
    console.log(message)
  }

  const analyzeSession = async () => {
    addLog('🔍 Analizando sesión...')
    
    const supabase = createClient()
    
    try {
      // Obtener información de sesión
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      addLog(`Sesión - Error: ${sessionError ? sessionError.message : 'ninguno'}`)
      addLog(`Sesión - Usuario: ${sessionData.session?.user?.email || 'ninguno'}`)
      
      // Obtener información de usuario
      const { data: userData, error: userError } = await supabase.auth.getUser()
      addLog(`Usuario - Error: ${userError ? userError.message : 'ninguno'}`)
      addLog(`Usuario - Email: ${userData.user?.email || 'ninguno'}`)
      
      setSessionInfo({
        session: sessionData.session,
        sessionError,
        user: userData.user,
        userError
      })
      
    } catch (error) {
      addLog(`❌ Error en análisis: ${error}`)
    }
  }

  const analyzeStorage = () => {
    addLog('💾 Analizando almacenamiento...')
    
    const localStorage_keys = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.includes('supabase') || key.includes('sb-') || key.includes('auth'))) {
        localStorage_keys.push({
          key,
          value: localStorage.getItem(key)?.substring(0, 100) + '...'
        })
      }
    }
    
    const sessionStorage_keys = []
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key && (key.includes('supabase') || key.includes('sb-') || key.includes('auth'))) {
        sessionStorage_keys.push({
          key,
          value: sessionStorage.getItem(key)?.substring(0, 100) + '...'
        })
      }
    }
    
    const cookies = document.cookie.split(';').filter(c => {
      const name = c.split('=')[0].trim()
      return name.includes('sb') || name.includes('supabase') || name.includes('auth')
    })
    
    setStorageInfo({
      localStorage: localStorage_keys,
      sessionStorage: sessionStorage_keys,
      cookies
    })
    
    addLog(`📊 localStorage: ${localStorage_keys.length} keys`)
    addLog(`📊 sessionStorage: ${sessionStorage_keys.length} keys`)
    addLog(`📊 Cookies: ${cookies.length} items`)
  }

  const clearSpecificStorage = () => {
    addLog('🧹 Limpiando almacenamiento específico...')
    
    // Limpiar el token específico que vimos en el diagnóstico
    const specificKey = 'sb-zyywhdcnuonbpjymiysc-auth-token'
    if (localStorage.getItem(specificKey)) {
      localStorage.removeItem(specificKey)
      addLog(`✅ Removido: ${specificKey}`)
    }
    
    clearLocalStorage()
    clearSessionStorage()
    clearSupabaseCookies()
    
    addLog('✅ Limpieza completada')
    
    // Reanalizar después de limpiar
    setTimeout(() => {
      analyzeStorage()
      analyzeSession()
    }, 1000)
  }

  const fixSyncIssue = async () => {
    addLog('🔧 Detectando problema de sincronización...')
    
    // Verificar si hay desconexión entre contexto y Supabase
    if (user && user.email) {
      addLog(`👤 Contexto dice: ${user.email}`)
      
      const supabase = createClient()
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (!session || !session.user) {
          addLog('❌ PROBLEMA ENCONTRADO: Contexto tiene usuario pero Supabase no')
          addLog('🧹 Limpiando estado corrupto automáticamente...')
          
          clearSpecificStorage()
          
          // Forzar logout del contexto también
          setTimeout(() => {
            addLog('🔄 Recargando página para sincronizar...')
            window.location.reload()
          }, 2000)
          
        } else if (session.user.email !== user.email) {
          addLog(`❌ PROBLEMA ENCONTRADO: Usuarios diferentes - Contexto: ${user.email}, Supabase: ${session.user.email}`)
          addLog('🧹 Limpiando estado corrupto automáticamente...')
          clearSpecificStorage()
          
          setTimeout(() => {
            addLog('🔄 Recargando página para sincronizar...')
            window.location.reload()
          }, 2000)
          
        } else {
          addLog('✅ No hay problema de sincronización detectado')
        }
        
      } catch (error) {
        addLog(`❌ Error verificando sesión: ${error}`)
        addLog('🧹 Limpiando por error...')
        clearSpecificStorage()
      }
      
    } else {
      addLog('ℹ️ No hay usuario en contexto, no se puede verificar sincronización')
    }
  }

  const forceRefresh = () => {
    addLog('🔄 Forzando recarga...')
    window.location.reload()
  }

  useEffect(() => {
    if (initialized) {
      analyzeSession()
      analyzeStorage()
    }
  }, [initialized])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🔧 Debug de Sesión - Oeste Pan
          </h1>

          {/* Estado actual */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900">Estado Contexto</h3>
              <p className="text-sm">Usuario: {user?.email || 'Ninguno'}</p>
              <p className="text-sm">Perfil: {profile?.role || 'Ninguno'}</p>
              <p className="text-sm">Loading: {loading ? 'Sí' : 'No'}</p>
              <p className="text-sm">Inicializado: {initialized ? 'Sí' : 'No'}</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900">Storage</h3>
              <p className="text-sm">LocalStorage: {storageInfo?.localStorage?.length || 0} keys</p>
              <p className="text-sm">SessionStorage: {storageInfo?.sessionStorage?.length || 0} keys</p>
              <p className="text-sm">Cookies: {storageInfo?.cookies?.length || 0} items</p>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-semibold text-yellow-900">Sesión Supabase</h3>
              <p className="text-sm">Usuario: {sessionInfo?.user?.email || 'Ninguno'}</p>
              <p className="text-sm">Error: {sessionInfo?.sessionError?.message || sessionInfo?.userError?.message || 'Ninguno'}</p>
            </div>
          </div>

          {/* Acciones principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <Button onClick={analyzeSession} className="bg-blue-600 hover:bg-blue-700">
              🔍 Analizar Sesión
            </Button>
            <Button onClick={analyzeStorage} className="bg-green-600 hover:bg-green-700">
              💾 Analizar Storage
            </Button>
            <Button onClick={clearSpecificStorage} className="bg-red-600 hover:bg-red-700">
              🧹 Limpiar Todo
            </Button>
            <Button onClick={forceRefresh} className="bg-gray-600 hover:bg-gray-700">
              🔄 Recargar Página
            </Button>
          </div>

          {/* Herramienta específica para tu problema */}
          {user && user.email && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-yellow-900 mb-2">
                ⚠️ Problema Detectado: Desconexión Contexto-Supabase
              </h3>
              <p className="text-yellow-800 text-sm mb-3">
                Tu contexto dice que estás logueado como <strong>{user.email}</strong>, 
                pero Supabase no reconoce la sesión. Esto indica un token corrupto.
              </p>
              <Button 
                onClick={fixSyncIssue} 
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                🔧 Arreglar Desconexión Automáticamente
              </Button>
            </div>
          )}

          {/* Herramientas adicionales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Button 
              onClick={() => diagnosticSessionInfo()} 
              variant="outline"
              className="border-blue-300"
            >
              🔍 Log Diagnóstico
            </Button>
            <Button 
              onClick={() => {
                if (confirm('¿Forzar logout completo?')) {
                  forceLogout()
                }
              }} 
              variant="outline"
              className="border-red-300"
            >
              🚪 Force Logout
            </Button>
            <Button 
              onClick={() => window.open('/login', '_blank')} 
              variant="outline"
              className="border-green-300"
            >
              🔗 Abrir Login
            </Button>
          </div>

          {/* Logs */}
          <div className="bg-gray-100 p-4 rounded-lg mb-6">
            <h3 className="font-semibold mb-2">📝 Logs de Debug</h3>
            <div className="max-h-64 overflow-y-auto text-sm font-mono">
              {logs.map((log, index) => (
                <div key={index} className="py-1 border-b border-gray-200">
                  {log}
                </div>
              ))}
            </div>
            <Button 
              onClick={() => setLogs([])} 
              variant="outline" 
              size="sm" 
              className="mt-2"
            >
              🗑️ Limpiar Logs
            </Button>
          </div>

          {/* Información detallada */}
          {sessionInfo && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="font-semibold mb-2">📊 Información Detallada de Sesión</h3>
              <pre className="text-xs overflow-x-auto">
                {JSON.stringify(sessionInfo, null, 2)}
              </pre>
            </div>
          )}

          {storageInfo && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">💾 Información Detallada de Storage</h3>
              <pre className="text-xs overflow-x-auto">
                {JSON.stringify(storageInfo, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 