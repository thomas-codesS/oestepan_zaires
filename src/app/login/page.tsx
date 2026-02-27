'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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

    try {
      await signIn({
        email: formData.email,
        password: formData.password
      })
      // Auth context handles state; redirect via router (no full page reload)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            Oeste Pan
          </h1>
          <h2 className="mt-4 sm:mt-6 text-2xl sm:text-3xl font-bold text-gray-900">
            Iniciar Sesión
          </h2>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            Accede a tu cuenta para gestionar pedidos
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-orange-100">
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
              className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2.5 sm:py-3 text-base sm:text-lg font-semibold transition-colors duration-200"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>

          <div className="mt-4 sm:mt-6 text-center space-y-3 sm:space-y-4">
            <div>
              <Link href="/forgot-password" className="text-sm sm:text-base text-orange-600 hover:text-orange-700 font-semibold">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <p className="text-sm sm:text-base text-gray-600">
              ¿No tienes cuenta?{' '}
              <Link href="/register" className="text-orange-600 hover:text-orange-700 font-semibold">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center">
          <Link href="/" className="text-orange-600 hover:text-orange-700">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
