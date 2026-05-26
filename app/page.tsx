'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, LogIn } from 'lucide-react'
import { useUserStore } from '@/lib/store/useUserStore'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { seedSimulatedUsers, loginWithEmail, setActiveProdiCookie } from '@/app/actions/userActions'

export default function Home() {
  const { activeRole, _hasHydrated, setActiveRole, setRoles, setUserName, setUserId } = useUserStore()
  const router = useRouter()
  const [isInitializing, setIsInitializing] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Seed DB if it's empty on first load
    seedSimulatedUsers().then(() => setIsInitializing(false))
  }, [])

  useEffect(() => {
    if (_hasHydrated && activeRole) {
      if (activeRole === 'head_of_department') {
        router.push('/qa/curriculum')
      } else {
        router.push(`/${activeRole}`)
      }
    }
  }, [_hasHydrated, activeRole, router])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const res = await loginWithEmail(email, password)

    if (res.success && res.user) {
      console.log('Login successful. res.user:', res.user)
      setActiveRole(res.user.activeRole as 'student' | 'teacher' | 'qa' | 'admin' | 'super_admin')
      setRoles(res.user.roles || [])
      setUserName(res.user.name)
      setUserId(res.user.id)
      
      const userDepartments = res.user.departments || []
      useUserStore.getState().setProdis(userDepartments)
      if (res.user.departmentRoles) {
        useUserStore.getState().setDepartmentRoles(res.user.departmentRoles)
      }

      // Auto-select the first department if available
      if (userDepartments.length > 0) {
        const defaultDepId = userDepartments[0].id
        useUserStore.getState().setActiveDepartmentId(defaultDepId)
        await setActiveProdiCookie(defaultDepId)
      }

      if (res.user.activeRole === 'head_of_department') {
          router.push('/qa/curriculum')
      } else {
          const path = `/${res.user.activeRole}`
          router.push(path)
      }
    } else {
      setError(res.error || "Gagal masuk. Periksa kembali kredensial Anda.")
      setLoading(false)
    }
  }

  if (isInitializing || (_hasHydrated && activeRole)) {
    return <div className="min-h-screen flex items-center justify-center bg-muted/10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center space-y-8 bg-muted/10 py-12 px-4">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-extrabold tracking-tight lg:text-6xl text-primary">OBLMS</h1>
        <p className="text-xl text-muted-foreground">Outcome Based Learning Management System</p>
      </div>

      <Card className="w-full max-w-md shadow-lg border-primary/20">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Masuk ke Akun</CardTitle>
          <CardDescription className="text-center">
            Masukkan email dan password untuk melanjutkan
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="user1@kampus.edu"
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>

            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-100 rounded-md">
                {error}
              </div>
            )}

            <div className="pt-2 text-xs text-muted-foreground space-y-1 bg-muted/30 p-3 rounded-md">
              <p className="font-semibold text-foreground/80">Akun Simulasi (Password: password123):</p>
              <ul className="list-disc list-inside">
                <li><span className="font-medium text-primary">Teacher:</span> user1@kampus.edu s.d. user3@kampus.edu</li>
                <li><span className="font-medium text-amber-600">QA:</span> user4@kampus.edu</li>
                <li><span className="font-medium text-rose-600">Super Admin / Admin:</span> user5@kampus.edu / user6@kampus.edu</li>
                <li><span className="font-medium text-emerald-600">Student:</span> user7@kampus.edu s.d. user10@kampus.edu</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full text-md py-6" type="submit" disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <LogIn className="mr-2 h-5 w-5" />
              )}
              {loading ? 'Memproses...' : 'Masuk Dashboard'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
