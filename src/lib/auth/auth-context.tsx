'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AuthUser, SignInCredentials, SignUpCredentials, UpdateProfileData, UserProfile, AuthContextType } from '@/lib/types/auth'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [initialized, setInitialized] = useState<boolean>(false)

  // Create supabase client once via ref to avoid re-creating on each render
  const supabaseRef = React.useRef(createClient())
  const supabase = supabaseRef.current

  const fetchProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching profile:', error.message)
      return null
    }
    return data
  }, [supabase])

  useEffect(() => {
    let mounted = true

    const init = async () => {
      try {
        // Use getUser() which validates the JWT server-side (more secure than getSession)
        const { data: { user: authUser }, error } = await supabase.auth.getUser()

        if (error || !authUser) {
          if (mounted) {
            setUser(null)
            setProfile(null)
          }
          return
        }

        const userProfile = await fetchProfile(authUser.id)

        if (mounted) {
          setUser({
            id: authUser.id,
            email: authUser.email || '',
            profile: userProfile
          })
          setProfile(userProfile)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        if (mounted) {
          setUser(null)
          setProfile(null)
        }
      } finally {
        if (mounted) {
          setLoading(false)
          setInitialized(true)
        }
      }
    }

    init()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      if (event === 'SIGNED_OUT' || !session?.user) {
        setUser(null)
        setProfile(null)
        return
      }

      const userProfile = await fetchProfile(session.user.id)

      if (mounted) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          profile: userProfile
        })
        setProfile(userProfile)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase, fetchProfile])

  const signIn = useCallback(async (credentials: SignInCredentials) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      })

      if (error) throw new Error(error.message)
      if (!data.user || !data.session) throw new Error('No se pudo iniciar sesión')

      const userProfile = await fetchProfile(data.user.id)

      const authUser: AuthUser = {
        id: data.user.id,
        email: data.user.email || '',
        profile: userProfile
      }

      setUser(authUser)
      setProfile(userProfile)
    } catch (error) {
      setUser(null)
      setProfile(null)
      throw error
    } finally {
      setLoading(false)
    }
  }, [supabase, fetchProfile])

  const signUp = useCallback(async (credentials: SignUpCredentials) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            full_name: credentials.full_name,
            company_name: credentials.company_name,
            role: 'cliente'
          },
          emailRedirectTo: typeof window !== 'undefined'
            ? `${window.location.origin}/auth/callback`
            : undefined
        }
      })

      if (error) throw new Error(error.message)
      if (!data.user) throw new Error('No se pudo crear el usuario')

      // If no session, email confirmation is required
      if (!data.session) {
        throw new Error('CONFIRM_EMAIL_REQUIRED')
      }

      // Wait for the trigger to create the profile
      let userProfile: UserProfile | null = null
      for (let i = 0; i < 3; i++) {
        await new Promise(resolve => setTimeout(resolve, 500 * (i + 1)))
        userProfile = await fetchProfile(data.user.id)
        if (userProfile) break
      }

      const authUser: AuthUser = {
        id: data.user.id,
        email: data.user.email || '',
        profile: userProfile
      }

      setUser(authUser)
      setProfile(userProfile)
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }, [supabase, fetchProfile])

  const signOut = useCallback(async () => {
    setLoading(true)
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Error during signOut:', error)
    } finally {
      setUser(null)
      setProfile(null)
      setLoading(false)
    }
  }, [supabase])

  const updateProfile = useCallback(async (data: UpdateProfileData) => {
    if (!user) return
    setLoading(true)
    try {
      const { data: updated, error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw new Error(error.message)
      setProfile(updated)
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  const refreshProfile = useCallback(async () => {
    if (!user) return
    const refreshed = await fetchProfile(user.id)
    if (refreshed) setProfile(refreshed)
  }, [user, fetchProfile])

  const isAdmin = useCallback(() => profile?.role === 'admin', [profile])
  const isClient = useCallback(() => profile?.role === 'cliente', [profile])

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

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider')
  }
  return context
}
