'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, LogIn } from 'lucide-react'
import { useUserStore } from '@/lib/store/useUserStore'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { seedSimulatedUsers, loginWithEmail, setActiveProdiCookie, forceChangePasswordAction, forceCompleteProfileAction } from '@/app/actions/userActions'
import { useToast } from '@/hooks/use-toast'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function Home() {
  const { activeRole, _hasHydrated, setActiveRole, setRoles, setUserName, setUserId } = useUserStore()
  const router = useRouter()
  const [isInitializing, setIsInitializing] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { toast } = useToast()

  // Captcha state
  const [captchaQuestion, setCaptchaQuestion] = useState('')
  const [captchaAnswer, setCaptchaAnswer] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1
    const num2 = Math.floor(Math.random() * 10) + 1
    setCaptchaQuestion(`${num1} + ${num2}`)
    setCaptchaAnswer(num1 + num2)
    setUserAnswer('')
  }

  // Force Password Change state
  const [forceChangeEmail, setForceChangeEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Force Profile Completion state
  const [forceProfileEmail, setForceProfileEmail] = useState('')
  const [missingRole, setMissingRole] = useState('')
  // Teacher missing fields
  const [nidn, setNidn] = useState('')
  const [nip, setNip] = useState('')
  const [gelarDepan, setGelarDepan] = useState('')
  const [gelarBelakang, setGelarBelakang] = useState('')
  const [isDlb, setIsDlb] = useState(false)
  // Student missing fields
  const [nim, setNim] = useState('')
  const [angkatan, setAngkatan] = useState('')
  const [jenisKelamin, setJenisKelamin] = useState('')
  const [alamat, setAlamat] = useState('')
  // Used to login again after profile completion
  const [savedPassword, setSavedPassword] = useState('')

  useEffect(() => {
    // Seed DB if it's empty on first load
    seedSimulatedUsers().then(() => setIsInitializing(false))
    generateCaptcha()
  }, [])

  useEffect(() => {
    if (_hasHydrated && activeRole) {
      if (activeRole === 'head_of_department') {
        window.location.href = '/qa/curriculum'
      } else if (activeRole === 'dean') {
        window.location.href = '/dean/analytics'
      } else if (activeRole === 'rector') {
        window.location.href = '/rector/analytics'
      } else {
        window.location.href = `/${activeRole}`
      }
    }
  }, [_hasHydrated, activeRole])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (parseInt(userAnswer) !== captchaAnswer) {
      setError('Jawaban perhitungan salah. Silakan coba lagi.')
      generateCaptcha()
      setLoading(false)
      return
    }

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const res = await loginWithEmail(email, password)

    if (res.success && res.requirePasswordChange) {
      setForceChangeEmail(res.email)
      setLoading(false)
      toast({ title: 'Perhatian', description: 'Anda diwajibkan untuk mengganti kata sandi demi keamanan.', variant: 'default' })
      return
    }

    if (res.success && res.requireProfileCompletion) {
      setForceProfileEmail(res.email)
      setMissingRole(res.missingRole)
      setSavedPassword(password)
      setLoading(false)
      toast({ title: 'Perhatian', description: 'Anda wajib melengkapi profil sebelum melanjutkan.', variant: 'default' })
      return
    }

    if (res.success && res.user) {
      console.log('Login successful. res.user:', res.user)
      setActiveRole(res.user.activeRole as any)
      setRoles(res.user.roles || [])
      setUserName(res.user.name)
      setUserId(res.user.id)
      
      const userDepartments = res.user.departments || []
      useUserStore.getState().setProdis(userDepartments)
      if (res.user.departmentRoles) {
        useUserStore.getState().setDepartmentRoles(res.user.departmentRoles)
      }
      if ((res.user as any).facultyName) {
        useUserStore.getState().setFacultyName((res.user as any).facultyName)
      }

      let defaultDeps = userDepartments
      if (res.user.activeRole !== 'super_admin' && res.user.departmentRoles) {
          defaultDeps = res.user.departmentRoles
              .filter((dr: any) => dr.role.split(',').map((r: string) => r.trim()).includes(res.user.activeRole) && dr.department)
              .map((dr: any) => dr.department)
      }

      // Auto-select the first department if available
      if (defaultDeps.length > 0) {
        const defaultDepId = defaultDeps[0].id
        useUserStore.getState().setActiveDepartmentId(defaultDepId)
        await setActiveProdiCookie(defaultDepId)
      }

      if (res.user.activeRole === 'head_of_department') {
          window.location.href = '/qa/curriculum'
      } else if (res.user.activeRole === 'dean') {
          window.location.href = '/dean/analytics'
      } else if (res.user.activeRole === 'rector') {
          window.location.href = '/rector/analytics'
      } else {
          const path = `/${res.user.activeRole}`
          window.location.href = path
      }
    } else {
      setError(res.error || "Gagal masuk. Periksa kembali kredensial Anda.")
      generateCaptcha()
      setLoading(false)
    }
  }

  const handleForcePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password baru tidak cocok.')
      return
    }
    if (newPassword.length < 6) {
      setError('Password baru minimal 6 karakter.')
      return
    }

    setLoading(true)
    setError('')
    const res = await forceChangePasswordAction(forceChangeEmail, newPassword)
    
    if (res.success) {
      toast({ title: 'Berhasil', description: 'Password berhasil diubah. Anda akan langsung login sekarang.' })
      // Auto login with new password
      const formData = new FormData()
      formData.set('email', forceChangeEmail)
      formData.set('password', newPassword)
      const fakeEvent = {
        preventDefault: () => {},
        currentTarget: {
          elements: { email: { value: forceChangeEmail }, password: { value: newPassword } }
        }
      } as any
      // A little hack to reuse handleSubmit
      const resLogin = await loginWithEmail(forceChangeEmail, newPassword)
      if (resLogin.success && resLogin.user) {
        setActiveRole(resLogin.user.activeRole as any)
        setRoles(resLogin.user.roles || [])
        setUserName(resLogin.user.name)
        setUserId(resLogin.user.id)
        
        let path = `/${resLogin.user.activeRole}`
        if (resLogin.user.activeRole === 'head_of_department') path = '/qa/curriculum'
        else if (resLogin.user.activeRole === 'dean') path = '/dean/analytics'
        else if (resLogin.user.activeRole === 'rector') path = '/rector/analytics'
        window.location.href = path
      } else {
        setForceChangeEmail('')
        setLoading(false)
      }
    } else {
      setError(res.error || 'Gagal mengubah password.')
      setLoading(false)
    }
  }

  const handleForceProfileCompletion = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    let data = {}
    if (missingRole === 'teacher') {
        data = { nidn, nip, gelarDepan, gelarBelakang, isDlb }
    } else if (missingRole === 'student') {
        data = { nim, angkatan, jenisKelamin, alamat }
    }

    const res = await forceCompleteProfileAction(forceProfileEmail, missingRole, data)
    
    if (res.success) {
      toast({ title: 'Berhasil', description: 'Profil berhasil dilengkapi. Anda akan masuk sekarang.' })
      // Auto login with saved password
      const resLogin = await loginWithEmail(forceProfileEmail, savedPassword)
      if (resLogin.success && resLogin.user) {
        setActiveRole(resLogin.user.activeRole as any)
        setRoles(resLogin.user.roles || [])
        setUserName(resLogin.user.name)
        setUserId(resLogin.user.id)
        
        let path = `/${resLogin.user.activeRole}`
        if (resLogin.user.activeRole === 'head_of_department') path = '/qa/curriculum'
        else if (resLogin.user.activeRole === 'dean') path = '/dean/analytics'
        else if (resLogin.user.activeRole === 'rector') path = '/rector/analytics'
        window.location.href = path
      } else {
        setForceProfileEmail('')
        setLoading(false)
      }
    } else {
      setError(res.error || 'Gagal menyimpan profil.')
      setLoading(false)
    }
  }

  if (isInitializing || (_hasHydrated && activeRole)) {
    return <div className="min-h-screen flex items-center justify-center bg-muted/10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center space-y-8 bg-muted/10 py-12 px-4">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-4">
          <Image src="/logo-icon.png" alt="OBLMS Logo Light" width={80} height={80} className="object-contain drop-shadow-md dark:hidden" />
          <Image src="/logo-dark-v2.png" alt="OBLMS Logo Dark" width={80} height={80} className="object-contain drop-shadow-md hidden dark:block" />
          <h1 className="text-5xl font-extrabold tracking-tight lg:text-6xl text-primary">OBLMS</h1>
        </div>
        <p className="text-xl text-muted-foreground">Outcome Based Learning Management System</p>
      </div>

      {forceProfileEmail ? (
        <Card className="w-full max-w-md shadow-lg border-primary/20">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Wajib Lengkapi Profil</CardTitle>
            <CardDescription className="text-center">
              Untuk melanjutkan ke sistem, lengkapi informasi profil {missingRole === 'teacher' ? 'Dosen' : 'Mahasiswa'} Anda.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleForceProfileCompletion}>
            <CardContent className="space-y-4">
              {missingRole === 'teacher' && (
                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2 col-span-2">
                          <div className="flex flex-col space-y-2 bg-muted/20 p-3 rounded border">
                              <div className="flex items-center space-x-2">
                                  <Checkbox id="isDlbForce" checked={isDlb} onCheckedChange={(checked) => setIsDlb(checked === true)} disabled={loading} />
                                  <Label htmlFor="isDlbForce" className="cursor-pointer font-medium text-amber-700">Saya adalah Dosen Luar Biasa (DLB)</Label>
                              </div>
                              <p className="text-xs text-muted-foreground ml-6">
                                  Centang jika Anda adalah praktisi atau dosen tidak tetap yang tidak ber-homebase penuh di institusi ini.
                              </p>
                          </div>
                      </div>
                      <div className="space-y-2 col-span-2 sm:col-span-1">
                          <Label htmlFor="nidn">NIDN</Label>
                          <Input id="nidn" value={nidn} onChange={(e) => setNidn(e.target.value)} placeholder="0123456789" disabled={loading} />
                      </div>
                      <div className="space-y-2 col-span-2 sm:col-span-1">
                          <Label htmlFor="nip">NIP / NIK</Label>
                          <Input id="nip" value={nip} onChange={(e) => setNip(e.target.value)} placeholder="1980..." disabled={loading} />
                      </div>
                      <div className="space-y-2 col-span-2 sm:col-span-1">
                          <Label htmlFor="gelarDepan">Gelar Depan</Label>
                          <Input id="gelarDepan" value={gelarDepan} onChange={(e) => setGelarDepan(e.target.value)} placeholder="Dr., Prof." disabled={loading} />
                      </div>
                      <div className="space-y-2 col-span-2 sm:col-span-1">
                          <Label htmlFor="gelarBelakang">Gelar Belakang</Label>
                          <Input id="gelarBelakang" value={gelarBelakang} onChange={(e) => setGelarBelakang(e.target.value)} placeholder="S.T., M.Kom." disabled={loading} />
                      </div>
                  </div>
              )}

              {missingRole === 'student' && (
                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2 col-span-2 sm:col-span-1">
                          <Label htmlFor="nim">NIM</Label>
                          <Input id="nim" value={nim} onChange={(e) => setNim(e.target.value)} placeholder="20101234" disabled={loading} required />
                      </div>
                      <div className="space-y-2 col-span-2 sm:col-span-1">
                          <Label htmlFor="angkatan">Angkatan (Tahun)</Label>
                          <Input id="angkatan" type="number" value={angkatan} onChange={(e) => setAngkatan(e.target.value)} placeholder="2020" disabled={loading} required />
                      </div>
                      <div className="space-y-2 col-span-2 sm:col-span-1">
                          <Label htmlFor="jenisKelamin">Jenis Kelamin</Label>
                          <Select value={jenisKelamin} onValueChange={setJenisKelamin} disabled={loading} required>
                              <SelectTrigger id="jenisKelamin">
                                  <SelectValue placeholder="Pilih" />
                              </SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                                  <SelectItem value="Perempuan">Perempuan</SelectItem>
                              </SelectContent>
                          </Select>
                      </div>
                      <div className="space-y-2 col-span-2">
                          <Label htmlFor="alamat">Alamat Lengkap</Label>
                          <Input id="alamat" value={alamat} onChange={(e) => setAlamat(e.target.value)} placeholder="Jl. Raya Kampus No. 1..." disabled={loading} required />
                      </div>
                  </div>
              )}

              {error && (
                <div className="p-3 text-sm text-red-500 bg-red-100 rounded-md">
                  {error}
                </div>
              )}
            </CardContent>
            <CardFooter className="mt-4 pt-4 border-t border-muted/50">
              <Button className="w-full text-md py-6" type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                Simpan & Masuk
              </Button>
            </CardFooter>
          </form>
        </Card>
      ) : forceChangeEmail ? (
        <Card className="w-full max-w-md shadow-lg border-primary/20">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Pembaruan Keamanan Wajib</CardTitle>
            <CardDescription className="text-center">
              Admin telah mereset password Anda. Anda wajib membuat password baru untuk melanjutkan.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleForcePasswordChange}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Password Baru</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  required
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="p-3 text-sm text-red-500 bg-red-100 rounded-md">
                  {error}
                </div>
              )}
            </CardContent>
            <CardFooter className="mt-4 pt-4 border-t border-muted/50">
              <Button className="w-full text-md py-6" type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                Simpan & Masuk
              </Button>
            </CardFooter>
          </form>
        </Card>
      ) : (
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
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="captcha">Hitung: <span className="font-bold text-primary tracking-widest">{captchaQuestion} = ?</span></Label>
                <Input
                  id="captcha"
                  type="number"
                  placeholder="Masukkan jawaban"
                  value={userAnswer}
                  onChange={e => setUserAnswer(e.target.value)}
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
            <CardFooter className="flex flex-col gap-4">
              <Button className="w-full text-md py-6" type="submit" disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <LogIn className="mr-2 h-5 w-5" />
                )}
                {loading ? 'Memproses...' : 'Masuk Dashboard'}
              </Button>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Belum punya akun?{' '}
                  <Link href="/register" className="font-semibold text-primary hover:underline">
                    Daftar di sini
                  </Link>
                </p>
              </div>
            </CardFooter>
          </form>
        </Card>
      )}
    </div>
  )
}
