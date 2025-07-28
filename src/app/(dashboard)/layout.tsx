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
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href={profile?.role === 'admin' ? '/admin/dashboard' : '/dashboard'}>
                <h1 className="text-xl font-semibold text-gray-900 hover:text-orange-600 cursor-pointer">
                  🥖 Oeste Pan {profile?.role === 'admin' ? '- Administración' : ''}
                </h1>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Navegación específica por rol */}
              {profile?.role === 'admin' ? (
                <nav className="flex space-x-4">
                  <Link 
                    href="/admin/dashboard" 
                    className="text-gray-600 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href="/admin/products" 
                    className="text-gray-600 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Productos
                  </Link>
                  <Link 
                    href="/admin/orders" 
                    className="text-gray-600 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Pedidos
                  </Link>
                  <Link 
                    href="/admin/orders-by-day" 
                    className="text-gray-600 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Por Día
                  </Link>
                </nav>
              ) : (
                <nav className="flex space-x-4">
                  <Link 
                    href="/catalog" 
                    className="text-gray-600 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Catálogo
                  </Link>
                  <Link 
                    href="/orders" 
                    className="text-gray-600 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Mis Pedidos
                  </Link>
                </nav>
              )}

              {/* Información del usuario */}
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>{profile?.full_name || user?.email}</span>
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
                className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 disabled:opacity-50"
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