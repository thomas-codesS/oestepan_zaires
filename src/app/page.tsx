"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-context"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function Home() {
  const { user, profile, loading, initialized, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (initialized && !loading) {
      if (user && profile) {
        if (isAdmin()) {
          router.push("/admin/dashboard")
        } else {
          router.push("/dashboard")
        }
      }
    }
  }, [user, profile, loading, initialized, isAdmin, router])

  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-800 font-medium">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white shadow-xl sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-3 sm:gap-6">
              <div className="transform hover:scale-105 transition-transform duration-300">
                <Image 
                  src="/logo_oestepan.png" 
                  alt="Oeste Pan" 
                  width={120} 
                  height={120} 
                  className="object-contain w-16 h-16 sm:w-24 sm:h-24 lg:w-[120px] lg:h-[120px]" 
                />
              </div>
              <div className="hidden md:block">
                <h1 className="text-4xl lg:text-5xl font-bold text-brand text-balance">Oeste Pan</h1>
                <p className="text-lg lg:text-xl text-gray-600 font-medium">Panadería Artesanal</p>
              </div>
            </div>
            <nav className="flex items-center gap-2 sm:gap-4">
              <Link href="/login">
                <Button
                  variant="outline"
                  className="border-2 border-black text-black hover:bg-black hover:text-white font-semibold bg-transparent transition-all duration-300 text-xs sm:text-sm px-3 py-2 sm:px-6 sm:py-3"
                >
                  <span className="hidden sm:inline">Iniciar Sesión</span>
                  <span className="sm:hidden">Entrar</span>
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-black hover:bg-gray-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-xs sm:text-sm px-3 py-2 sm:px-6 sm:py-3">
                  Registrarse
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            <div className="space-y-10 animate-fade-in-up">
              <div className="space-y-8">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-black leading-tight text-balance">
                  Pan recién horneado
                  <span className="block text-amber-800">cada día</span>
                </h1>
                <p className="text-xl lg:text-2xl text-gray-700 leading-relaxed text-pretty max-w-lg">
                  Somos una empresa familiar con más de 20 años de experiencia en panificados.
                  Trabajamos con pasión, compromiso y responsabilidad ofreciendo diariamente productos de alta calidad y máxima frescura.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-6">
                <Link href="/register" className="flex-1 sm:flex-none">
                  <Button
                    size="lg"
                    className="w-full bg-black hover:bg-gray-800 text-white px-10 py-5 text-xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    Registrarse
                  </Button>
                </Link>
                <Link href="/login" className="flex-1 sm:flex-none">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full border-3 border-black text-black hover:bg-black hover:text-white px-10 py-5 text-xl font-bold bg-transparent transition-all duration-300 transform hover:-translate-y-1"
                  >
                    Iniciar Sesión
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative animate-fade-in-right">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="bg-white rounded-3xl shadow-2xl overflow-hidden transform hover:scale-105 transition-all duration-500 hover:shadow-3xl">
                    <img
                      src="/imagenes_stock_paginaprincipal/panes.jpeg"
                      alt="Pan recién horneado"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  <div className="bg-white rounded-3xl shadow-2xl overflow-hidden transform hover:scale-105 transition-all duration-500 hover:shadow-3xl">
                    <img
                      src="/imagenes_stock_paginaprincipal/WhatsApp Image 2025-10-09 at 2.59.10 PM (3).jpeg"
                      alt="Panadería artesanal"
                      className="w-full h-64 object-cover"
                    />
                  </div>
                </div>
                <div className="space-y-6 pt-12">
                  <div className="bg-white rounded-3xl shadow-2xl overflow-hidden transform hover:scale-105 transition-all duration-500 hover:shadow-3xl">
                    <img
                      src="/imagenes_stock_paginaprincipal/WhatsApp Image 2025-10-09 at 2.59.11 PM (1).jpeg"
                      alt="Pastafrolas y dulces artesanales"
                      className="w-full h-64 object-cover"
                    />
                  </div>
                  <div className="bg-white rounded-3xl shadow-2xl overflow-hidden transform hover:scale-105 transition-all duration-500 hover:shadow-3xl">
                    <img
                      src="/imagenes_stock_paginaprincipal/medialuna.jpeg"
                      alt="Medialunas"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                </div>
              </div>
              <div className="absolute top-8 right-8 bg-black text-white px-8 py-4 rounded-full font-bold text-lg shadow-2xl animate-bounce-slow">
                Recién Horneado
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 space-y-6 animate-fade-in-up">
            <h2 className="text-4xl lg:text-5xl font-bold text-black text-balance">Nuestros Productos Destacados</h2>
            <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto text-pretty">
              Descubre nuestras especialidades, elaboradas con amor y tradición familiar
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                image: "/imagenes_stock_paginaprincipal/panes.jpeg",
                title: "Pan Artesanal",
                description:
                  "Panes tradicionales horneados diariamente con masa madre y ingredientes naturales de primera calidad. Elaborados con técnicas artesanales transmitidas de generación en generación.",
              },
              {
                image: "/imagenes_stock_paginaprincipal/WhatsApp Image 2025-10-09 at 2.59.14 PM (3).jpeg",
                title: "Dulces",
                description:
                  "Alfajores, Pasta frolas, tartas dulces, budines y otras delicias clásicas elaboradas con recetas familiares, ideales para compartir en cada mesa y disfrutar sabores artesanales.",
              },
              {
                image: "/imagenes_stock_paginaprincipal/medialuna.jpeg",
                title: "Medialunas",
                description:
                  "Medialunas recién horneadas para acompañar tu desayuno o merienda, elaboradas con la mejor calidad y máxima frescura.",
              },
            ].map((product, index) => (
              <div
                key={index}
                className="group bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-3 animate-fade-in-up"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="overflow-hidden">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.title}
                    className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <div className="p-10 space-y-6">
                  <h3 className="text-2xl font-bold text-black">{product.title}</h3>
                  <p className="text-gray-600 leading-relaxed text-pretty text-lg">{product.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-6">
                  <img
                    src="/imagenes_stock_paginaprincipal/WhatsApp Image 2025-10-09 at 2.59.14 PM.jpeg"
                    alt="Panadería tradicional"
                    className="w-full h-48 object-cover rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105"
                  />
                  <img
                    src="/imagenes_stock_paginaprincipal/pan_hamburguesa.jpg"
                    alt="Panes para hamburguesas"
                    className="w-full h-64 object-cover rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105"
                  />
                </div>
                <div className="space-y-6 pt-12">
                  <img
                    src="/imagenes_stock_paginaprincipal/facturas landing.jpg"
                    alt="Facturas artesanales"
                    className="w-full h-64 object-cover rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105"
                  />
                  <img
                    src="/imagenes_stock_paginaprincipal/prepizza.jpg"
                    alt="Prepizzas artesanales"
                    className="w-full h-48 object-cover rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105"
                  />
                </div>
              </div>
              <div className="absolute -bottom-8 -right-8 bg-black text-white p-8 lg:p-10 rounded-3xl shadow-2xl animate-float">
                <p className="text-4xl lg:text-5xl font-bold">20+</p>
                <p className="text-gray-300 font-medium text-lg lg:text-xl">Años de tradición</p>
              </div>
            </div>
            <div className="space-y-10 order-1 lg:order-2 animate-fade-in-left">
              <div className="space-y-8">
                <h2 className="text-4xl lg:text-5xl font-bold text-black text-balance">Nosotros</h2>
                <div className="space-y-6 text-gray-700">
                  <h3 className="text-2xl font-bold text-black">Nuestra Logística y Distribución</h3>
                  <p className="text-xl leading-relaxed text-pretty">
                    Desde DDA Oeste Pan SRL garantizamos entregas seguras, rápidas y eficientes.
                    Ofrecemos atención técnica y comercial personalizada que nos distingue en el mercado.
                  </p>
                  <p className="text-xl leading-relaxed text-pretty">
                    Nuestra visión es seguir creciendo con la misma pasión que nos vio empezar, para convertirnos en el proveedor de panificados congelados más importante, reconocido por nuestra calidad y atención.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="text-center p-8 bg-gray-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                  <p className="text-4xl font-bold text-black">1000+</p>
                  <p className="text-gray-600 font-medium text-lg">Familias satisfechas</p>
                </div>
                <div className="text-center p-8 bg-gray-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                  <p className="text-4xl font-bold text-black">50+</p>
                  <p className="text-gray-600 font-medium text-lg">Productos únicos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 space-y-6">
            <h2 className="text-4xl lg:text-5xl font-bold text-black text-balance">Hacé tu Pedido</h2>
            <p className="text-xl lg:text-2xl text-gray-600 text-pretty">
              Armá tu pedido, pasalo por WhatsApp o entrá a la app
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
            {[
              "/imagenes_stock_paginaprincipal/WhatsApp Image 2025-10-09 at 2.59.16 PM (2).jpeg",
              "/imagenes_stock_paginaprincipal/WhatsApp Image 2025-10-09 at 2.59.14 PM (2).jpeg",
              "/imagenes_stock_paginaprincipal/WhatsApp Image 2025-10-09 at 2.59.14 PM (3).jpeg",
              "/imagenes_stock_paginaprincipal/WhatsApp Image 2025-10-09 at 2.59.14 PM (4).jpeg",
            ].map((src, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <img
                  src={src || "/placeholder.svg"}
                  alt={`Imagen ${index + 1} de la panadería`}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="bg-white rounded-3xl p-10 space-y-8 shadow-xl hover:shadow-2xl transition-all duration-300">
              <h3 className="text-3xl font-bold text-black flex items-center gap-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Horarios de Atención
              </h3>
              <div className="space-y-4">
                {[
                  { day: "Lunes a Viernes", hours: "08:00 - 16:00" },
                  { day: "Sábados", hours: "Cerrado" },
                  { day: "Domingos", hours: "Cerrado" },
                  { day: "Feriados", hours: "Entregando" },
                ].map((schedule, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors duration-200 rounded-lg px-4"
                  >
                    <span className="text-gray-800 font-medium text-lg">{schedule.day}</span>
                    <span className="text-black font-bold text-lg">{schedule.hours}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-black text-white rounded-3xl p-10 space-y-8 shadow-xl hover:shadow-2xl transition-all duration-300">
              <h3 className="text-3xl font-bold flex items-center gap-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Contacto y Pedidos
              </h3>
              <div className="space-y-6">
                {[
                  {
                    icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
                    text: "Administración: 11-2394-9875\nLogística: 11-7372-1395",
                  },
                  {
                    icon: "M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2 2v10a2 2 0 002 2z",
                    text: "oestepansrl@gmail.com",
                  },
                  {
                    icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
                    text: "Horario de atención de administración:\nLunes a Viernes, de 08:00 a 16:00 hs.",
                  },
                ].map((contact, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 hover:bg-gray-800 p-4 rounded-lg transition-colors duration-200"
                  >
                    <svg className="w-6 h-6 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={contact.icon} />
                    </svg>
                    <span className="whitespace-pre-line text-lg">{contact.text}</span>
                  </div>
                ))}
              </div>
              <Link href="/register" className="block mt-8">
                <Button
                  size="lg"
                  className="w-full bg-white text-black hover:bg-gray-100 font-bold shadow-lg hover:shadow-xl transition-all duration-300 text-lg py-4"
                >
                  Registrarse Ahora
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="space-y-8">
              <div className="flex items-center gap-6">
                <Image src="/logo_oestepan.png" alt="Oeste Pan" width={250} height={80} className="object-contain" />
                <div>
                  <h3 className="text-3xl font-bold text-white-800">Oeste Pan</h3>
                  <p className="text-gray-300 text-lg">Panadería Artesanal</p>
                </div>
              </div>
              <p className="text-gray-300 max-w-md leading-relaxed text-pretty text-lg">
                Desde 2001, llevando a tu mesa el mejor pan artesanal con la pasión y la tradición de una panadería
                familiar.
              </p>
              <div className="flex gap-6">
                {[
                  "M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z",
                  "M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z",
                  "M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.719-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.739.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.90-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z",
                  "M12.007 0C5.37 0 0 5.37 0 12.007c0 5.25 3.4 9.706 8.092 11.275.592-.109 1.09-.502 1.09-1.09v-3.84c-3.29.716-3.986-1.588-3.986-1.588-.538-1.365-1.314-1.729-1.314-1.729-1.074-.734.081-.719.081-.719 1.188.084 1.813 1.22 1.813 1.22 1.056 1.809 2.769 1.287 3.444.984.107-.765.414-1.287.752-1.582-2.625-.298-5.387-1.313-5.387-5.844 0-1.291.461-2.346 1.219-3.173-.122-.299-.529-1.501.116-3.128 0 0 .994-.318 3.254 1.213.944-.263 1.956-.394 2.963-.399 1.005.005 2.017.136 2.963.399 2.258-1.531 3.25-1.213 3.25-1.213.647 1.627.24 2.829.118 3.128.76.827 1.216 1.882 1.216 3.173 0 4.543-2.768 5.543-5.405 5.833.425.366.804 1.088.804 2.193v3.25c0 .593.5 1.005 1.1 1.089C20.607 21.712 24.007 17.256 24.007 12.007 24.007 5.37 18.637.001 12.007.001z",
                ].map((path, index) => (
                  <a
                    key={index}
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors p-3 hover:bg-gray-800 rounded-xl transform hover:scale-110 transition-all duration-300"
                  >
                    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                      <path d={path} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            <div className="space-y-8">
              <h4 className="font-bold text-2xl text-white">Información de Contacto</h4>
              <div className="space-y-6 text-gray-300">
                <div className="flex flex-col gap-4 hover:bg-gray-800 p-4 rounded-lg transition-colors duration-200">
                  <div className="flex items-center gap-4">
                    <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <span className="text-lg">Administración: 11-2394-9875</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <span className="text-lg">Logística: 11-7372-1395</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 hover:bg-gray-800 p-4 rounded-lg transition-colors duration-200">
                  <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-lg">oestepansrl@gmail.com</span>
                </div>
                <div className="pt-6 space-y-3">
                  <p className="text-white font-bold text-xl">Horarios de Atención:</p>
                  <div className="text-base space-y-2">
                    <p>Administración - Lunes a Viernes: 08:00 - 16:00</p>
                    <p>Sábados y Domingos: Cerrado</p>
                    <p>Feriados: Entregando</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-10 mt-16 text-center text-gray-400">
            <p className="text-lg">&copy; 2024 Oeste Pan SRL. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
