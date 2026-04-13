'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { registerAction } from '@/app/actions/auth'
import Link from 'next/link'

export default function RegisterPage() {
  const [state, action, pending] = useActionState(registerAction, undefined)

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-pink-50 to-purple-50">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="text-center">
          <div className="text-4xl mb-2">🏋️‍♀️</div>
          <CardTitle className="text-2xl">הרשמה למערכת</CardTitle>
          <CardDescription>צרי חשבון חדש</CardDescription>
        </CardHeader>
        <CardContent>
          {state?.error && (
            <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-800 text-center">
              {state.error}
            </div>
          )}
          <form action={action} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">שם מלא</Label>
              <Input id="name" name="name" placeholder="שם מלא" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">כתובת מייל</Label>
              <Input id="email" name="email" type="email" placeholder="your@email.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">סיסמה</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="לפחות 6 תווים"
                minLength={6}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? 'נרשמת...' : 'הרשמה'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            יש לך חשבון?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              כניסה
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
