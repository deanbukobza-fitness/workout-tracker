import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register')
  const isApiAuth = pathname.startsWith('/api/auth')
  const isPublic = isAuthPage || isApiAuth

  if (!session && !isPublic) {
    const loginUrl = new URL('/login', req.url)
    return NextResponse.redirect(loginUrl)
  }

  if (session && isAuthPage) {
    const role = session.user?.role
    const dest = role === 'ADMIN' ? '/admin' : '/dashboard'
    return NextResponse.redirect(new URL(dest, req.url))
  }

  if (session && pathname.startsWith('/admin') && session.user?.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
}
