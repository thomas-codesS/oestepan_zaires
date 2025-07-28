import { z } from 'zod'

export const createProductSchema = z.object({
  code: z.string()
    .min(1, 'El código es requerido')
    .max(50, 'El código no puede exceder 50 caracteres')
    .regex(/^[A-Z0-9-]+$/, 'El código solo puede contener letras mayúsculas, números y guiones'),
  
  name: z.string()
    .min(1, 'El nombre es requerido')
    .max(200, 'El nombre no puede exceder 200 caracteres'),
  
  description: z.string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .optional(),
  
  price: z.number()
    .positive('El precio debe ser mayor a 0')
    .max(999999.99, 'El precio no puede exceder $999,999.99'),
  
  iva_rate: z.number()
    .min(0, 'La tasa de IVA no puede ser negativa')
    .max(100, 'La tasa de IVA no puede exceder 100%')
    .default(21.0), // IVA general 21%
  
  category: z.string()
    .max(100, 'La categoría no puede exceder 100 caracteres')
    .optional(),
  
  stock_quantity: z.number()
    .int('La cantidad debe ser un número entero')
    .min(0, 'La cantidad no puede ser negativa')
    .default(0)
})

export const updateProductSchema = createProductSchema.partial().extend({
  id: z.string().uuid('ID de producto inválido'),
  is_active: z.boolean().optional()
})

export const productFiltersSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  is_active: z.boolean().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20)
})

export type CreateProductData = z.infer<typeof createProductSchema>
export type UpdateProductData = z.infer<typeof updateProductSchema>
export type ProductFiltersData = z.infer<typeof productFiltersSchema> 