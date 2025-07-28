'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/auth-context'
import { Button } from '@/components/ui/button'
import { formatPrice, formatDate } from '@/lib/utils/format'
import { 
  BarChart3, 
  TrendingUp, 
  Package, 
  Users, 
  ShoppingCart, 
  Calendar,
  DollarSign,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react'

interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  pendingOrders: number
  completedOrders: number
  totalProducts: number
  activeProducts: number
  totalClients: number
  todayOrders: number
  weeklyGrowth: number
  monthlyGrowth: number
}

interface TopProduct {
  id: string
  name: string
  code: string
  category: string
  total_quantity: number
  total_revenue: number
}

interface RecentOrder {
  id: string
  order_number: string
  user_email: string
  total: number
  status: string
  created_at: string
  items_count: number
}

interface OrdersByStatus {
  pending: number
  confirmed: number
  preparing: number
  ready: number
  delivered: number
  cancelled: number
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [ordersByStatus, setOrdersByStatus] = useState<OrdersByStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // Redirigir si no está autenticado o no es admin
  useEffect(() => {
    if (!authLoading && (!user || profile?.role !== 'admin')) {
      router.push('/dashboard')
    }
  }, [user, profile, authLoading, router])

  // Cargar datos del dashboard
  useEffect(() => {
    if (user && profile?.role === 'admin') {
      loadDashboardData()
    }
  }, [user, profile])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Hacer múltiples llamadas en paralelo para mejor performance
      const [statsRes, topProductsRes, recentOrdersRes, orderStatusRes] = await Promise.all([
        fetch('/api/admin/dashboard/stats'),
        fetch('/api/admin/dashboard/top-products'),
        fetch('/api/admin/dashboard/recent-orders'),
        fetch('/api/admin/dashboard/orders-by-status')
      ])

      if (!statsRes.ok || !topProductsRes.ok || !recentOrdersRes.ok || !orderStatusRes.ok) {
        throw new Error('Error al cargar datos del dashboard')
      }

      const [statsData, topProductsData, recentOrdersData, orderStatusData] = await Promise.all([
        statsRes.json(),
        topProductsRes.json(),
        recentOrdersRes.json(),
        orderStatusRes.json()
      ])

      setStats(statsData)
      setTopProducts(topProductsData)
      setRecentOrders(recentOrdersData)
      setOrdersByStatus(orderStatusData)
    } catch (err) {
      console.error('Error loading dashboard data:', err)
      setError('Error al cargar el dashboard. Verifica que las APIs estén funcionando correctamente.')
      
      // No cargar datos mock - el usuario debe saber si hay un problema real
      setStats(null)
      setTopProducts([])
      setRecentOrders([])
      setOrdersByStatus(null)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadDashboardData()
    setRefreshing(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'confirmed': return 'text-blue-600 bg-blue-100'
      case 'preparing': return 'text-purple-600 bg-purple-100'
      case 'ready': return 'text-green-600 bg-green-100'
      case 'delivered': return 'text-green-800 bg-green-200'
      case 'cancelled': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'confirmed': return <CheckCircle className="w-4 h-4" />
      case 'preparing': return <Package className="w-4 h-4" />
      case 'ready': return <CheckCircle className="w-4 h-4" />
      case 'delivered': return <CheckCircle className="w-4 h-4" />
      case 'cancelled': return <XCircle className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente'
      case 'confirmed': return 'Confirmado'
      case 'preparing': return 'Preparando'
      case 'ready': return 'Listo'
      case 'delivered': return 'Entregado'
      case 'cancelled': return 'Cancelado'
      default: return status
    }
  }

  // Mostrar loading mientras se autentica
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
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
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                Dashboard Administrativo
              </h1>
              <p className="text-gray-600 mt-2">
                Panel de control con métricas y estadísticas del negocio
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={handleRefresh}
                variant="outline" 
                className="border-orange-300 text-orange-600 hover:bg-orange-50"
                disabled={refreshing}
              >
                <BarChart3 className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Actualizando...' : 'Actualizar'}
              </Button>
              <Link href="/dashboard">
                <Button variant="outline" className="border-gray-300 text-gray-600 hover:bg-gray-50">
                  ← Volver
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total de Pedidos */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pedidos</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalOrders || 0}</p>
                <div className="flex items-center mt-2">
                  <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+{stats?.weeklyGrowth || 0}% esta semana</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Ingresos Totales */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
                <p className="text-2xl font-bold text-gray-900">{formatPrice(stats?.totalRevenue || 0)}</p>
                <div className="flex items-center mt-2">
                  <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+{stats?.monthlyGrowth || 0}% este mes</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Productos Activos */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Productos Activos</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.activeProducts || 0}</p>
                <p className="text-sm text-gray-500 mt-2">de {stats?.totalProducts || 0} total</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Clientes Totales */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Clientes Totales</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalClients || 0}</p>
                <p className="text-sm text-gray-500 mt-2">{stats?.todayOrders || 0} pedidos hoy</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Segunda fila: Estados de pedidos y enlaces rápidos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Estados de pedidos */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-orange-500" />
              Pedidos por Estado
            </h2>
            <div className="space-y-4">
              {ordersByStatus && Object.entries(ordersByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-full mr-3 ${getStatusColor(status)}`}>
                      {getStatusIcon(status)}
                    </div>
                    <span className="font-medium text-gray-900">{getStatusLabel(status)}</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Acciones Rápidas
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <Link href="/admin/products">
                <Button 
                  variant="outline" 
                  className="w-full h-16 flex flex-col items-center justify-center border-orange-200 hover:bg-orange-50"
                >
                  <Package className="w-6 h-6 text-orange-600 mb-1" />
                  <span className="text-sm">Gestionar Productos</span>
                </Button>
              </Link>
              
              <Link href="/admin/orders">
                <Button 
                  variant="outline" 
                  className="w-full h-16 flex flex-col items-center justify-center border-orange-200 hover:bg-orange-50"
                >
                  <ShoppingCart className="w-6 h-6 text-orange-600 mb-1" />
                  <span className="text-sm">Ver Pedidos</span>
                </Button>
              </Link>
              
              <Link href="/admin/orders-by-day">
                <Button 
                  variant="outline" 
                  className="w-full h-16 flex flex-col items-center justify-center border-blue-200 hover:bg-blue-50"
                >
                  <Calendar className="w-6 h-6 text-blue-600 mb-1" />
                  <span className="text-sm">Pedidos por Día</span>
                </Button>
              </Link>
              
              <Link href="/admin/products/new">
                <Button 
                  className="w-full h-16 flex flex-col items-center justify-center bg-orange-600 hover:bg-orange-700"
                >
                  <Package className="w-6 h-6 text-white mb-1" />
                  <span className="text-sm text-white">Nuevo Producto</span>
                </Button>
              </Link>
              
              <Link href="/admin/reports">
                <Button 
                  variant="outline" 
                  className="w-full h-16 flex flex-col items-center justify-center border-orange-200 hover:bg-orange-50"
                >
                  <BarChart3 className="w-6 h-6 text-orange-600 mb-1" />
                  <span className="text-sm">Reportes</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Tercera fila: Productos más vendidos y pedidos recientes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Productos más vendidos */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                Productos Más Vendidos
              </h2>
              <Link href="/admin/reports/products">
                <Button variant="outline" size="sm" className="border-orange-200 text-orange-600 hover:bg-orange-50">
                  <Eye className="w-4 h-4 mr-1" />
                  Ver Todos
                </Button>
              </Link>
            </div>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-sm font-bold text-orange-600">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.code} • {product.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{product.total_quantity} unidades</p>
                    <p className="text-sm text-green-600">{formatPrice(product.total_revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pedidos recientes */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-blue-500" />
                Pedidos Recientes
              </h2>
              <Link href="/admin/orders">
                <Button variant="outline" size="sm" className="border-orange-200 text-orange-600 hover:bg-orange-50">
                  <Eye className="w-4 h-4 mr-1" />
                  Ver Todos
                </Button>
              </Link>
            </div>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">{order.order_number}</p>
                    <p className="text-sm text-gray-500">{order.user_email}</p>
                    <p className="text-xs text-gray-400">{formatDate(order.created_at)} • {order.items_count} items</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatPrice(order.total)}</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="ml-1">{getStatusLabel(order.status)}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 