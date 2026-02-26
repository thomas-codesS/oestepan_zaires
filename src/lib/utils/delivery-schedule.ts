/**
 * Lógica de ventanas de pedido para Oeste Pan SRL
 *
 * Reglas:
 * - El día de pedido es 2 días antes del día de entrega
 *   (ej: pedido el miércoles → entrega el viernes)
 * - La ventana de pedido abre a las 00:00 del día anterior al día de pedido
 *   (ej: martes a medianoche → miércoles 12:00)
 * - La ventana cierra a las 12:00 hs del día de pedido
 * - Fuera de la ventana, NO se pueden hacer pedidos
 */

import { ORDER_RULES } from '../constants/business'

// Días antes de la entrega en que se realiza el pedido (ej: 2 → miércoles para viernes)
const ORDER_LEAD_DAYS = 2

// Días antes del día de pedido en que abre la ventana (ej: 1 → ventana abre el día anterior)
const WINDOW_OPEN_LEAD_DAYS = 1

/**
 * Devuelve la fecha/hora actual en la zona horaria de Argentina (UTC-3, sin DST).
 */
function getArgentinaTime(now?: Date): Date {
  const base = now || new Date()
  return new Date(base.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' }))
}

export interface DeliveryWindow {
  isOpen: boolean
  /** Fecha de entrega correspondiente a la ventana activa (si isOpen = true) */
  deliveryDate?: Date
  /** Día de pedido (cutoff day) */
  orderDate?: Date
  /** Cuándo abre la próxima ventana (si isOpen = false) */
  nextWindowOpens?: Date
}

/**
 * Calcula la ventana de pedido activa para el usuario.
 *
 * @param deliveryDays - Array de días de entrega del usuario (0=Dom, 1=Lun, ..., 6=Sáb)
 * @param now - Fecha/hora de referencia (por defecto: ahora). Útil para tests.
 */
export function getDeliveryWindow(deliveryDays: number[], now?: Date): DeliveryWindow {
  if (!deliveryDays || deliveryDays.length === 0) {
    return { isOpen: false }
  }

  const arNow = getArgentinaTime(now)

  // Buscamos en los próximos 14 días una ventana válida
  for (let i = 0; i <= 14; i++) {
    const candidateDelivery = new Date(arNow)
    candidateDelivery.setDate(arNow.getDate() + i)
    candidateDelivery.setHours(0, 0, 0, 0)

    if (!deliveryDays.includes(candidateDelivery.getDay())) continue

    // Día de pedido = día de entrega - ORDER_LEAD_DAYS
    const orderDate = new Date(candidateDelivery)
    orderDate.setDate(candidateDelivery.getDate() - ORDER_LEAD_DAYS)
    orderDate.setHours(0, 0, 0, 0)

    // La ventana abre a las 00:00 de (orderDate - WINDOW_OPEN_LEAD_DAYS)
    const windowOpen = new Date(orderDate)
    windowOpen.setDate(orderDate.getDate() - WINDOW_OPEN_LEAD_DAYS)
    windowOpen.setHours(0, 0, 0, 0)

    // La ventana cierra a las CUTOFF_HOUR del día de pedido
    const windowClose = new Date(orderDate)
    windowClose.setHours(ORDER_RULES.CUTOFF_HOUR, ORDER_RULES.CUTOFF_MINUTE, 0, 0)

    if (arNow >= windowOpen && arNow < windowClose) {
      // Estamos dentro de esta ventana → pedidos habilitados
      return { isOpen: true, deliveryDate: candidateDelivery, orderDate }
    }

    if (arNow < windowOpen) {
      // Esta ventana aún no abrió → la próxima apertura es windowOpen
      return { isOpen: false, nextWindowOpens: windowOpen }
    }

    // Si llegamos aquí, la ventana ya cerró → seguimos con la próxima entrega
  }

  return { isOpen: false }
}

/**
 * Convierte una fecha a string YYYY-MM-DD en zona horaria de Argentina.
 */
export function formatDeliveryDateForApi(date: Date): string {
  const ar = new Date(date.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' }))
  const year = ar.getFullYear()
  const month = String(ar.getMonth() + 1).padStart(2, '0')
  const day = String(ar.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Formatea una fecha para mostrar al usuario (ej: "viernes 6 de marzo de 2026").
 */
export function formatDateDisplay(date: Date): string {
  return date.toLocaleDateString('es-AR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Argentina/Buenos_Aires',
  })
}

/**
 * Formatea una fecha y hora para mostrar al usuario (ej: "martes 10 de marzo, 00:00 hs").
 */
export function formatDateTimeDisplay(date: Date): string {
  return date.toLocaleString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Argentina/Buenos_Aires',
  })
}
