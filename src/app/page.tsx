'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  const { user, profile, loading, initialized, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (initialized && !loading) {
      // Si el usuario está autenticado, redirigir según su rol
      if (user && profile) {
        if (isAdmin()) {
          router.push('/admin/dashboard')
        } else {
          router.push('/dashboard')
        }
      }
    }
  }, [user, profile, loading, initialized, isAdmin, router])

  // Mostrar loading mientras se inicializa la autenticación
  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  // Si no hay usuario, mostrar landing page
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-orange-600">
                Oeste Pan
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="outline">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href="/register">
                <Button>
                  Registrarse
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Bienvenido a{' '}
            <span className="text-orange-600">Oeste Pan</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Tu panadería de confianza. Productos frescos, calidad garantizada 
            y el mejor servicio para tu negocio.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto">
                Crear Cuenta
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Iniciar Sesión
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-orange-600 text-xl">🥖</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Productos Frescos
            </h3>
            <p className="text-gray-600">
              Horneados diariamente con ingredientes de primera calidad
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-orange-600 text-xl">🚚</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Entrega Puntual
            </h3>
            <p className="text-gray-600">
              Programá tus días de entrega y recibí tus productos a tiempo
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-orange-600 text-xl">📱</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Gestión Digital
            </h3>
            <p className="text-gray-600">
              Maneja tus pedidos y seguimiento desde cualquier dispositivo
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-white rounded-lg shadow-sm p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            ¿Listo para comenzar?
          </h2>
          <p className="text-gray-600 mb-6">
            Únete a la familia Oeste Pan y descubre la diferencia
          </p>
          <Link href="/register">
            <Button size="lg">
              Crear Mi Cuenta Ahora
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 Oeste Pan SRL. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
