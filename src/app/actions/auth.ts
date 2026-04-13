'use server'

import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { encode } from '@auth/core/jwt'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function loginAction(formData: FormData) {
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const password = formData.get('password') as string

  if (!email || !password) return { error: 'יש למלא את כל השדות' }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return { error: 'מייל או סיסמה שגויים' }

  const match = await bcrypt.compare(password, user.passwordHash)
  if (!match) return { error: 'מייל או סיסמה שגויים' }

  const secret = process.env.AUTH_SECRET!
  const cookieName = 'authjs.session-token'

  const token = await encode({
    token: {
      sub: user.id,
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    secret,
    salt: cookieName,
  })

  const cookieJar = await cookies()
  cookieJar.set(cookieName, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })

  redirect(user.role === 'ADMIN' ? '/admin' : '/dashboard')
}

export async function registerAction(
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  const name = (formData.get('name') as string)?.trim()
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const password = formData.get('password') as string

  if (!name || !email || !password) {
    return { error: 'יש למלא את כל השדות' }
  }
  if (password.length < 6) {
    return { error: 'הסיסמה חייבת להכיל לפחות 6 תווים' }
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return { error: 'כתובת המייל כבר רשומה במערכת' }
  }

  const passwordHash = await bcrypt.hash(password, 12)
  await prisma.user.create({
    data: { name, email, passwordHash },
  })

  redirect('/login?registered=1')
}
