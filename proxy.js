// proxy.js
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function proxy(request) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
  const isLoginRoute = request.nextUrl.pathname === '/admin/login'

  // Ruta de preview de diseño: sin sesión, sólo en desarrollo. En producción
  // esta rama no existe y la página además devuelve 404.
  const isPreviewRoute = request.nextUrl.pathname.startsWith('/admin/preview')

  if (isPreviewRoute && process.env.NODE_ENV !== 'production') {
    return response
  }

  if (isAdminRoute && !isLoginRoute) {
    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    const role = user.app_metadata?.role
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*'],
}