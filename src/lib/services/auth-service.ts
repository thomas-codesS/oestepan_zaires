import { createClient } from '@/lib/supabase/client'
import {
  UserProfile,
  AuthUser,
  SignInCredentials,
  SignUpCredentials,
  UpdateProfileData,
  AuthErrorDetails,
} from '@/lib/types/auth'

export class AuthService {
  private supabase = createClient()

  private mapAuthError(error: any): AuthErrorDetails {
    const message = error?.message || 'Error desconocido'

    if (message.includes('Invalid login credentials')) {
      return { type: 'invalid_credentials', message: 'Email o contraseña incorrectos' }
    }
    if (message.includes('User already registered')) {
      return { type: 'email_already_exists', message: 'Ya existe una cuenta con este email' }
    }
    if (message.includes('Password should be at least')) {
      return { type: 'weak_password', message: 'La contraseña es muy débil' }
    }
    if (message.includes('User not found')) {
      return { type: 'user_not_found', message: 'Usuario no encontrado' }
    }
    if (message.includes('Network')) {
      return { type: 'network_error', message: 'Error de conexión. Verifica tu internet.' }
    }
    if (message.includes('Database error querying schema')) {
      return {
        type: 'unknown_error',
        message: 'Error de configuración de la base de datos. Contacta al administrador del sistema.'
      }
    }

    return { type: 'unknown_error', message }
  }

  async signIn(credentials: SignInCredentials): Promise<AuthUser> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })

      if (error) throw this.mapAuthError(error)
      if (!data.user) throw this.mapAuthError({ message: 'No user returned from signIn' })

      const profile = await this.getUserProfile(data.user.id)

      return {
        id: data.user.id,
        email: data.user.email!,
        profile
      }
    } catch (error) {
      if (error && typeof error === 'object' && 'type' in error) {
        throw error
      }
      throw this.mapAuthError(error)
    }
  }

  async signUp(credentials: SignUpCredentials): Promise<AuthUser> {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            full_name: credentials.full_name,
            company_name: credentials.company_name,
            delivery_days: credentials.delivery_days || [],
          }
        }
      })

      if (error) throw this.mapAuthError(error)
      if (!data.user) throw { type: 'unknown_error' as const, message: 'No se pudo crear el usuario' }

      // Wait for the DB trigger to create the profile
      await new Promise(resolve => setTimeout(resolve, 1000))
      const profile = await this.getUserProfile(data.user.id)

      return {
        id: data.user.id,
        email: data.user.email!,
        profile
      }
    } catch (error) {
      if (error && typeof error === 'object' && 'type' in error) {
        throw error
      }
      throw this.mapAuthError(error)
    }
  }

  async signOut(): Promise<void> {
    const { error } = await this.supabase.auth.signOut()
    if (error) throw this.mapAuthError(error)
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser()
      if (error || !user) return null

      const profile = await this.getUserProfile(user.id)
      return { id: user.id, email: user.email!, profile }
    } catch {
      return null
    }
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) return null
      return data
    } catch {
      return null
    }
  }

  async updateProfile(userId: string, profileData: UpdateProfileData): Promise<UserProfile> {
    const { data, error } = await this.supabase
      .from('profiles')
      .update({
        ...profileData,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw this.mapAuthError(error)
    return data
  }

  async changePassword(newPassword: string): Promise<void> {
    const { error } = await this.supabase.auth.updateUser({ password: newPassword })
    if (error) throw this.mapAuthError(error)
  }

  async resetPassword(email: string): Promise<void> {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: typeof window !== 'undefined'
        ? `${window.location.origin}/auth/reset-password`
        : undefined,
    })
    if (error) throw this.mapAuthError(error)
  }

  isAdmin(profile: UserProfile | null): boolean {
    return profile?.role === 'admin'
  }

  isClient(profile: UserProfile | null): boolean {
    return profile?.role === 'cliente'
  }

  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return this.supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await this.getUserProfile(session.user.id)
        callback({ id: session.user.id, email: session.user.email!, profile })
      } else {
        callback(null)
      }
    })
  }
}

export const authService = new AuthService()
