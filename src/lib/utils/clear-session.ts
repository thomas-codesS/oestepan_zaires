/**
 * Utilidades para limpiar sesiones y cookies de autenticación
 * Útil cuando hay problemas de sesiones persistentes
 */

export function clearSupabaseCookies() {
  // Limpiar todas las cookies relacionadas con Supabase
  const cookiesToClear = [
    'sb-access-token',
    'sb-refresh-token',
    'supabase-auth-token',
    'supabase.auth.token',
    'sb-auth-token',
    'supabase.auth.session',
  ]

  cookiesToClear.forEach(cookieName => {
    // Limpiar en diferentes rutas y dominios
    const domains = ['', '.localhost', 'localhost', window.location.hostname]
    const paths = ['/', '/login', '/dashboard', '/admin']
    
    domains.forEach(domain => {
      paths.forEach(path => {
        // Diferentes formatos de cookies de Supabase
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; domain=${domain}`
        document.cookie = `sb-${window.location.hostname.replace(/\./g, '-')}-auth-token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; domain=${domain}`
      })
    })
  })

  // Limpiar patrones de cookies de Supabase con wildcard
  const allCookies = document.cookie.split(';')
  allCookies.forEach(cookie => {
    const cookieName = cookie.split('=')[0].trim()
    if (cookieName.includes('sb-') || cookieName.includes('supabase')) {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`
    }
  })
}

export function clearLocalStorage() {
  // Limpiar localStorage relacionado con Supabase
  const keysToRemove = []
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && (key.includes('supabase') || key.includes('sb-') || key.includes('auth'))) {
      keysToRemove.push(key)
    }
  }
  
  console.log('🧹 Limpiando localStorage keys:', keysToRemove)
  keysToRemove.forEach(key => {
    console.log(`  - Removiendo: ${key}`)
    localStorage.removeItem(key)
  })
  
  // Limpiar también cualquier clave que contenga el proyecto específico
  const projectKeys = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.includes('zyywhdcnuonbpjymiysc')) {
      projectKeys.push(key)
    }
  }
  
  projectKeys.forEach(key => {
    console.log(`  - Removiendo key específica del proyecto: ${key}`)
    localStorage.removeItem(key)
  })
  
  // Verificación adicional: limpiar TODOS los tokens de Supabase
  const allKeys = []
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i)
    if (key && (key.startsWith('sb-') || key.includes('supabase'))) {
      allKeys.push(key)
    }
  }
  
  if (allKeys.length > 0) {
    console.log('🧹 Limpieza adicional de tokens Supabase:', allKeys)
    allKeys.forEach(key => {
      console.log(`  - Limpieza adicional: ${key}`)
      localStorage.removeItem(key)
    })
  }
}

export function clearSessionStorage() {
  // Limpiar sessionStorage relacionado con Supabase
  const keysToRemove = []
  
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i)
    if (key && (key.includes('supabase') || key.includes('sb-') || key.includes('auth'))) {
      keysToRemove.push(key)
    }
  }
  
  keysToRemove.forEach(key => {
    sessionStorage.removeItem(key)
  })
}

export function forceLogout() {
  console.log('🧹 Limpiando sesión forzada...')
  
  // Limpiar cookies
  clearSupabaseCookies()
  
  // Limpiar almacenamiento local
  clearLocalStorage()
  clearSessionStorage()
  
  // Recargar la página para asegurar que se apliquen los cambios
  console.log('🔄 Recargando página para aplicar cambios...')
  window.location.href = '/'
}

export function diagnosticSessionInfo() {
  console.log('=== DIAGNÓSTICO DE SESIÓN ===')
  
  // Listar todas las cookies
  console.log('Cookies actuales:')
  const cookies = document.cookie.split(';').filter(c => c.trim())
  cookies.forEach(cookie => {
    const [name, value] = cookie.split('=')
    if (name.trim().includes('sb') || name.trim().includes('supabase') || name.trim().includes('auth')) {
      console.log(`  ${name.trim()}: ${value?.substring(0, 50)}...`)
    }
  })
  
  // Listar localStorage relevante
  console.log('LocalStorage relevante:')
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && (key.includes('supabase') || key.includes('sb-') || key.includes('auth'))) {
      const value = localStorage.getItem(key)
      console.log(`  ${key}: ${value?.substring(0, 50)}...`)
    }
  }
  
  console.log('=== FIN DIAGNÓSTICO ===')
} 