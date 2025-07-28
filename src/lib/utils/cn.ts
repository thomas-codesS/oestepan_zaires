import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utilidad para combinar clases CSS de Tailwind de forma optimizada
 * Combina clsx para lógica condicional con tailwind-merge para deduplicación
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
} 