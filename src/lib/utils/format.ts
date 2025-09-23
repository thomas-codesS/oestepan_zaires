/**
 * Formatea un precio en pesos argentinos
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price)
}

/**
 * Formatea un número con separadores de miles
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('es-AR').format(num)
}

/**
 * Formatea una fecha en formato argentino
 * Para fechas de solo fecha (YYYY-MM-DD), evita problemas de zona horaria
 */
export function formatDate(date: string | Date): string {
  if (typeof date === 'string') {
    // Si es una fecha en formato YYYY-MM-DD, parseamos manualmente para evitar problemas de UTC
    const dateMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (dateMatch) {
      const [, year, month, day] = dateMatch
      const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      return new Intl.DateTimeFormat('es-AR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(dateObj)
    }
  }
  
  // Para otros formatos o objetos Date, usar el comportamiento original
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj)
}

/**
 * Formatea fecha y hora en formato argentino
 */
export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('es-AR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj)
}

/**
 * Trunca un texto a una longitud específica
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

/**
 * Capitaliza la primera letra de una cadena
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Formatea un porcentaje
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * Calcula el total del IVA de un monto que incluye IVA
 */
export function calculateIVAFromTotal(totalWithIVA: number, ivaRate: number): number {
  return (totalWithIVA * ivaRate) / (100 + ivaRate)
}

/**
 * Calcula el subtotal sin IVA de un monto que incluye IVA
 */
export function calculateSubtotalFromTotal(totalWithIVA: number, ivaRate: number): number {
  return totalWithIVA - calculateIVAFromTotal(totalWithIVA, ivaRate)
}

/**
 * Formatea el desglose de precio mostrando subtotal e IVA por separado
 */
export function formatPriceBreakdown(totalWithIVA: number, ivaRate: number = 21): {
  total: string
  subtotal: string
  iva: string
  subtotalAmount: number
  ivaAmount: number
} {
  const ivaAmount = calculateIVAFromTotal(totalWithIVA, ivaRate)
  const subtotalAmount = totalWithIVA - ivaAmount
  
  return {
    total: formatPrice(totalWithIVA),
    subtotal: formatPrice(subtotalAmount),
    iva: formatPrice(ivaAmount),
    subtotalAmount,
    ivaAmount
  }
}

/**
 * Calcula el desglose de IVA para un carrito con productos de diferentes tasas
 */
export function formatCartPriceBreakdown(items: Array<{
  quantity: number
  product: {
    price: number
    iva_rate: number
  }
}>): {
  total: string
  subtotal: string
  iva: string
  subtotalAmount: number
  ivaAmount: number
  ivaBreakdown: Array<{ rate: number, amount: number }>
} {
  let totalSubtotal = 0
  let totalIVA = 0
  const ivaByRate: { [key: number]: number } = {}

  items.forEach(item => {
    const itemSubtotalWithIVA = item.product.price * item.quantity
    const itemIVA = calculateIVAFromTotal(itemSubtotalWithIVA, item.product.iva_rate)
    const itemSubtotal = itemSubtotalWithIVA - itemIVA

    totalSubtotal += itemSubtotal
    totalIVA += itemIVA

    if (!ivaByRate[item.product.iva_rate]) {
      ivaByRate[item.product.iva_rate] = 0
    }
    ivaByRate[item.product.iva_rate] += itemIVA
  })

  const total = totalSubtotal + totalIVA

  return {
    total: formatPrice(total),
    subtotal: formatPrice(totalSubtotal),
    iva: formatPrice(totalIVA),
    subtotalAmount: totalSubtotal,
    ivaAmount: totalIVA,
    ivaBreakdown: Object.entries(ivaByRate).map(([rate, amount]) => ({
      rate: parseFloat(rate),
      amount
    }))
  }
} 