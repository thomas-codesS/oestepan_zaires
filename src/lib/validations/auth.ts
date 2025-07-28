import { z } from 'zod'

// Schema para inicio de sesión
export const signInSchema = z.object({
  email: z
    .string()
    .email('El email debe ser válido')
    .min(1, 'El email es requerido')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(1, 'La contraseña es requerida'),
})

// Schema para registro de usuario
export const signUpSchema = z.object({
  email: z
    .string()
    .email('El email debe ser válido')
    .min(1, 'El email es requerido')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(100, 'La contraseña no puede exceder 100 caracteres'),
  confirmPassword: z
    .string()
    .min(1, 'Confirma tu contraseña'),
  full_name: z
    .string()
    .min(2, 'El nombre completo debe tener al menos 2 caracteres')
    .max(100, 'El nombre completo no puede exceder 100 caracteres')
    .trim(),
  company_name: z
    .string()
    .max(100, 'El nombre de la empresa no puede exceder 100 caracteres')
    .trim()
    .optional(),
  delivery_days: z
    .array(z.number().int().min(1).max(7))
    .max(7, 'No se pueden seleccionar más de 7 días')
    .optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

// Schema para recuperación de contraseña
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email('El email debe ser válido')
    .min(1, 'El email es requerido'),
})

// Schema para cambio de contraseña
export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'La contraseña actual es requerida'),
  newPassword: z
    .string()
    .min(8, 'La nueva contraseña debe tener al menos 8 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'La contraseña debe contener al menos una minúscula, una mayúscula y un número'
    ),
  confirmNewPassword: z
    .string()
    .min(1, 'Confirma tu nueva contraseña'),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmNewPassword'],
})

// Schema para actualización de perfil
export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .min(2, 'El nombre completo debe tener al menos 2 caracteres')
    .max(100, 'El nombre completo no puede exceder 100 caracteres'),
  companyName: z
    .string()
    .min(2, 'El nombre de la empresa debe tener al menos 2 caracteres')
    .max(100, 'El nombre de la empresa no puede exceder 100 caracteres')
    .optional(),
  deliveryDays: z
    .array(z.number().min(0).max(6))
    .min(1, 'Debe seleccionar al menos un día de entrega')
    .max(7, 'No puede seleccionar más de 7 días'),
})

// Tipos derivados de los schemas
export type SignUpData = z.infer<typeof signUpSchema>
export type SignInData = z.infer<typeof signInSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema> 