'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { forceLogout, diagnosticSessionInfo } from '@/lib/utils/clear-session'

export default function LoginPage() {
  const router = useRouter()
  const { signIn } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    console.log('🔐 INICIANDO LOGIN desde formulario...')
    console.log('📧 Email:', formData.email)

    try {
      console.log('📞 Llamando a signIn...')
      await signIn({
        email: formData.email,
        password: formData.password
      })
      
      console.log('✅ SignIn completado exitosamente')
      
      // Verificar que la sesión se guardó correctamente
      setTimeout(async () => {
        console.log('🔍 Verificando sesión después del login...')
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (session) {
          console.log('✅ Sesión verificada exitosamente:', session.user?.email)
          // La redirección se maneja automáticamente en el contexto de auth
        } else {
          console.error('❌ No se encontró sesión después del login')
          console.error('❌ Error de sesión:', error)
          setError('Error: La sesión no se guardó correctamente. Intenta de nuevo.')
        }
      }, 1000)
      
    } catch (err: any) {
      console.error('❌ Error en login:', err)
      setError(err.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            Oeste Pan
          </h1>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Iniciar Sesión
          </h2>
          <p className="mt-2 text-gray-600">
            Accede a tu cuenta para gestionar pedidos
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 border border-orange-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="tu@email.com"
              className="border-orange-200 focus:border-orange-400 focus:ring-orange-200"
            />

            <Input
              label="Contraseña"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              placeholder="••••••••"
              className="border-orange-200 focus:border-orange-400 focus:ring-orange-200"
            />

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 text-lg font-semibold transition-colors duration-200"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-4">
            <div>
              <Link href="/forgot-password" className="text-orange-600 hover:text-orange-700 font-semibold">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <p className="text-gray-600">
              ¿No tienes cuenta?{' '}
              <Link href="/register" className="text-orange-600 hover:text-orange-700 font-semibold">
                Regístrate aquí
              </Link>
            </p>
          </div>

          {/* Herramientas de solución de problemas */}
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-900 mb-2">¿Problemas para iniciar sesión?</h3>
            <p className="text-red-700 text-sm mb-3">
              Si tienes problemas con sesiones que no se cierran o no puedes iniciar sesión, usa estas herramientas:
            </p>
            <div className="space-y-2">
              <Button
                type="button"
                onClick={() => diagnosticSessionInfo()}
                variant="outline"
                className="w-full text-sm border-red-300 text-red-700 hover:bg-red-100"
              >
                🔍 Diagnosticar Sesión (ver consola)
              </Button>
              <Button
                type="button"
                onClick={() => {
                  if (confirm('¿Estás seguro? Esto limpiará todas las cookies y recargará la página.')) {
                    forceLogout()
                  }
                }}
                variant="outline"
                className="w-full text-sm border-red-400 text-red-800 hover:bg-red-100"
              >
                🧹 Limpiar Sesión Completamente
              </Button>
            </div>
          </div>

         
        </div>

        <div className="text-center space-y-2">
          <Link href="/" className="text-orange-600 hover:text-orange-700 block">
            ← Volver al inicio
          </Link>
          <div className="flex flex-col space-y-1">
            <Link href="/debug-login" className="text-purple-600 hover:text-purple-700 block text-sm">
              🚀 Diagnóstico de Login Paso a Paso
            </Link>
            <Link href="/debug-session" className="text-blue-600 hover:text-blue-700 block text-sm">
              🔧 Debug de Sesión Avanzado
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 