'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createProductSchema } from '@/lib/validations/product'
import { Product, CreateProductRequest } from '@/lib/types/product'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { Upload, X, Image as ImageIcon } from 'lucide-react'

interface ProductFormProps {
  product?: Product | null
  onSubmit: (data: CreateProductRequest) => Promise<void>
  isLoading?: boolean
  onCancel?: () => void
}

export function ProductForm({ product, onSubmit, isLoading = false, onCancel }: ProductFormProps) {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(product?.image_url || null)
  const [uploadingImage, setUploadingImage] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm<CreateProductRequest>({
    resolver: zodResolver(createProductSchema),
    defaultValues: product ? {
      code: product.code,
      name: product.name,
      description: product.description || '',
      price: product.price,
      iva_rate: product.iva_rate,
      category: product.category || '',
      stock_quantity: 0, // Siempre 0 para desactivar stock
      image_url: product.image_url || ''
    } : {
      iva_rate: 21.0, // Valor por defecto
      stock_quantity: 0 // Siempre 0 para desactivar stock
    }
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setValue('image_url', '')
  }

  const uploadImage = async (file: File): Promise<string> => {
    const supabase = createClient()
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `products/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file)

    if (uploadError) {
      throw uploadError
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath)

    return publicUrl
  }

  const handleFormSubmit = async (data: CreateProductRequest) => {
    try {
      setUploadingImage(true)
      
      // Si hay una nueva imagen, subirla primero
      if (imageFile) {
        const imageUrl = await uploadImage(imageFile)
        data.image_url = imageUrl
      }

      await onSubmit(data)
      
      if (!product) {
        reset() // Solo resetear si es un nuevo producto
        setImageFile(null)
        setImagePreview(null)
      }
    } catch (error) {
      console.error('Error al enviar formulario:', error)
      throw error
    } finally {
      setUploadingImage(false)
    }
  }

  const categoryOptions = [
    { value: 'Panes Precocidos Congelados', label: 'Panes Precocidos Congelados' },
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
      </div>

      {/* Descripción */}
      <Textarea
        label="Descripción"
        placeholder="Descripción detallada del producto..."
        rows={4}
        error={errors.description?.message}
        {...register('description')}
      />

      {/* Imagen del producto */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Imagen del Producto
        </label>
        
        {imagePreview ? (
          <div className="relative inline-block">
            <img
              src={imagePreview}
              alt="Vista previa"
              className="w-64 h-64 object-cover rounded-lg border-2 border-gray-300"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <ImageIcon className="w-12 h-12 mb-4 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click para subir</span> o arrastra una imagen
                </p>
                <p className="text-xs text-gray-500">PNG, JPG o WEBP (MAX. 5MB)</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
          </div>
        )}
      </div>

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
          disabled={isLoading || uploadingImage}
        >
          {uploadingImage ? 'Subiendo imagen...' : isLoading ? 'Guardando...' : product ? 'Actualizar Producto' : 'Crear Producto'}
        </Button>
      </div>
    </form>
  )
} 