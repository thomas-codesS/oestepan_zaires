'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const supabase = createClient()
        
        // Obtener el hash de la URL para manejar el token de confirmación
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        const type = hashParams.get('type')

        console.log('🔐 Callback de autenticación:', { type, hasAccessToken: !!accessToken })

        if (type === 'signup' && accessToken && refreshToken) {
          // Establecer la sesión con los tokens recibidos
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })

          if (sessionError) {
            console.error('Error al establecer sesión:', sessionError)
            setError('Error al confirmar tu cuenta. Por favor, intenta de nuevo.')
            setLoading(false)
            return
          }

          console.log('✅ Email confirmado exitosamente')
          
          // Redirigir al dashboard después de un breve delay
          setTimeout(() => {
            window.location.href = '/dashboard'
          }, 1000)
        } else if (type === 'recovery') {
          // Manejar recuperación de contraseña
          console.log('🔑 Proceso de recuperación de contraseña')
          router.push('/reset-password')
        } else {
          // Si no hay parámetros válidos, redirigir al login
          console.log('⚠️ No se encontraron parámetros válidos')
          setTimeout(() => {
            router.push('/login')
          }, 2000)
        }
      } catch (err) {
        console.error('Error en callback:', err)
        setError('Ocurrió un error inesperado. Por favor, intenta iniciar sesión.')
        setLoading(false)
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {loading && !error && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Confirmando tu cuenta...
            </h1>
            <p className="text-gray-600">
              Por favor espera mientras verificamos tu email.
            </p>
          </>
        )}

        {error && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Error de Confirmación
            </h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Ir al Login
            </button>
          </>
        )}
      </div>
    </div>
  )
}

