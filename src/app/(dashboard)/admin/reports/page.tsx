'use client'

import React from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/auth-context'
import { Button } from '@/components/ui/button'
import { 
  ArrowLeft, 
  FileText, 
  TrendingUp, 
  Users, 
  Package, 
  DollarSign,
  Calendar,
  BarChart3,
  Download,
  Eye
} from 'lucide-react'

export default function AdminReportsPage() {
  const { user, profile, loading: authLoading } = useAuth()

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

  if (!user || profile?.role !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin/dashboard">
                <Button variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-50">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver al Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  Centro de Reportes
                </h1>
                <p className="text-gray-600 mt-1">
                  Análisis detallado y reportes del negocio
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Categorías de Reportes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Reporte de Productos */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Package className="h-6 w-6 text-orange-600" />
              </div>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Disponible
              </span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Reporte de Productos</h3>
            <p className="text-gray-600 text-sm mb-4">
              Análisis detallado de productos más vendidos, stock, categorías y rentabilidad.
            </p>
            <div className="flex space-x-2">
              <Link href="/admin/reports/products" className="flex-1">
                <Button className="w-full bg-orange-600 hover:bg-orange-700">
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Reporte
                </Button>
              </Link>
            </div>
          </div>

          {/* Reporte de Ventas */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Próximamente
              </span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Reporte de Ventas</h3>
            <p className="text-gray-600 text-sm mb-4">
              Análisis de ingresos, tendencias de ventas, comparativas mensuales y proyecciones.
            </p>
            <div className="flex space-x-2">
              <Button variant="outline" className="flex-1" disabled>
                <TrendingUp className="h-4 w-4 mr-2" />
                Próximamente
              </Button>
            </div>
          </div>

          {/* Reporte de Clientes */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Próximamente
              </span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Reporte de Clientes</h3>
            <p className="text-gray-600 text-sm mb-4">
              Análisis de comportamiento de clientes, frecuencia de compra y segmentación.
            </p>
            <div className="flex space-x-2">
              <Button variant="outline" className="flex-1" disabled>
                <Users className="h-4 w-4 mr-2" />
                Próximamente
              </Button>
            </div>
          </div>

          {/* Reporte de Pedidos */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Próximamente
              </span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Reporte de Pedidos</h3>
            <p className="text-gray-600 text-sm mb-4">
              Análisis de estados de pedidos, tiempos de entrega y eficiencia operativa.
            </p>
            <div className="flex space-x-2">
              <Button variant="outline" className="flex-1" disabled>
                <BarChart3 className="h-4 w-4 mr-2" />
                Próximamente
              </Button>
            </div>
          </div>

          {/* Reporte Temporal */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
                <Calendar className="h-6 w-6 text-amber-600" />
              </div>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Próximamente
              </span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Reporte Temporal</h3>
            <p className="text-gray-600 text-sm mb-4">
              Análisis por períodos: diario, semanal, mensual y estacional.
            </p>
            <div className="flex space-x-2">
              <Button variant="outline" className="flex-1" disabled>
                <Calendar className="h-4 w-4 mr-2" />
                Próximamente
              </Button>
            </div>
          </div>

          {/* Exportaciones */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
                <Download className="h-6 w-6 text-gray-600" />
              </div>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Próximamente
              </span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Exportaciones</h3>
            <p className="text-gray-600 text-sm mb-4">
              Exportar datos a Excel, PDF y otros formatos para análisis externos.
            </p>
            <div className="flex space-x-2">
              <Button variant="outline" className="flex-1" disabled>
                <Download className="h-4 w-4 mr-2" />
                Próximamente
              </Button>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Información del Sistema de Reportes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Reportes Disponibles</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Reporte de Productos - Análisis completo de productos</li>
                <li className="text-gray-400">• Reporte de Ventas - En desarrollo</li>
                <li className="text-gray-400">• Reporte de Clientes - En desarrollo</li>
                <li className="text-gray-400">• Reporte de Pedidos - En desarrollo</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Próximas Funcionalidades</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Gráficos interactivos con Chart.js</li>
                <li>• Exportación a PDF y Excel</li>
                <li>• Filtros avanzados por fecha</li>
                <li>• Reportes automatizados por email</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 