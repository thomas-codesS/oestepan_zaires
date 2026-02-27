/**
 * Utilidades para limpiar sesiones y cookies de autenticación
 */

/**
 * Limpia todas las cookies de Supabase
 */
export function clearSupabaseCookies() {
  if (typeof document === 'undefined') return

  document.cookie.split(';').forEach(cookie => {
    const name = cookie.split('=')[0].trim()
    if (name.startsWith('sb-') || name.includes('supabase')) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
    }
  })
}

/**
 * Limpia localStorage de datos de Supabase
 */
export function clearSupabaseStorage() {
  if (typeof window === 'undefined') return

  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('sb-') || key.includes('supabase')) {
      localStorage.removeItem(key)
    }
  })
}

/**
 * Fuerza un logout completo limpiando todos los datos de sesión
 */
export function forceLogout() {
  clearSupabaseCookies()
  clearSupabaseStorage()
  window.location.href = '/login'
}

/**
 * Muestra información de diagnóstico de la sesión actual en la consola
 */
export function diagnosticSessionInfo() {
  if (typeof window === 'undefined') return

  const supabaseCookies = document.cookie
    .split(';')
    .filter(c => {
      const name = c.split('=')[0].trim()
      return name.startsWith('sb-') || name.includes('supabase')
    })
    .map(c => c.split('=')[0].trim())

  const storageKeys = Object.keys(localStorage).filter(
    key => key.startsWith('sb-') || key.includes('supabase')
  )

  console.group('Session Diagnostics')
  console.log('Supabase cookies:', supabaseCookies)
  console.log('Supabase localStorage keys:', storageKeys)
  console.groupEnd()
}
