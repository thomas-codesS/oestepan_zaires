import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { pathname } = request.nextUrl

  const publicRoutes = [
    '/',
    '/catalog',
    '/api/products',
    '/auth/callback',
  ]

  const authRoutes = ['/login', '/register', '/forgot-password']
  const protectedRoutes = ['/dashboard', '/profile', '/orders', '/admin', '/checkout']
  const adminRoutes = ['/admin']

  const isPublicRoute = publicRoutes.some(route =>
    pathname === route ||
    pathname.startsWith(route + '/') ||
    (route === '/catalog' && pathname.startsWith('/catalog'))
  )

  if (isPublicRoute) {
    // Still refresh the session for public routes (keeps cookies alive)
    await supabase.auth.getUser()
    return supabaseResponse
  }

  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))

  // Single auth call - getUser() validates the JWT and refreshes the session
  const { data: { user } } = await supabase.auth.getUser()

  if (!user && isProtectedRoute) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (user && isAdminRoute) {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (error || !profile) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    if (profile.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
