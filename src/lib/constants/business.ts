/**
 * Constantes de negocio para Oeste Pan SRL
 * Basadas en los requerimientos del proyecto
 */

// Reglas de pedidos
export const ORDER_RULES = {
  MINIMUM_AMOUNT: Number(process.env.NEXT_PUBLIC_MINIMUM_ORDER_AMOUNT) || 50000,
  CUTOFF_HOUR: Number(process.env.NEXT_PUBLIC_ORDER_CUTOFF_HOUR) || 13, // 1:00 PM
  CUTOFF_MINUTE: 0,
} as const

// Días de la semana (0 = Domingo, 1 = Lunes, etc.)
export const DELIVERY_DAYS = {
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
  SUNDAY: 0,
} as const

// Días de entrega típicos (ejemplo: lunes y miércoles)
export const DEFAULT_DELIVERY_DAYS = [
  DELIVERY_DAYS.MONDAY,
  DELIVERY_DAYS.WEDNESDAY,
] as const

// Estados de pedidos
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
} as const

// Roles de usuario
export const USER_ROLES = {
  CLIENTE: 'cliente',
  ADMIN: 'admin',
} as const

// Tasas de IVA permitidas
export const IVA_RATES = {
  STANDARD: 21.0,    // 21%
  REDUCED: 10.5,     // 10.5%
} as const

// Configuración de paginación
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE: 1,
} as const

// Formatos de fecha
export const DATE_FORMATS = {
  DISPLAY: 'dd/MM/yyyy',
  API: 'yyyy-MM-dd',
  DATETIME: 'dd/MM/yyyy HH:mm',
  TIME: 'HH:mm',
} as const

// Límites de archivos
export const FILE_LIMITS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_EXTENSIONS: ['.xlsx', '.xls', '.csv'],
  MAX_PRODUCTS_IMPORT: 1000,
} as const

// Mensajes de error comunes
export const ERROR_MESSAGES = {
  MINIMUM_ORDER_NOT_MET: `El monto mínimo del pedido es $${ORDER_RULES.MINIMUM_AMOUNT.toLocaleString()}`,
  ORDER_CUTOFF_PASSED: `No se pueden confirmar pedidos después de las ${ORDER_RULES.CUTOFF_HOUR}:00 PM del día anterior`,
  INVALID_DELIVERY_DATE: 'La fecha de entrega no está disponible para este cliente',
  UNAUTHORIZED: 'No tienes permisos para realizar esta acción',
  INVALID_FILE_TYPE: 'Tipo de archivo no válido. Solo se permiten archivos Excel (.xlsx, .xls) o CSV (.csv)',
  FILE_TOO_LARGE: `El archivo es demasiado grande. Tamaño máximo: ${FILE_LIMITS.MAX_FILE_SIZE / (1024 * 1024)}MB`,
} as const

// Configuración de la aplicación
export const APP_CONFIG = {
  NAME: process.env.NEXT_PUBLIC_APP_NAME || 'Oeste Pan Platform',
  URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  SUPPORT_EMAIL: 'soporte@oestepan.com',
  PHONE: '+54 11 1234-5678',
} as const

// Configuración de desarrollo
export const DEV_CONFIG = {
  DEBUG: process.env.NEXT_PUBLIC_DEBUG === 'true',
  MOCK_DATA: process.env.NODE_ENV === 'development',
} as const 