'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AuthUser, SignInCredentials, SignUpCredentials, UpdateProfileData, UserProfile, AuthContextType } from '@/lib/types/auth'

const supabase = createClient()

export const authService = {
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      console.log('🔍 Obteniendo sesión actual...')
      
      // Timeout para evitar que se quede colgado
      const sessionPromise = supabase.auth.getSession()
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout getting session')), 10000)
      })
      
      const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise]) as any
      
      if (error) {
        console.error('❌ Error obteniendo sesión:', error.message)
        return null
      }
      
      if (!session || !session.user) {
        console.log('ℹ️ No hay sesión activa')
        return null
      }

      console.log('✅ Sesión encontrada para:', session.user.email)

      let profile = null;
      try {
        console.log('📊 Obteniendo perfil...')
        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
        profile = data;
        console.log('✅ Perfil obtenido:', profile?.role)
      } catch (profileError) {
        console.error('❌ Error fetching profile in getCurrentUser:', profileError);
        return null;
      }

      return {
        id: session.user.id,
        email: session.user.email || '',
        access_token: session.access_token,
        profile
      }
    } catch (error) {
      console.error('❌ Error general en getCurrentUser:', error)
      return null
    }
  },

  onAuthStateChange(callback: (authUser: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (!session?.user) {
        callback(null)
        return
      }

      let profile = null;
      try {
        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
        profile = data;
      } catch (profileError) {
        console.error('Error fetching profile in onAuthStateChange:', profileError);
        callback(null);
        return;
      }

      callback({
        id: session.user.id,
        email: session.user.email || '',
        access_token: session.access_token,
        profile
      })
    })
  },

  async signIn(credentials: SignInCredentials): Promise<AuthUser> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password
    })

    if (error) throw new Error(error.message)
    if (!data.user || !data.session) throw new Error('No user or session returned after sign in')

    let profile = null;
    try {
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', data.user.id).single()
      profile = profileData;
    } catch (profileError) {
      console.error('Error fetching profile in signIn:', profileError);
      throw new Error('Failed to fetch user profile');
    }

    return {
      id: data.user.id,
      email: data.user.email || '',
      access_token: data.session.access_token,
      profile
    }
  },

  async signUp(credentials: SignUpCredentials): Promise<AuthUser> {
    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: {
          full_name: credentials.full_name,
          company_name: credentials.company_name,
          role: 'cliente'
        }
      }
    })

    if (error) {
      throw new Error(error.message)
    }

    if (!data.user || !data.session) {
      throw new Error('No user or session returned after sign up')
    }

    let profile = null;
    try {
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', data.user.id).single()
      profile = profileData;
    } catch (profileError) {
      console.error('Error fetching profile in signUp:', profileError);
      throw new Error('Failed to fetch user profile after signup');
    }

    return {
      id: data.user.id,
      email: data.user.email || '',
      access_token: data.session.access_token,
      profile
    }
  },

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw new Error(error.message)
    }
    
    // Limpiar datos locales adicionales para asegurar logout completo
    if (typeof window !== 'undefined') {
      // Limpiar cualquier token residual en localStorage
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (key.includes('supabase') || key.includes('sb-') || key.includes('auth'))) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key))
      
      // Limpiar sessionStorage también
      const sessionKeysToRemove = []
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
        if (key && (key.includes('supabase') || key.includes('sb-') || key.includes('auth'))) {
          sessionKeysToRemove.push(key)
        }
      }
      sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key))
    }
  },

  async updateProfile(userId: string, data: UpdateProfileData): Promise<UserProfile> {
    const { data: profile, error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return profile
  },

  async getUserProfile(userId: string): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return data
  },

  isAdmin(profile: UserProfile | null): boolean {
    return profile?.role === 'admin'
  },

  isClient(profile: UserProfile | null): boolean {
    return profile?.role === 'cliente'
  }
}

// Contexto de autenticación
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Proveedor de autenticación
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [initialized, setInitialized] = useState<boolean>(false)

  // Inicializar usuario actual y suscribirse a cambios de sesión
  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null

    const init = async () => {
      setLoading(true)
      console.log('🔄 Inicializando contexto de autenticación...')
      
      try {
        const current = await authService.getCurrentUser()
        if (current) {
          console.log('✅ Usuario encontrado:', current.email)
          
          // Verificación adicional: verificar que Supabase también reconoce la sesión
          try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session || !session.user) {
              console.warn('⚠️ DESCONEXIÓN DETECTADA: El contexto tiene usuario pero Supabase no tiene sesión')
              console.log('🧹 Limpiando estado inconsistente...')
              
              // Limpiar localStorage corrupto
              const { clearLocalStorage } = await import('@/lib/utils/clear-session')
              clearLocalStorage()
              
              // Limpiar estado
              setUser(null)
              setProfile(null)
              return
            }
            
            // Verificar que el usuario es el mismo
            if (session.user.email !== current.email) {
              console.warn('⚠️ USUARIO DIFERENTE: Contexto y Supabase tienen usuarios diferentes')
              console.log('🧹 Limpiando estado inconsistente...')
              
              const { clearLocalStorage } = await import('@/lib/utils/clear-session')
              clearLocalStorage()
              
              setUser(null)
              setProfile(null)
              return
            }
          } catch (verificationError) {
            console.error('❌ Error verificando sesión:', verificationError)
            console.log('🧹 Limpiando por error de verificación...')
            
            const { clearLocalStorage } = await import('@/lib/utils/clear-session')
            clearLocalStorage()
            
            setUser(null)
            setProfile(null)
            return
          }
          
          setUser(current)
          setProfile(current.profile ?? null)
        } else {
          console.log('ℹ️ No hay usuario activo')
          setUser(null)
          setProfile(null)
        }
      } catch (error) {
        console.error('❌ Error al obtener usuario actual:', error)
        // En caso de error, limpiar estado y continuar
        setUser(null)
        setProfile(null)
        
        // Si hay un error de sesión corrupta, limpiar localStorage
        if (error instanceof Error && error.message.includes('session')) {
          console.log('🧹 Limpiando sesión corrupta...')
          if (typeof window !== 'undefined') {
            const { clearLocalStorage } = await import('@/lib/utils/clear-session')
            clearLocalStorage()
          }
        }
      }
      
      setLoading(false)
      setInitialized(true)

      // Escuchar cambios de sesión
      const sub = authService.onAuthStateChange((authUser) => {
        setUser(authUser)
        setProfile(authUser?.profile ?? null)
      }) as any

      // Supabase v2 devuelve { data: { subscription } }
      if (sub?.data?.subscription) {
        subscription = sub.data.subscription
      } else if (sub?.unsubscribe) {
        subscription = sub
      }
    }

    init()

    return () => {
      subscription?.unsubscribe?.()
    }
  }, [])

  // Métodos de autenticación
  const signIn = async (credentials: SignInCredentials) => {
    console.log('🔐 Iniciando proceso de login...')
    setLoading(true)
    
    try {
      // Timeout para evitar que se quede colgado
      const loginPromise = authService.signIn(credentials)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Login timeout - el proceso tardó demasiado')), 15000)
      })
      
      const logged = await Promise.race([loginPromise, timeoutPromise]) as any
      
      console.log('✅ Login exitoso para:', logged.email)
      setUser(logged)
      setProfile(logged.profile ?? null)
      
    } catch (error) {
      console.error('❌ Error en signIn:', error)
      // Limpiar estado en caso de error
      setUser(null)
      setProfile(null)
      throw error
    } finally {
      setLoading(false)
      console.log('🏁 Proceso de login terminado')
    }
  }

  const signUp = async (credentials: SignUpCredentials) => {
    setLoading(true)
    const registered = await authService.signUp(credentials)
    setUser(registered)
    setProfile(registered.profile ?? null)
    setLoading(false)
  }

  const signOut = async () => {
    setLoading(true)
    try {
      await authService.signOut()
      
      // Limpiar estado local inmediatamente
      setUser(null)
      setProfile(null)
      
      // Forzar redirección inmediata al home
      if (typeof window !== 'undefined') {
        window.location.href = '/'
      }
    } catch (error) {
      console.error('Error during signOut:', error)
      // En caso de error, aún así limpiar el estado local
      setUser(null)
      setProfile(null)
      
      // Usar forzado de limpieza si hay error
      if (typeof window !== 'undefined') {
        const { forceLogout } = await import('@/lib/utils/clear-session')
        forceLogout()
      }
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (data: UpdateProfileData) => {
    if (!user) return
    setLoading(true)
    const updated = await authService.updateProfile(user.id, data)
    setProfile(updated)
    setLoading(false)
  }

  const refreshProfile = async () => {
    if (!user) return
    const refreshed = await authService.getUserProfile(user.id)
    setProfile(refreshed)
  }

  const isAdmin = () => authService.isAdmin(profile)
  const isClient = () => authService.isClient(profile)

  const value: AuthContextType = {
    user,
    profile,
    loading,
    initialized,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshProfile,
    isAdmin,
    isClient,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook de conveniencia
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider')
  }
  return context
}