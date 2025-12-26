'use client'

import React, { useState } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Package, ShoppingCart, User, BarChart3, Plus, Eye, LogOut } from 'lucide-react'

export default function DashboardPage() {
  const { user, profile, signOut, isAdmin } = useAuth()
  const [signingOut, setSigningOut] = useState(false)

  const handleSignOut = async () => {
    if (signingOut) return // Prevenir múltiples clics
    
    try {
      setSigningOut(true)
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
      setSigningOut(false) // Resetear solo si hay error
    }
  }

  if (!user) {
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
      {/* Header con gradiente y mejores sombras */}
      <header className="bg-white shadow-lg border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                Dashboard Principal
              </h1>
              <p className="text-gray-600 mt-1 sm:mt-2 text-base sm:text-lg">
                Bienvenido de nuevo, <span className="font-semibold text-gray-900">{profile?.full_name || user.email}</span>
              </p>
            </div>
            <div className="flex items-center justify-end space-x-3 sm:space-x-4">
              {isAdmin() && (
                <Link href="/admin/dashboard">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-orange-300 text-orange-600 hover:bg-orange-50 transition-colors duration-200"
                  >
                    <BarChart3 className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Panel Admin</span>
                    <span className="sm:hidden">Admin</span>
                  </Button>
                </Link>
              )}
              <Button 
                onClick={handleSignOut} 
                variant="outline"
                size="sm"
                disabled={signingOut}
                className="border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
              >
                {signingOut ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 sm:mr-2"></div>
                    <span className="hidden sm:inline">Cerrando...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Cerrar Sesión</span>
                    <span className="sm:hidden">Salir</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content con mejor espaciado */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tarjetas principales con iconos y mejor jerarquía visual */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Información del perfil mejorada */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <User className="w-5 h-5 mr-2 text-orange-500" />
                Mi Perfil
              </h2>
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                <span className="text-gray-600 font-medium text-sm">Email:</span>
                <span className="text-gray-900 font-semibold text-sm break-all">{user.email}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                <span className="text-gray-600 font-medium text-sm">Nombre:</span>
                <span className="text-gray-900 font-semibold text-sm">{profile?.full_name || 'No especificado'}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                <span className="text-gray-600 font-medium text-sm">Empresa:</span>
                <span className="text-gray-900 font-semibold text-sm break-words">{profile?.company_name || 'No especificada'}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0 items-start sm:items-center">
                <span className="text-gray-600 font-medium text-sm">Rol:</span>
                <span className={`font-semibold text-sm px-2 py-1 rounded-full ${
                  profile?.role === 'admin'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {profile?.role === 'admin' ? 'Administrador' : 'Cliente'}
                </span>
              </div>
            </div>
            <Link href="/profile" className="inline-block mt-6 w-full">
              <Button 
                size="sm" 
                className="w-full bg-orange-600 hover:bg-orange-700 text-white transition-colors duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Editar Perfil
              </Button>
            </Link>
          </div>

          {/* Catálogo de productos mejorado */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Package className="w-5 h-5 mr-2 text-orange-500" />
                Catálogo
              </h2>
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Package className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed text-sm sm:text-base">
              Explora nuestros productos frescos de panadería y pastelería
            </p>
            <Link href="/catalog">
              <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white transition-colors duration-200">
                <Eye className="w-4 h-4 mr-2" />
                Ver Catálogo
              </Button>
            </Link>
          </div>

          {/* Mis pedidos mejorado */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2 text-orange-500" />
                Mis Pedidos
              </h2>
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed text-sm sm:text-base">
              Revisa el historial y estado de todos tus pedidos
            </p>
            <Link href="/orders">
              <Button 
                className="w-full border-orange-300 text-orange-600 hover:bg-orange-50 transition-colors duration-200" 
                variant="outline"
              >
                <Eye className="w-4 h-4 mr-2" />
                Ver Pedidos
              </Button>
            </Link>
          </div>
        </div>

        {/* Información adicional mejorada para clientes */}
        {!isAdmin() && (
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl shadow-lg p-8 mb-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-orange-900 mb-3">
                ¡Bienvenido a Oeste Pan!
              </h3>
              <p className="text-orange-800 mb-6 max-w-2xl mx-auto leading-relaxed">
                Como cliente, puedes explorar nuestro catálogo de productos frescos, realizar pedidos personalizados
                y gestionar tu perfil. Nuestro equipo está siempre disponible para atenderte.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/catalog">
                  <Button 
                    size="lg"
                    className="bg-orange-600 hover:bg-orange-700 text-white transition-colors duration-200"
                  >
                    <Package className="w-5 h-5 mr-2" />
                    Explorar Catálogo
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="border-orange-300 text-orange-600 hover:bg-orange-50 transition-colors duration-200"
                  >
                    Contactános
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Información mejorada para administradores */}
        {isAdmin() && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-lg p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-blue-900 mb-3">
                Panel de Administración
              </h3>
              <p className="text-blue-800 mb-6 max-w-2xl mx-auto leading-relaxed">
                Como administrador, tienes acceso completo al sistema de gestión: productos, pedidos, 
                clientes y métricas de ventas.
              </p>
              <Link href="/admin/dashboard">
                <Button 
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
                >
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Ir al Panel Admin
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
} 