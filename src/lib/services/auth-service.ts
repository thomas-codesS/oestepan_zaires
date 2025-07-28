import { createClient } from '@/lib/supabase/client'
import { 
  UserProfile, 
  AuthUser, 
  SignInCredentials, 
  SignUpCredentials, 
  UpdateProfileData,
  AuthErrorDetails,
  AuthError
} from '@/lib/types/auth'

export class AuthService {
  private supabase = createClient()

  // Mapear errores de Supabase a nuestros tipos
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

  // Iniciar sesión
  async signIn(credentials: SignInCredentials): Promise<AuthUser> {
    try {
      // Verificar variables de entorno
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        const envError = { message: 'Missing Supabase environment variables' };
        console.error('Env check failed:', envError);
        throw this.mapAuthError(envError);
      }
      console.log('🔐 Iniciando login para:', credentials.email);
      console.log('🔗 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

      let data, error;
      try {
        console.log('📞 Llamando a signInWithPassword...');
        ({ data, error } = await this.supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        }));
        console.log('📥 Respuesta recibida:', { data: !!data, error: !!error });
        console.log('📥 Error completo:', error);
        console.log('📥 Data completo:', data);
      } catch (networkError: unknown) {
        console.error('💥 Network error during signIn:', networkError);
        throw this.mapAuthError({ message: 'Network error: ' + ((networkError as Error)?.message || 'Unknown') });
      }

      if (error) {
        console.error('❌ Supabase signIn error details:', error);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error status:', error.status);
        console.error('❌ Error code:', error.code);
        throw this.mapAuthError(error);
      }

      if (!data.user) {
        const noUserError = { message: 'No user returned from signIn' };
        console.error('❌ No user data:', noUserError);
        throw this.mapAuthError(noUserError);
      }

      console.log('✅ Usuario autenticado:', data.user.email);

      // Obtener el perfil del usuario
      console.log('📊 Obteniendo perfil para usuario ID:', data.user.id);
      
      try {
        // Timeout para obtener perfil
        const profilePromise = this.getUserProfile(data.user.id)
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Timeout getting profile')), 8000)
        })
        
        const profile = await Promise.race([profilePromise, timeoutPromise]) as any
        console.log('📊 Perfil obtenido exitosamente:', profile?.role);

        const authUser: AuthUser = {
          id: data.user.id,
          email: data.user.email!,
          profile
        }

        console.log('🎉 Login completado exitosamente para:', authUser.email, 'rol:', profile?.role);
        return authUser
        
      } catch (profileError) {
        console.error('❌ Error obteniendo perfil:', profileError);
        console.log('⚠️ Continuando login sin perfil...');
        
        // Si no se puede obtener el perfil, aún así permitir login
        const authUser: AuthUser = {
          id: data.user.id,
          email: data.user.email!,
          profile: null
        }

        console.log('🎉 Login completado sin perfil para:', authUser.email);
        return authUser
      }
    } catch (error) {
      console.error('💥 Error general en signIn:', error);
      console.error('💥 Error type:', typeof error);
      console.error('💥 Error keys:', Object.keys(error || {}));
      
      if (error && typeof error === 'object' && 'type' in error) {
        throw error
      }
      throw this.mapAuthError(error)
    }
  }

  // Registrar usuario
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

      if (error) {
        throw this.mapAuthError(error)
      }

      if (!data.user) {
        throw { type: 'unknown_error', message: 'No se pudo crear el usuario' }
      }

      // El perfil se crea automáticamente por el trigger en la BD
      // Esperamos un momento para que se procese
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

  // Cerrar sesión
  async signOut(): Promise<void> {
    try {
      const { error } = await this.supabase.auth.signOut()
      if (error) {
        throw this.mapAuthError(error)
      }
    } catch (error) {
      if (error && typeof error === 'object' && 'type' in error) {
        throw error
      }
      throw this.mapAuthError(error)
    }
  }

  // Obtener usuario actual
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      // Primero obtener la sesión sin riesgo de error
      const { data: { session } } = await this.supabase.auth.getSession();
      
      if (!session) {
        return null;
      }

      // Ahora obtener el usuario
      const { data: { user }, error } = await this.supabase.auth.getUser();
      
      if (error) {
        console.error('Error getting current user:', error);
        return null;
      }

      if (!user) {
        return null;
      }

      const profile = await this.getUserProfile(user.id);

      return {
        id: user.id,
        email: user.email!,
        profile
      };
    } catch (error) {
      console.error('Error in getCurrentUser:', error);
      return null;
    }
  }

  // Obtener perfil de usuario
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      console.log('👤 Obteniendo perfil para usuario:', userId)
      
      // Timeout para evitar que se quede colgado
      const profilePromise = this.supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
        
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout getting user profile')), 5000)
      })
      
      const { data, error } = await Promise.race([profilePromise, timeoutPromise]) as any

      if (error) {
        console.error('❌ Error getting user profile:', error.message)
        return null
      }

      console.log('✅ Perfil obtenido exitosamente')
      return data
    } catch (error) {
      console.error('❌ Error in getUserProfile:', error)
      return null
    }
  }

  // Actualizar perfil
  async updateProfile(userId: string, profileData: UpdateProfileData): Promise<UserProfile> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .update({
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        throw this.mapAuthError(error)
      }

      return data
    } catch (error) {
      if (error && typeof error === 'object' && 'type' in error) {
        throw error
      }
      throw this.mapAuthError(error)
    }
  }

  // Cambiar contraseña
  async changePassword(newPassword: string): Promise<void> {
    try {
      const { error } = await this.supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        throw this.mapAuthError(error)
      }
    } catch (error) {
      if (error && typeof error === 'object' && 'type' in error) {
        throw error
      }
      throw this.mapAuthError(error)
    }
  }

  // Resetear contraseña
  async resetPassword(email: string): Promise<void> {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        throw this.mapAuthError(error)
      }
    } catch (error) {
      if (error && typeof error === 'object' && 'type' in error) {
        throw error
      }
      throw this.mapAuthError(error)
    }
  }

  // Verificar si es administrador
  isAdmin(profile: UserProfile | null): boolean {
    return profile?.role === 'admin'
  }

  // Verificar si es cliente
  isClient(profile: UserProfile | null): boolean {
    return profile?.role === 'cliente'
  }

  // Escuchar cambios de autenticación
  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return this.supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await this.getUserProfile(session.user.id)
        callback({
          id: session.user.id,
          email: session.user.email!,
          profile
        })
      } else {
        callback(null)
      }
    })
  }
}

// Instancia singleton del servicio
export const authService = new AuthService()

// TODO: Implementar servicio de servidor (SSR) cuando sea necesario 