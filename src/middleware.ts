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
          try {
            const allCookies = request.cookies.getAll();
            // Solo log en desarrollo y sin datos sensibles
            if (process.env.NODE_ENV === 'development') {
              console.log('Middleware - Cookie count:', allCookies.length);
            }
            return allCookies;
          } catch (error) {
            console.error('Error getting cookies in middleware:', error);
            return [];
          }
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value);
              supabaseResponse.cookies.set(name, value, options);
            });
          } catch (error) {
            console.error('Error setting cookies in middleware:', error);
          }
        },
      },
    }
  );

  let session = null;
  let sessionError = null;
  
  try {
    const sessionData = await supabase.auth.getSession();
    session = sessionData.data.session;
    sessionError = sessionData.error;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Middleware - Session status:', session ? 'active' : 'none');
      if (sessionError) {
        console.log('Middleware - Session error:', sessionError.message);
      }
    }
  } catch (error) {
    console.error('Error getting session in middleware:', error);
    // En caso de error, continuar sin sesión
    session = null;
    sessionError = error;
  }

  const { pathname } = request.nextUrl;

  const publicRoutes = [
    '/',
    '/catalog',
    '/catalog/',
    '/api/products',
    '/debug-session', // Página de debug accesible sin autenticación
    '/debug-login', // Página de debug de login accesible sin autenticación
    '/test-orders', // Página de test de orders accesible sin autenticación
    '/auth/callback', // Callback de confirmación de email
    '/diagnostico-auth', // Página de diagnóstico de autenticación
  ];

  const authRoutes = ['/login', '/register', '/auth/forgot-password'];
  const protectedRoutes = ['/dashboard', '/profile', '/orders', '/admin'];
  const adminRoutes = ['/admin'];
  const clientRoutes = ['/orders', '/cart'];

  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || 
    pathname.startsWith(route + '/') ||
    (route === '/catalog' && pathname.startsWith('/catalog'))
  );

  if (isPublicRoute) {
    return supabaseResponse;
  }

  let user = null;
  
  try {
    const userData = await supabase.auth.getUser();
    user = userData.data.user;
    
    if (userData.error) {
      console.log('Middleware - User error:', userData.error.message);
    }
  } catch (error) {
    console.error('Error getting user in middleware:', error);
    // En caso de error, continuar sin usuario
    user = null;
  }

  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  const isAdminRoute = adminRoutes.some(route => 
    pathname.startsWith(route)
  );
  const isClientRoute = clientRoutes.some(route => 
    pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  );

  if (!user && isProtectedRoute) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (user && (isAdminRoute || isClientRoute)) {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (process.env.NODE_ENV === 'development') {
        console.log('Middleware - User:', user.id, 'Path:', pathname, 'Profile role:', profile?.role, 'Error:', error);
      }

      if (error) {
        console.error('Error fetching profile in middleware:', error);
        return supabaseResponse;
      }

      if (!profile) {
        console.warn('No profile found for user:', user.id);
        return NextResponse.redirect(new URL('/login', request.url));
      }

      if (isAdminRoute && profile.role !== 'admin') {
        console.log('Redirecting non-admin from admin route:', user.id, profile.role);
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

      if (isClientRoute && profile.role !== 'cliente') {
        console.log('Redirecting non-client from client route:', user.id, profile.role);
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } catch (error) {
      console.error('Error checking user role:', error);
      return supabaseResponse;
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};