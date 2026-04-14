import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register')
  const isApi = pathname.startsWith('/api/')
  const isStatic = pathname.startsWith('/_next') || pathname.startsWith('/favicon')

  if (isAuthPage || isApi || isStatic) return NextResponse.next()

  // Check for session cookie (name differs by environment)
  const cookieName = process.env.NODE_ENV === 'production'
    ? '__Secure-authjs.session-token'
    : 'authjs.session-token'

  const sessionCookie = req.cookies.get(cookieName)

  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
}
