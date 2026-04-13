'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { loginAction } from '@/app/actions/auth'
import Link from 'next/link'
import { Suspense } from 'react'

function LoginContent() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const registered = searchParams.get('registered')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    try {
      const result = await loginAction(formData)
      if (result?.error) setError(result.error)
      else router.push('/dashboard')
    } catch {
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-pink-50 to-purple-50">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="text-center">
          <div className="text-4xl mb-2">💪</div>
          <CardTitle className="text-2xl">כניסה למערכת</CardTitle>
          <CardDescription>סטודיו כוח לנשים</CardDescription>
        </CardHeader>
        <CardContent>
          {registered && (
            <div className="mb-4 rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-800 text-center">
              נרשמת בהצלחה! כנסי עם הפרטים שלך
            </div>
          )}
          {error && (
            <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-800 text-center">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">כתובת מייל</Label>
              <Input id="email" name="email" type="email" placeholder="your@email.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">סיסמה</Label>
              <Input id="password" name="password" type="password" placeholder="••••••" required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'מתחברת...' : 'כניסה'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            אין לך חשבון?{' '}
            <Link href="/register" className="font-medium text-primary hover:underline">
              הרשמי כאן
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}
