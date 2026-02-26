'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Users, Search, Save, X, ChevronLeft, Check } from 'lucide-react'

const DAY_LABELS: Record<number, string> = {
  0: 'Dom',
  1: 'Lun',
  2: 'Mar',
  3: 'Mié',
  4: 'Jue',
  5: 'Vie',
  6: 'Sáb',
}

const DAY_FULL_LABELS: Record<number, string> = {
  0: 'Domingo',
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
}

interface ClientProfile {
  id: string
  email: string
  full_name: string | null
  company_name: string | null
  razon_social: string | null
  delivery_days: number[]
  is_active: boolean
  created_at: string
}

export default function AdminClientsPage() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()

  const [clients, setClients] = useState<ClientProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Estado para edición de días
  const [editingClientId, setEditingClientId] = useState<string | null>(null)
  const [editingDays, setEditingDays] = useState<number[]>([])
  const [saving, setSaving] = useState(false)

  // Redirigir si no es admin
  useEffect(() => {
    if (!authLoading && (!user || profile?.role !== 'admin')) {
      router.push('/dashboard')
    }
  }, [user, profile, authLoading, router])

  // Cargar clientes
  useEffect(() => {
    if (user && profile?.role === 'admin') {
      loadClients()
    }
  }, [user, profile])

  const loadClients = async (searchTerm?: string) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (searchTerm) params.set('search', searchTerm)

      const response = await fetch(`/api/admin/clients?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Error al cargar clientes')
      }

      const data = await response.json()
      setClients(data.clients)
    } catch (err) {
      console.error('Error loading clients:', err)
      setError('Error al cargar la lista de clientes')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    loadClients(search)
  }

  const startEditing = (client: ClientProfile) => {
    setEditingClientId(client.id)
    setEditingDays([...(client.delivery_days || [])])
    setSuccessMessage(null)
  }

  const cancelEditing = () => {
    setEditingClientId(null)
    setEditingDays([])
  }

  const toggleDay = (day: number) => {
    setEditingDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort((a, b) => a - b)
    )
  }

  const saveDeliveryDays = async (clientId: string) => {
    try {
      setSaving(true)
      setError(null)

      const response = await fetch(`/api/admin/clients/${clientId}/delivery-days`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delivery_days: editingDays }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al guardar')
      }

      // Actualizar lista local
      setClients(prev =>
        prev.map(c => (c.id === clientId ? { ...c, delivery_days: [...editingDays] } : c))
      )

      const client = clients.find(c => c.id === clientId)
      const clientName = client?.company_name || client?.full_name || client?.email
      setSuccessMessage(`Días de entrega actualizados para ${clientName}`)
      setEditingClientId(null)
      setEditingDays([])

      // Limpiar mensaje después de 4 segundos
      setTimeout(() => setSuccessMessage(null), 4000)
    } catch (err) {
      console.error('Error saving delivery days:', err)
      setError(err instanceof Error ? err.message : 'Error al guardar los días de entrega')
    } finally {
      setSaving(false)
    }
  }

  const formatDeliveryDays = (days: number[]) => {
    if (!days || days.length === 0) {
      return <span className="text-red-500 text-sm font-medium">Sin días configurados</span>
    }
    return days.map(d => DAY_LABELS[d] || `${d}`).join(', ')
  }

  if (authLoading || (!user || profile?.role !== 'admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent flex items-center">
                <Users className="w-7 h-7 mr-2 text-orange-600" />
                Gestión de Clientes
              </h1>
              <p className="text-gray-600 mt-1">
                Administra los días de entrega de cada cliente
              </p>
            </div>
            <Link href="/admin/dashboard">
              <Button variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-50">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Volver al Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mensajes */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center">
            <Check className="w-5 h-5 text-green-600 mr-2 flex-shrink-0" />
            <p className="text-green-700 text-sm">{successMessage}</p>
          </div>
        )}

        {/* Barra de búsqueda */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-orange-100 mb-6">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar por nombre, empresa o email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10 border-orange-200 focus:border-orange-400 focus:ring-orange-200"
              />
            </div>
            <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white">
              <Search className="w-4 h-4 mr-2" />
              Buscar
            </Button>
            {search && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSearch('')
                  loadClients()
                }}
                className="border-gray-300"
              >
                Limpiar
              </Button>
            )}
          </form>
        </div>

        {/* Leyenda de referencia */}
        <div className="bg-white rounded-xl shadow-lg p-4 border border-orange-100 mb-6">
          <p className="text-sm text-gray-600 mb-2 font-medium">Referencia de días:</p>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5, 6, 0].map(day => (
              <span key={day} className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700">
                {DAY_FULL_LABELS[day]}
              </span>
            ))}
          </div>
        </div>

        {/* Lista de clientes */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600"></div>
          </div>
        ) : clients.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 border border-orange-100 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No se encontraron clientes</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Header de tabla para desktop */}
            <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <div className="col-span-3">Cliente</div>
              <div className="col-span-3">Email</div>
              <div className="col-span-4">Días de Entrega</div>
              <div className="col-span-2 text-right">Acciones</div>
            </div>

            {clients.map(client => (
              <div
                key={client.id}
                className={`bg-white rounded-xl shadow-lg border p-4 sm:p-6 transition-colors ${
                  editingClientId === client.id
                    ? 'border-orange-400 ring-2 ring-orange-200'
                    : 'border-orange-100 hover:border-orange-200'
                } ${!client.is_active ? 'opacity-60' : ''}`}
              >
                {editingClientId === client.id ? (
                  /* Modo edición */
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-gray-900">
                          {client.company_name || client.full_name || 'Sin nombre'}
                        </h3>
                        <p className="text-sm text-gray-500">{client.email}</p>
                      </div>
                      <span className="text-sm text-orange-600 font-medium">Editando días de entrega</span>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-3">
                        Selecciona los días de entrega:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {[1, 2, 3, 4, 5, 6, 0].map(day => (
                          <button
                            key={day}
                            type="button"
                            onClick={() => toggleDay(day)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                              editingDays.includes(day)
                                ? 'bg-orange-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {DAY_FULL_LABELS[day]}
                          </button>
                        ))}
                      </div>
                      {editingDays.length === 0 && (
                        <p className="text-xs text-amber-600 mt-2">
                          Sin días seleccionados: el cliente no podrá realizar pedidos
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={cancelEditing}
                        disabled={saving}
                        className="border-gray-300"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Cancelar
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => saveDeliveryDays(client.id)}
                        disabled={saving}
                        className="bg-orange-600 hover:bg-orange-700 text-white"
                      >
                        {saving ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Guardando...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-1" />
                            Guardar
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* Modo visualización */
                  <div className="lg:grid lg:grid-cols-12 lg:gap-4 lg:items-center space-y-3 lg:space-y-0">
                    <div className="col-span-3">
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                        {client.company_name || client.full_name || 'Sin nombre'}
                      </h3>
                      {client.company_name && client.full_name && (
                        <p className="text-xs text-gray-500">{client.full_name}</p>
                      )}
                      {!client.is_active && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                          Inactivo
                        </span>
                      )}
                    </div>

                    <div className="col-span-3">
                      <p className="text-sm text-gray-600 break-all">{client.email}</p>
                    </div>

                    <div className="col-span-4">
                      <div className="flex flex-wrap gap-1.5">
                        {client.delivery_days && client.delivery_days.length > 0 ? (
                          client.delivery_days.map(day => (
                            <span
                              key={day}
                              className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full"
                            >
                              {DAY_LABELS[day]}
                            </span>
                          ))
                        ) : (
                          <span className="text-red-500 text-sm font-medium">Sin días configurados</span>
                        )}
                      </div>
                    </div>

                    <div className="col-span-2 flex justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEditing(client)}
                        className="border-orange-300 text-orange-600 hover:bg-orange-50"
                      >
                        Editar Días
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Contador */}
        {!loading && clients.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-500">
            {clients.length} cliente{clients.length !== 1 ? 's' : ''} encontrado
            {clients.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  )
}
