'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        throw new Error(error.message)
      }

      setSuccess(true)
    } catch (err: any) {
      console.error('Error sending reset email:', err)
      setError(err.message || 'Error al enviar el email de recuperación')
    } finally {
      setLoading(false)
    }
  }

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
              Email Enviado
            </h2>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 border border-orange-100">
            <div className="text-center space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800">
                  Se ha enviado un enlace de recuperación de contraseña a:
                </p>
                <p className="font-semibold text-green-900 mt-1">{email}</p>
              </div>
              
              <div className="text-sm text-gray-600 space-y-2">
                <p>Revisa tu bandeja de entrada y haz clic en el enlace para restablecer tu contraseña.</p>
                <p>Si no ves el email, revisa tu carpeta de spam.</p>
              </div>

              <div className="pt-4">
                <Link href="/login">
                  <Button className="w-full bg-orange-600 hover:bg-orange-700">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            Oeste Pan
          </h1>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Recuperar Contraseña
          </h2>
          <p className="mt-2 text-gray-600">
            Ingresa tu email para recibir un enlace de recuperación
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
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="tu@email.com"
                  className="pl-10 border-orange-200 focus:border-orange-400 focus:ring-orange-200"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 text-lg font-semibold transition-colors duration-200"
            >
              {loading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
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
