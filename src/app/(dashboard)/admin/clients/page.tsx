'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import {
  Users,
  Search,
  ArrowLeft,
  Filter,
  Calendar,
  Building,
  Mail,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Save,
  X,
  Edit3,
  Shield,
} from 'lucide-react'

const DELIVERY_DAY_OPTIONS = [
  { value: 1, label: 'Lunes', short: 'Lu' },
  { value: 2, label: 'Martes', short: 'Ma' },
  { value: 3, label: 'Miércoles', short: 'Mi' },
  { value: 4, label: 'Jueves', short: 'Ju' },
  { value: 5, label: 'Viernes', short: 'Vi' },
  { value: 6, label: 'Sábado', short: 'Sa' },
  { value: 0, label: 'Domingo', short: 'Do' },
]

function getDayLabel(day: number): string {
  return DELIVERY_DAY_OPTIONS.find(d => d.value === day)?.label || `Día ${day}`
}

function getDayShort(day: number): string {
  return DELIVERY_DAY_OPTIONS.find(d => d.value === day)?.short || `${day}`
}

interface ClientProfile {
  id: string
  email: string
  full_name: string | null
  role: 'cliente' | 'admin'
  company_name: string | null
  razon_social: string | null
  delivery_days: number[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function AdminClientsPage() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()

  const [clients, setClients] = useState<ClientProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [deliveryFilter, setDeliveryFilter] = useState('')

  // Estado de edición
  const [editingClientId, setEditingClientId] = useState<string | null>(null)
  const [editDeliveryDays, setEditDeliveryDays] = useState<number[]>([])
  const [saving, setSaving] = useState(false)

  // Redirigir si no está autenticado o no es admin
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login')
      } else if (profile?.role !== 'admin') {
        router.push('/dashboard')
      }
    }
  }, [user, profile, authLoading, router])

  // Cargar clientes
  const loadClients = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (searchTerm) params.set('search', searchTerm)
      if (roleFilter) params.set('role', roleFilter)
      if (deliveryFilter) params.set('hasDeliveryDays', deliveryFilter)

      const response = await fetch(`/api/admin/clients?${params}`)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al cargar clientes')
      }

      const data = await response.json()
      setClients(data.clients || [])
    } catch (err) {
      console.error('Error loading clients:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar clientes')
    } finally {
      setLoading(false)
    }
  }, [searchTerm, roleFilter, deliveryFilter])

  useEffect(() => {
    if (user && profile?.role === 'admin') {
      loadClients()
    }
  }, [user, profile, loadClients])

  // Iniciar edición de días de entrega
  const startEditing = (client: ClientProfile) => {
    setEditingClientId(client.id)
    setEditDeliveryDays([...(client.delivery_days || [])])
    setSuccessMessage(null)
  }

  // Cancelar edición
  const cancelEditing = () => {
    setEditingClientId(null)
    setEditDeliveryDays([])
  }

  // Toggle día de entrega
  const toggleDeliveryDay = (day: number) => {
    setEditDeliveryDays((prev: number[]) =>
      prev.includes(day)
        ? prev.filter((d: number) => d !== day)
        : [...prev, day].sort((a: number, b: number) => {
            // Ordenar: Lu=1, Ma=2, ..., Sa=6, Do=0
            const order = [1, 2, 3, 4, 5, 6, 0]
            return order.indexOf(a) - order.indexOf(b)
          })
    )
  }

  // Guardar días de entrega
  const saveDeliveryDays = async (clientId: string) => {
    try {
      setSaving(true)
      setError(null)

      const response = await fetch(`/api/admin/clients/${clientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delivery_days: editDeliveryDays }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al guardar')
      }

      // Actualizar la lista local
      setClients((prev: ClientProfile[]) =>
        prev.map((c: ClientProfile) =>
          c.id === clientId ? { ...c, delivery_days: editDeliveryDays } : c
        )
      )

      setEditingClientId(null)
      setEditDeliveryDays([])
      setSuccessMessage('Días de entrega actualizados correctamente')

      // Limpiar mensaje de éxito después de 3 seg
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      console.error('Error saving delivery days:', err)
      setError(err instanceof Error ? err.message : 'Error al guardar días de entrega')
    } finally {
      setSaving(false)
    }
  }

  // Toggle estado activo/inactivo
  const toggleActiveStatus = async (clientId: string, currentActive: boolean) => {
    try {
      setError(null)

      const response = await fetch(`/api/admin/clients/${clientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentActive }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al actualizar estado')
      }

      setClients((prev: ClientProfile[]) =>
        prev.map((c: ClientProfile) =>
          c.id === clientId ? { ...c, is_active: !currentActive } : c
        )
      )

      setSuccessMessage(
        `Cliente ${!currentActive ? 'activado' : 'desactivado'} correctamente`
      )
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      console.error('Error toggling active status:', err)
      setError(err instanceof Error ? err.message : 'Error al cambiar estado')
    }
  }

  // Estadísticas rápidas
  const totalClients = clients.filter((c: ClientProfile) => c.role === 'cliente').length
  const withDeliveryDays = clients.filter(
    (c: ClientProfile) => c.role === 'cliente' && c.delivery_days && c.delivery_days.length > 0
  ).length
  const withoutDeliveryDays = clients.filter(
    (c: ClientProfile) => c.role === 'cliente' && (!c.delivery_days || c.delivery_days.length === 0)
  ).length
  const activeClients = clients.filter((c: ClientProfile) => c.role === 'cliente' && c.is_active).length

  const roleOptions = [
    { value: '', label: 'Todos los roles' },
    { value: 'cliente', label: 'Clientes' },
    { value: 'admin', label: 'Administradores' },
  ]

  const deliveryOptions = [
    { value: '', label: 'Todos' },
    { value: 'true', label: 'Con días asignados' },
    { value: 'false', label: 'Sin días asignados' },
  ]

  // Loading/Auth
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando clientes...</p>
        </div>
      </div>
    )
  }

  if (!user || profile?.role !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
              <Link href="/admin/dashboard">
                <Button variant="outline" className="w-full sm:w-auto border-orange-300 text-orange-600 hover:bg-orange-50">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver al Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  Gestión de Clientes
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  Administra los días de entrega y datos de cada cliente
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mensajes */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center">
            <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
            <p className="text-green-700">{successMessage}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Clientes</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{totalClients}</p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Con Días</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">{withDeliveryDays}</p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-green-100 rounded-full flex items-center justify-center">
                <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Sin Días</p>
                <p className="text-xl sm:text-2xl font-bold text-red-600">{withoutDeliveryDays}</p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Activos</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{activeClients}</p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-orange-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-8 border border-orange-100">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
            <Filter className="h-5 w-5 text-orange-500 mr-2" />
            Filtros
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Email, nombre o empresa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-orange-200 focus:border-orange-400 focus:ring-orange-200"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rol
              </label>
              <Select
                options={roleOptions}
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="border-orange-200 focus:border-orange-400 focus:ring-orange-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Días de entrega
              </label>
              <Select
                options={deliveryOptions}
                value={deliveryFilter}
                onChange={(e) => setDeliveryFilter(e.target.value)}
                className="border-orange-200 focus:border-orange-400 focus:ring-orange-200"
              />
            </div>
          </div>
        </div>

        {/* Lista de clientes */}
        <div className="bg-white rounded-xl shadow-lg border border-orange-100 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Clientes ({clients.length})
            </h3>
          </div>

          {clients.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay clientes</h3>
              <p className="text-gray-600">
                No se encontraron clientes con los filtros aplicados.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {clients.map((client) => (
                <div
                  key={client.id}
                  className={`p-4 sm:p-6 transition-colors ${
                    editingClientId === client.id ? 'bg-orange-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    {/* Info del cliente */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h4 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                          {client.full_name || 'Sin nombre'}
                        </h4>
                        {/* Badge de rol */}
                        <span
                          className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                            client.role === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {client.role === 'admin' ? (
                            <>
                              <Shield className="w-3 h-3 mr-1" />
                              Admin
                            </>
                          ) : (
                            'Cliente'
                          )}
                        </span>
                        {/* Badge activo/inactivo */}
                        <span
                          className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                            client.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {client.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>

                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{client.email}</span>
                        </div>
                        {client.company_name && (
                          <div className="flex items-center gap-1">
                            <Building className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate">{client.company_name}</span>
                          </div>
                        )}
                        {client.razon_social && (
                          <div className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate">RS: {client.razon_social}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Días de entrega */}
                    <div className="flex-shrink-0 w-full lg:w-auto">
                      {editingClientId === client.id ? (
                        /* Modo edición */
                        <div className="bg-white border-2 border-orange-300 rounded-xl p-4 shadow-sm">
                          <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                            <Calendar className="w-4 h-4 mr-1 text-orange-500" />
                            Días de Entrega
                          </h5>
                          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-4">
                            {DELIVERY_DAY_OPTIONS.map((day) => (
                              <button
                                key={day.value}
                                type="button"
                                onClick={() => toggleDeliveryDay(day.value)}
                                className={`flex flex-col items-center justify-center p-2 rounded-lg border-2 text-xs font-medium transition-all ${
                                  editDeliveryDays.includes(day.value)
                                    ? 'bg-orange-600 border-orange-600 text-white shadow-md'
                                    : 'bg-white border-gray-200 text-gray-600 hover:border-orange-300 hover:bg-orange-50'
                                }`}
                              >
                                <span className="text-xs font-bold">{day.short}</span>
                                <span className="text-[10px] mt-0.5 hidden sm:block">{day.label}</span>
                              </button>
                            ))}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => saveDeliveryDays(client.id)}
                              disabled={saving}
                              className="bg-orange-600 hover:bg-orange-700 text-white"
                            >
                              <Save className="w-4 h-4 mr-1" />
                              {saving ? 'Guardando...' : 'Guardar'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={cancelEditing}
                              disabled={saving}
                              className="border-gray-300 text-gray-600"
                            >
                              <X className="w-4 h-4 mr-1" />
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        /* Modo visualización */
                        <div className="flex flex-col items-start lg:items-end gap-2">
                          <div className="flex flex-wrap gap-1">
                            {client.delivery_days && client.delivery_days.length > 0 ? (
                              client.delivery_days
                                .sort((a, b) => {
                                  const order = [1, 2, 3, 4, 5, 6, 0]
                                  return order.indexOf(a) - order.indexOf(b)
                                })
                                .map(day => (
                                  <span
                                    key={day}
                                    className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-orange-100 text-orange-800"
                                  >
                                    {getDayLabel(day)}
                                  </span>
                                ))
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-red-100 text-red-700">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Sin días asignados
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startEditing(client)}
                              className="border-orange-300 text-orange-600 hover:bg-orange-50 text-xs"
                            >
                              <Edit3 className="w-3.5 h-3.5 mr-1" />
                              Editar Días
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleActiveStatus(client.id, client.is_active)}
                              className={`text-xs ${
                                client.is_active
                                  ? 'border-red-300 text-red-600 hover:bg-red-50'
                                  : 'border-green-300 text-green-600 hover:bg-green-50'
                              }`}
                            >
                              {client.is_active ? (
                                <>
                                  <XCircle className="w-3.5 h-3.5 mr-1" />
                                  Desactivar
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-3.5 h-3.5 mr-1" />
                                  Activar
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
