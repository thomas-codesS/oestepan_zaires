'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function ProfilePage() {
  const router = useRouter()
  const { user, profile, loading: authLoading, updateProfile } = useAuth()
  
  const [formData, setFormData] = useState({
    full_name: '',
    company_name: '',
    delivery_days: [] as number[]
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // Cargar datos del perfil
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        company_name: profile.company_name || '',
        delivery_days: profile.delivery_days || []
      })
    }
  }, [profile])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleDeliveryDayChange = (day: number) => {
    setFormData(prev => ({
      ...prev,
      delivery_days: prev.delivery_days.includes(day)
        ? prev.delivery_days.filter(d => d !== day)
        : [...prev.delivery_days, day].sort()
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      await updateProfile({
        full_name: formData.full_name || undefined,
        company_name: formData.company_name || undefined,
        delivery_days: formData.delivery_days.length > 0 ? formData.delivery_days : undefined
      })
      
      setSuccess('Perfil actualizado correctamente')
    } catch (err: any) {
      setError(err.message || 'Error al actualizar el perfil')
    } finally {
      setLoading(false)
    }
  }

  const deliveryDayOptions = [
    { value: 1, label: 'Lunes' },
    { value: 2, label: 'Martes' },
    { value: 3, label: 'Miércoles' },
    { value: 4, label: 'Jueves' },
    { value: 5, label: 'Viernes' },
    { value: 6, label: 'Sábado' },
    { value: 7, label: 'Domingo' }
  ]

  // Mostrar loading mientras se autentica
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-orange-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                Mi Perfil
              </h1>
              <p className="text-gray-600 mt-2">
                Edita tu información personal y preferencias
              </p>
            </div>
            <Link href="/dashboard">
              <Button variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-50">
                ← Volver al Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Información actual */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-orange-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="text-orange-500 mr-2">👤</span>
            Información Actual
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Información de cuenta</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-semibold">{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rol:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    profile?.role === 'admin' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {profile?.role === 'admin' ? 'Administrador' : 'Cliente'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estado:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    profile?.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {profile?.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Información personal</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Nombre:</span>
                  <span>{profile?.full_name || 'No especificado'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Empresa:</span>
                  <span>{profile?.company_name || 'No especificada'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Días de entrega:</span>
                  <span>
                    {profile?.delivery_days && profile.delivery_days.length > 0 
                      ? profile.delivery_days.map(day => deliveryDayOptions.find(d => d.value === day)?.label).join(', ')
                      : 'No especificados'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario de edición */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-orange-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="text-orange-500 mr-2">✏️</span>
            Editar Información
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-600 text-sm">{success}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Nombre Completo"
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                placeholder="Tu nombre completo"
                className="border-orange-200 focus:border-orange-400 focus:ring-orange-200"
              />

              <Input
                label="Empresa (opcional)"
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleInputChange}
                placeholder="Nombre de tu empresa"
                className="border-orange-200 focus:border-orange-400 focus:ring-orange-200"
              />
            </div>

            {/* Días de entrega */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Días de entrega preferidos (opcional)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {deliveryDayOptions.map((day) => (
                  <label
                    key={day.value}
                    className="flex items-center p-3 border border-orange-200 rounded-lg cursor-pointer hover:bg-orange-50"
                  >
                    <input
                      type="checkbox"
                      checked={formData.delivery_days.includes(day.value)}
                      onChange={() => handleDeliveryDayChange(day.value)}
                      className="mr-2 text-orange-600"
                    />
                    <span className="text-sm font-medium text-gray-700">{day.label}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Selecciona los días que prefieres para recibir entregas
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
              <Button
                type="submit"
                disabled={loading}
                className="bg-orange-600 hover:bg-orange-700 text-white transition-colors duration-200"
              >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
              
              <Link href="/dashboard">
                <Button 
                  type="button" 
                  variant="outline"
                  className="border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                  Cancelar
                </Button>
              </Link>
            </div>
          </form>
        </div>

        {/* Información adicional */}
        <div className="mt-8 bg-blue-50 rounded-xl shadow-lg p-6 border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
            <span className="mr-2">ℹ️</span>
            Información Importante
          </h3>
          <ul className="text-blue-800 space-y-1 text-sm">
            <li>• Tu email no se puede cambiar desde aquí</li>
            <li>• Los días de entrega son solo una preferencia, no garantizan disponibilidad</li>
            <li>• Para cambios importantes contacta al administrador</li>
            <li>• Los cambios se guardan inmediatamente</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 