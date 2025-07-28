# 🚫 Funcionalidad Cancelar Pedidos

## 📋 Resumen

Sistema completo para cancelar pedidos con:
- ✅ **Backend**: Endpoint PATCH `/api/orders/[id]` 
- ✅ **Permisos**: Clientes pueden cancelar sus propios pedidos, admins cualquier pedido
- ✅ **Estados válidos**: `pending`, `confirmed`, `preparing`
- ✅ **Restauración automática**: Stock devuelto al inventario
- ✅ **Frontend**: Componente `CancelOrderButton` con confirmación

## 🔧 Uso del Componente

### Importar el componente

```tsx
import { CancelOrderButton } from '@/components/features/orders/cancel-order-button'
```

### Ejemplo básico

```tsx
<CancelOrderButton
  orderId="123e4567-e89b-12d3-a456-426614174000"
  orderStatus="pending"
  onSuccess={() => {
    console.log('Pedido cancelado!')
    // Recargar lista de pedidos, mostrar notificación, etc.
  }}
  onError={(error) => {
    console.error('Error:', error)
    // Mostrar error al usuario
  }}
/>
```

### Ejemplo en lista de pedidos

```tsx
export function OrdersList({ orders }) {
  const [orderList, setOrderList] = useState(orders)

  const handleOrderCancelled = (cancelledOrderId: string) => {
    // Actualizar la lista removiendo o marcando como cancelado
    setOrderList(prev => 
      prev.map(order => 
        order.id === cancelledOrderId 
          ? { ...order, status: 'cancelled' }
          : order
      )
    )
    
    // Mostrar notificación de éxito
    alert('Pedido cancelado exitosamente')
  }

  const handleCancelError = (error: string) => {
    // Mostrar error al usuario
    alert(`Error al cancelar: ${error}`)
  }

  return (
    <div className="space-y-4">
      {orderList.map(order => (
        <div key={order.id} className="border p-4 rounded">
          <h3>Pedido #{order.id.slice(-8)}</h3>
          <p>Estado: <span className="font-semibold">{order.status}</span></p>
          <p>Total: ${order.total_amount}</p>
          
          <div className="mt-4 flex gap-2">
            <button className="btn btn-primary">Ver Detalles</button>
            
            <CancelOrderButton
              orderId={order.id}
              orderStatus={order.status}
              onSuccess={() => handleOrderCancelled(order.id)}
              onError={handleCancelError}
              size="sm"
            />
          </div>
        </div>
      ))}
    </div>
  )
}
```

### Personalización del botón

```tsx
<CancelOrderButton
  orderId="123..."
  orderStatus="confirmed"
  variant="outline"      // Estilo del botón
  size="lg"             // Tamaño del botón
  className="w-full"    // Clases CSS adicionales
  onSuccess={() => {
    // Lógica de éxito personalizada
    router.push('/orders')
  }}
  onError={(error) => {
    // Manejo de error personalizado
    setError(error)
  }}
/>
```

## 🎯 Estados de Pedidos

### ✅ Se pueden cancelar:
- **`pending`** - Pendiente de confirmación
- **`confirmed`** - Confirmado pero no iniciado
- **`preparing`** - En preparación

### ❌ NO se pueden cancelar:
- **`ready`** - Listo para entregar (muy avanzado)
- **`delivered`** - Ya entregado (proceso completo)
- **`cancelled`** - Ya cancelado

## 🔄 Flujo de Cancelación

1. **Usuario hace clic** en "Cancelar Pedido"
2. **Modal de confirmación** aparece con advertencia
3. **Usuario confirma** la cancelación
4. **Petición PATCH** se envía al servidor
5. **Backend verifica** permisos y estado válido
6. **Estado cambia** a 'cancelled' en base de datos
7. **Stock se restaura** automáticamente por cada producto
8. **Frontend actualiza** la interfaz y muestra confirmación

## 🛡️ Seguridad y Permisos

- **Clientes**: Solo pueden cancelar sus propios pedidos
- **Admins**: Pueden cancelar cualquier pedido
- **Verificación de estado**: Solo estados válidos son aceptados
- **Protección RLS**: Políticas de base de datos aplican restricciones

## 📊 Logs y Debugging

El sistema registra detalladamente:

```
🚫 Cancelando pedido 123e4567-e89b-12d3-a456-426614174000...
🔄 Restaurando stock para pedido cancelado...
✅ Stock restaurado para producto abc123: +2 (total: 15)
✅ Stock restaurado para producto def456: +1 (total: 8)
✅ Pedido cancelado exitosamente
```

## 🚀 Ejemplo de Integración Completa

```tsx
'use client'

import { useState, useEffect } from 'react'
import { CancelOrderButton } from '@/components/features/orders/cancel-order-button'

export function MyOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders')
      const data = await response.json()
      setOrders(data.orders)
    } catch (error) {
      console.error('Error loading orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOrderCancelled = () => {
    // Recargar lista para obtener estado actualizado
    fetchOrders()
  }

  if (loading) return <div>Cargando pedidos...</div>

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Mis Pedidos</h1>
      
      <div className="grid gap-4">
        {orders.map(order => (
          <div key={order.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">Pedido #{order.id.slice(-8)}</h3>
                <p className="text-gray-600">Estado: {order.status}</p>
                <p className="text-lg font-bold">${order.total_amount}</p>
              </div>
              
              <CancelOrderButton
                orderId={order.id}
                orderStatus={order.status}
                onSuccess={handleOrderCancelled}
                onError={(error) => alert(`Error: ${error}`)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

## ✅ Funcionalidad Lista para Usar

La funcionalidad de cancelación está **100% implementada y lista**:

- 🔧 **Backend**: API endpoint funcionando
- 🎨 **Frontend**: Componente reutilizable  
- 🔒 **Seguridad**: Permisos y validaciones
- 📦 **Stock**: Restauración automática
- 🎯 **UX**: Confirmación y estados de carga
- 📝 **Logs**: Debugging completo

**¡Solo importa el componente y úsalo en cualquier parte de tu aplicación!** 