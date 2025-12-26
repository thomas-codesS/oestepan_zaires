'use client'

import React from 'react'
import { LogOut, User, Menu, X, Package, Home, ShoppingCart, BarChart3, Calendar } from 'lucide-react'
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
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

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
      {/* Header Responsive */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link href={profile?.role === 'admin' ? '/admin/dashboard' : '/dashboard'}>
                <h1 className="text-lg sm:text-xl font-semibold text-gray-900 hover:text-orange-600 cursor-pointer flex items-center gap-2">
                  <Package className="w-6 h-6 text-orange-600" />
                  <span>Oeste Pan</span>
                  {profile?.role === 'admin' && (
                    <span className="hidden md:inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      Admin
                    </span>
                  )}
                </h1>
              </Link>
            </div>

            {/* Navegación Desktop */}
            <div className="hidden lg:flex items-center space-x-6">
              {profile?.role === 'admin' ? (
                <nav className="flex space-x-1">
                  <Link
                    href="/admin/dashboard"
                    className="text-gray-600 hover:text-orange-600 hover:bg-orange-50 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/admin/products"
                    className="text-gray-600 hover:text-orange-600 hover:bg-orange-50 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Productos
                  </Link>
                  <Link
                    href="/admin/orders"
                    className="text-gray-600 hover:text-orange-600 hover:bg-orange-50 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Pedidos
                  </Link>
                  <Link
                    href="/admin/orders-by-day"
                    className="text-gray-600 hover:text-orange-600 hover:bg-orange-50 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Por Día
                  </Link>
                </nav>
              ) : (
                <nav className="flex space-x-1">
                  <Link
                    href="/catalog"
                    className="text-gray-600 hover:text-orange-600 hover:bg-orange-50 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Catálogo
                  </Link>
                  <Link
                    href="/orders"
                    className="text-gray-600 hover:text-orange-600 hover:bg-orange-50 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Mis Pedidos
                  </Link>
                </nav>
              )}

              {/* Usuario */}
              <div className="flex items-center space-x-2 text-sm text-gray-700 border-l pl-4">
                <User className="w-4 h-4" />
                <span className="font-medium">{profile?.full_name || user?.email}</span>
              </div>

              {/* Cerrar Sesión */}
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                disabled={signingOut}
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                {signingOut ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                    Cerrando...
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4 mr-2" />
                    Salir
                  </>
                )}
              </Button>
            </div>

            {/* Mobile: Usuario y Menú */}
            <div className="flex lg:hidden items-center space-x-3">
              {/* Info usuario mobile */}
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  {profile?.full_name?.split(' ')[0] || 'Usuario'}
                </span>
              </div>

              {/* Botón menú hamburguesa */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-gray-600 hover:text-orange-600 hover:bg-orange-50"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Menú Mobile Desplegable */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-3 space-y-1">
              {profile?.role === 'admin' ? (
                <>
                  <Link
                    href="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50 flex items-center"
                  >
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Dashboard
                  </Link>
                  <Link
                    href="/admin/products"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50 flex items-center"
                  >
                    <Package className="w-5 h-5 mr-2" />
                    Productos
                  </Link>
                  <Link
                    href="/admin/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50 flex items-center"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Pedidos
                  </Link>
                  <Link
                    href="/admin/orders-by-day"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50 flex items-center"
                  >
                    <Calendar className="w-5 h-5 mr-2" />
                    Pedidos por Día
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50 flex items-center"
                  >
                    <Home className="w-5 h-5 mr-2" />
                    Inicio
                  </Link>
                  <Link
                    href="/catalog"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50 flex items-center"
                  >
                    <Package className="w-5 h-5 mr-2" />
                    Catálogo
                  </Link>
                  <Link
                    href="/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50 flex items-center"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Mis Pedidos
                  </Link>
                </>
              )}

              {/* Info usuario completa */}
              <div className="pt-3 mt-3 border-t border-gray-200">
                <div className="px-3 py-2 text-sm text-gray-500">
                  <p className="font-medium text-gray-900">{profile?.full_name || 'Usuario'}</p>
                  <p className="text-xs break-all">{user?.email}</p>
                  {profile?.role === 'admin' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 mt-2">
                      Administrador
                    </span>
                  )}
                </div>
              </div>

              {/* Botón cerrar sesión */}
              <div className="pt-2">
                <Button
                  onClick={() => {
                    handleSignOut()
                    setMobileMenuOpen(false)
                  }}
                  variant="outline"
                  size="sm"
                  disabled={signingOut}
                  className="w-full border-red-200 text-red-600 hover:bg-red-50"
                >
                  {signingOut ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                      Cerrando sesión...
                    </>
                  ) : (
                    <>
                      <LogOut className="w-4 h-4 mr-2" />
                      Cerrar Sesión
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
} 