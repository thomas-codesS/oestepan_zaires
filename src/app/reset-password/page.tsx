'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Lock, CheckCircle, AlertCircle } from 'lucide-react'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [validSession, setValidSession] = useState<boolean | null>(null)

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient()
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error || !session) {
        console.error('No valid session for password reset:', error)
        setValidSession(false)
        return
      }

      // Verificar si la sesión es de un reset de contraseña
      const accessToken = searchParams.get('access_token')
      const refreshToken = searchParams.get('refresh_token')
      
      if (accessToken && refreshToken) {
        // Establecer la sesión con los tokens de la URL
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        })
        
        if (sessionError) {
          console.error('Error setting session:', sessionError)
          setValidSession(false)
          return
        }
      }
      
      setValidSession(true)
    }

    checkSession()
  }, [searchParams])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validaciones
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      setLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        password: formData.password
      })

      if (error) {
        throw new Error(error.message)
      }

      setSuccess(true)
      
      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        router.push('/login')
      }, 3000)
      
    } catch (err: any) {
      console.error('Error updating password:', err)
      setError(err.message || 'Error al actualizar la contraseña')
    } finally {
      setLoading(false)
    }
  }

  // Mostrar loading mientras verificamos la sesión
  if (validSession === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando enlace...</p>
        </div>
      </div>
    )
  }

  // Mostrar error si no hay sesión válida
  if (validSession === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              Oeste Pan
            </h1>
            <div className="mt-6 flex justify-center">
              <AlertCircle className="h-16 w-16 text-red-500" />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">
              Enlace Inválido
            </h2>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 border border-orange-100">
            <div className="text-center space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">
                  El enlace de recuperación de contraseña ha expirado o es inválido.
                </p>
              </div>
              
              <p className="text-sm text-gray-600">
                Por favor, solicita un nuevo enlace de recuperación.
              </p>

              <div className="space-y-3 pt-4">
                <Link href="/forgot-password">
                  <Button className="w-full bg-orange-600 hover:bg-orange-700">
                    Solicitar Nuevo Enlace
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" className="w-full border-orange-300 text-orange-600 hover:bg-orange-50">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver al Login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Mostrar éxito
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              Oeste Pan
            </h1>
            <div className="mt-6 flex justify-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">
              Contraseña Actualizada
            </h2>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 border border-orange-100">
            <div className="text-center space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800">
                  Tu contraseña ha sido actualizada exitosamente.
                </p>
              </div>
              
              <p className="text-sm text-gray-600">
                Serás redirigido al login en unos segundos...
              </p>

              <div className="pt-4">
                <Link href="/login">
                  <Button className="w-full bg-orange-600 hover:bg-orange-700">
                    Ir al Login Ahora
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Formulario principal
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            Oeste Pan
          </h1>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Nueva Contraseña
          </h2>
          <p className="mt-2 text-gray-600">
            Ingresa tu nueva contraseña
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 border border-orange-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Nueva Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="••••••••"
                  className="pl-10 border-orange-200 focus:border-orange-400 focus:ring-orange-200"
                />
              </div>
              <p className="text-xs text-gray-500">Mínimo 6 caracteres</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  placeholder="••••••••"
                  className="pl-10 border-orange-200 focus:border-orange-400 focus:ring-orange-200"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || !formData.password.trim() || !formData.confirmPassword.trim()}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 text-lg font-semibold transition-colors duration-200"
            >
              {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-orange-600 hover:text-orange-700 font-semibold flex items-center justify-center">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Volver al Login
            </Link>
          </div>
        </div>

        <div className="text-center">
          <Link href="/" className="text-orange-600 hover:text-orange-700 block">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando...</p>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResetPasswordForm />
    </Suspense>
  )
}
