'use client'

import React from 'react'
import { LogOut, User } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/auth-context'
import { Button } from '@/components/ui/button'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, profile, signOut } = useAuth()
  const [signingOut, setSigningOut] = React.useState(false)

  const handleSignOut = async () => {
    if (signingOut) return // Prevenir múltiples clics
    
    try {
      setSigningOut(true)
      await signOut()
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      setSigningOut(false) // Resetear solo si hay error
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Mobile First */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-2">
            {/* Logo/Título */}
            <div className="flex items-center min-w-0 flex-shrink">
              <Link href={profile?.role === 'admin' ? '/admin/dashboard' : '/dashboard'}>
                <h1 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 hover:text-orange-600 cursor-pointer truncate">
                  🥖 <span className="hidden xs:inline">Oeste Pan</span>
                  <span className="hidden lg:inline text-sm"> {profile?.role === 'admin' ? '- Admin' : ''}</span>
                </h1>
              </Link>
            </div>

            {/* Navegación y acciones - Desktop */}
            <div className="hidden lg:flex items-center space-x-4">
              {/* Navegación específica por rol */}
              {profile?.role === 'admin' ? (
                <nav className="flex space-x-2">
                  <Link
                    href="/admin/dashboard"
                    className="text-gray-600 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/admin/products"
                    className="text-gray-600 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap"
                  >
                    Productos
                  </Link>
                  <Link
                    href="/admin/orders"
                    className="text-gray-600 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap"
                  >
                    Pedidos
                  </Link>
                  <Link
                    href="/admin/orders-by-day"
                    className="text-gray-600 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap"
                  >
                    Por Día
                  </Link>
                </nav>
              ) : (
                <nav className="flex space-x-2">
                  <Link
                    href="/catalog"
                    className="text-gray-600 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap"
                  >
                    Catálogo
                  </Link>
                  <Link
                    href="/orders"
                    className="text-gray-600 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap"
                  >
                    Mis Pedidos
                  </Link>
                </nav>
              )}

              {/* Información del usuario */}
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span className="max-w-[150px] truncate">{profile?.full_name || user?.email}</span>
                {profile?.role === 'admin' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    Admin
                  </span>
                )}
              </div>

              {/* Botón cerrar sesión */}
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                disabled={signingOut}
                className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 disabled:opacity-50 whitespace-nowrap"
              >
                {signingOut ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                    Cerrando...
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4 mr-2" />
                    Cerrar Sesión
                  </>
                )}
              </Button>
            </div>

            {/* Navegación Mobile */}
            <div className="flex lg:hidden items-center space-x-2">
              {/* Usuario mobile */}
              <div className="flex items-center space-x-1 text-xs text-gray-600">
                <User className="w-4 h-4 flex-shrink-0" />
                <span className="max-w-[80px] truncate">{profile?.full_name?.split(' ')[0] || 'Usuario'}</span>
              </div>

              {/* Botón cerrar sesión mobile */}
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                disabled={signingOut}
                className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 disabled:opacity-50 px-2 py-1"
              >
                {signingOut ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                ) : (
                  <LogOut className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Navegación Mobile - Barra inferior */}
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <div className="mx-auto max-w-7xl px-2">
            <nav className="flex justify-around py-2">
              {profile?.role === 'admin' ? (
                <>
                  <Link
                    href="/admin/dashboard"
                    className="text-gray-600 hover:text-orange-600 px-2 py-1 rounded-md text-xs font-medium transition-colors text-center"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/admin/products"
                    className="text-gray-600 hover:text-orange-600 px-2 py-1 rounded-md text-xs font-medium transition-colors text-center"
                  >
                    Productos
                  </Link>
                  <Link
                    href="/admin/orders"
                    className="text-gray-600 hover:text-orange-600 px-2 py-1 rounded-md text-xs font-medium transition-colors text-center"
                  >
                    Pedidos
                  </Link>
                  <Link
                    href="/admin/orders-by-day"
                    className="text-gray-600 hover:text-orange-600 px-2 py-1 rounded-md text-xs font-medium transition-colors text-center"
                  >
                    Por Día
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/dashboard"
                    className="text-gray-600 hover:text-orange-600 px-3 py-1 rounded-md text-xs font-medium transition-colors text-center"
                  >
                    Inicio
                  </Link>
                  <Link
                    href="/catalog"
                    className="text-gray-600 hover:text-orange-600 px-3 py-1 rounded-md text-xs font-medium transition-colors text-center"
                  >
                    Catálogo
                  </Link>
                  <Link
                    href="/orders"
                    className="text-gray-600 hover:text-orange-600 px-3 py-1 rounded-md text-xs font-medium transition-colors text-center"
                  >
                    Pedidos
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
} 