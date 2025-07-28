'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createProductSchema } from '@/lib/validations/product'
import { Product, CreateProductRequest } from '@/lib/types/product'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'

interface ProductFormProps {
  product?: Product | null
  onSubmit: (data: CreateProductRequest) => Promise<void>
  isLoading?: boolean
  onCancel?: () => void
}

export function ProductForm({ product, onSubmit, isLoading = false, onCancel }: ProductFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<CreateProductRequest>({
    resolver: zodResolver(createProductSchema),
    defaultValues: product ? {
      code: product.code,
      name: product.name,
      description: product.description || '',
      price: product.price,
      iva_rate: product.iva_rate,
      category: product.category || '',
      stock_quantity: product.stock_quantity
    } : {
      iva_rate: 21.0, // Valor por defecto
      stock_quantity: 0
    }
  })

  const handleFormSubmit = async (data: CreateProductRequest) => {
    try {
      await onSubmit(data)
      if (!product) {
        reset() // Solo resetear si es un nuevo producto
      }
    } catch (error) {
      console.error('Error al enviar formulario:', error)
    }
  }

  const categoryOptions = [
    { value: 'panaderia', label: 'Panadería' },
    { value: 'bolleria', label: 'Bollería' },
    { value: 'pasteleria', label: 'Pastelería' },
    { value: 'confiteria', label: 'Confitería' },
    { value: 'sandwiches', label: 'Sandwiches' },
    { value: 'bebidas', label: 'Bebidas' },
    { value: 'otros', label: 'Otros' }
  ]

  const ivaOptions = [
    { value: '21', label: '21% (General)' },
    { value: '10.5', label: '10.5% (Reducido)' }
  ]

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Código del producto */}
        <Input
          label="Código Panfresh"
          placeholder="Ej: PAN-001"
          error={errors.code?.message}
          required
          {...register('code')}
        />

        {/* Nombre del producto */}
        <Input
          label="Nombre del Producto"
          placeholder="Ej: Pan de Molde Integral"
          error={errors.name?.message}
          required
          {...register('name')}
        />

        {/* Precio */}
        <Input
          label="Precio (sin IVA)"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          error={errors.price?.message}
          required
          {...register('price', { valueAsNumber: true })}
        />

        {/* Tasa de IVA */}
        <Select
          label="Tasa de IVA"
          options={ivaOptions}
          error={errors.iva_rate?.message}
          required
          {...register('iva_rate', { valueAsNumber: true })}
        />

        {/* Categoría */}
        <Select
          label="Categoría"
          options={categoryOptions}
          placeholder="Seleccionar categoría"
          error={errors.category?.message}
          {...register('category')}
        />

        {/* Stock */}
        <Input
          label="Cantidad en Stock"
          type="number"
          min="0"
          placeholder="0"
          error={errors.stock_quantity?.message}
          {...register('stock_quantity', { valueAsNumber: true })}
        />
      </div>

      {/* Descripción */}
      <Textarea
        label="Descripción"
        placeholder="Descripción detallada del producto..."
        rows={4}
        error={errors.description?.message}
        {...register('description')}
      />

      {/* Botones de acción */}
      <div className="flex justify-end space-x-4 pt-6 border-t">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? 'Guardando...' : product ? 'Actualizar Producto' : 'Crear Producto'}
        </Button>
      </div>
    </form>
  )
} 