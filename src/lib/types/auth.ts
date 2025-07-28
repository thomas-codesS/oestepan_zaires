export interface UserProfile {
  id: string
  email: string
  full_name?: string
  role: 'cliente' | 'admin'
  company_name?: string
  delivery_days: number[] // [1,3] para lunes/miércoles
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AuthUser {
  id: string
  email: string
  profile?: UserProfile | null
  access_token?: string
}

export interface SignInCredentials {
  email: string
  password: string
}

export interface SignUpCredentials {
  email: string
  password: string
  full_name: string
  company_name?: string
  delivery_days?: number[]
}

export interface UpdateProfileData {
  full_name?: string
  company_name?: string
  delivery_days?: number[]
}

export interface AuthState {
  user: AuthUser | null
  profile: UserProfile | null
  loading: boolean
  initialized: boolean
}

export interface AuthContextType extends AuthState {
  signIn: (credentials: SignInCredentials) => Promise<void>
  signUp: (credentials: SignUpCredentials) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (data: UpdateProfileData) => Promise<void>
  refreshProfile: () => Promise<void>
  isAdmin: () => boolean
  isClient: () => boolean
}

// Errores de autenticación
export type AuthError = 
  | 'invalid_credentials'
  | 'email_already_exists'
  | 'weak_password'
  | 'user_not_found'
  | 'network_error'
  | 'unknown_error'

export interface AuthErrorDetails {
  type: AuthError
  message: string
}

// Utilidades para roles
export const UserRoles = {
  ADMIN: 'admin' as const,
  CLIENT: 'cliente' as const,
} as const

export const DeliveryDays = {
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
  SUNDAY: 7,
} as const

export const DeliveryDayLabels = {
  [DeliveryDays.MONDAY]: 'Lunes',
  [DeliveryDays.TUESDAY]: 'Martes',
  [DeliveryDays.WEDNESDAY]: 'Miércoles',
  [DeliveryDays.THURSDAY]: 'Jueves',
  [DeliveryDays.FRIDAY]: 'Viernes',
  [DeliveryDays.SATURDAY]: 'Sábado',
  [DeliveryDays.SUNDAY]: 'Domingo',
} as const 