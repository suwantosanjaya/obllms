'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, UserPlus, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Checkbox } from '@/components/ui/checkbox'
import Link from 'next/link'
import { registerUser } from '@/app/actions/authActions'

export default function RegisterForm({ universities }: { universities: any[] }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

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

    useEffect(() => {
        generateCaptcha()
    }, [])

    // Form state
    const [role, setRole] = useState('')
    const [univId, setUnivId] = useState('')
    const [facId, setFacId] = useState('')
    const [deptId, setDeptId] = useState('')

    // Teacher specific fields
    const [nidn, setNidn] = useState('')
    const [nip, setNip] = useState('')
    const [gelarDepan, setGelarDepan] = useState('')
    const [gelarBelakang, setGelarBelakang] = useState('')
    const [isDlb, setIsDlb] = useState(false)

    // Student specific fields
    const [nim, setNim] = useState('')
    const [angkatan, setAngkatan] = useState('')
    const [jenisKelamin, setJenisKelamin] = useState('')
    const [alamat, setAlamat] = useState('')

    const selectedUniv = universities.find((u: any) => u.id === univId)
    const faculties = selectedUniv?.faculties || []
    const selectedFac = faculties.find((f: any) => f.id === facId)
    const departments = selectedFac?.departments || []

    const needsDepartment = ['student', 'teacher', 'qa', 'admin'].includes(role) // As per plan, all these select department (Admin might optionally, but for simplicity let's require it or just make it optional for admin. Wait, let's require for student, teacher, qa. For Admin, let's also require it since it's a "Department Admin")

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError('')

        const formData = new FormData(e.currentTarget)
        const name = formData.get('name') as string
        const email = formData.get('email') as string
        const password = formData.get('password') as string
        const confirm = formData.get('confirm_password') as string

        if (parseInt(userAnswer) !== captchaAnswer) {
            setError('Jawaban perhitungan salah. Silakan coba lagi.')
            generateCaptcha()
            setLoading(false)
            return
        }

        if (password !== confirm) {
            setError('Password dan Konfirmasi Password tidak cocok.')
            setLoading(false)
            return
        }

        if (needsDepartment && !deptId) {
            setError('Silakan pilih Program Studi / Program Studi Anda.')
            setLoading(false)
            return
        }

        const res = await registerUser({
            name, 
            email, 
            passwordPlain: password, 
            role, 
            departmentId: needsDepartment ? deptId : undefined,
            ...(role === 'teacher' ? { nidn, nip, gelarDepan, gelarBelakang, isDlb } : {}),
            ...(role === 'student' ? { nim, angkatan, jenisKelamin, alamat } : {})
        })

        if (res.success) {
            setSuccess(true)
        } else {
            setError(res.error || 'Terjadi kesalahan')
            generateCaptcha()
        }
        setLoading(false)
    }

    if (success) {
        return (
            <Card className="w-full max-w-md shadow-lg border-primary/20">
                <CardHeader className="text-center space-y-2">
                    <div className="flex justify-center mb-4">
                        <CheckCircle2 className="w-12 h-12 text-green-500" />
                    </div>
                    <CardTitle className="text-2xl text-green-600">Registrasi Berhasil</CardTitle>
                    <CardDescription>
                        Akun Anda berhasil didaftarkan namun saat ini berstatus <strong>PENDING</strong>.
                        Anda baru dapat login setelah akun Anda disetujui oleh otoritas terkait.
                    </CardDescription>
                </CardHeader>
                <CardFooter>
                    <Button variant="outline" className="w-full" asChild>
                        <Link href="/">Kembali ke Halaman Login</Link>
                    </Button>
                </CardFooter>
            </Card>
        )
    }

    return (
        <Card className="w-full max-w-lg shadow-lg border-primary/20">
            <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl">Daftar Akun Baru</CardTitle>
                <CardDescription>
                    Lengkapi form di bawah ini untuk mendaftar ke sistem OBLMS
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    {error && (
                        <div className="p-3 text-sm text-red-500 bg-red-100 rounded-md">
                            {error}
                        </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 col-span-2 sm:col-span-1">
                            <Label htmlFor="name">Nama Lengkap</Label>
                            <Input id="name" name="name" placeholder="Budi Santoso" required disabled={loading} />
                        </div>
                        <div className="space-y-2 col-span-2 sm:col-span-1">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" placeholder="budi@kampus.edu" required disabled={loading} />
                        </div>
                        <div className="space-y-2 col-span-2 sm:col-span-1">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" name="password" type="password" required disabled={loading} minLength={6} />
                        </div>
                        <div className="space-y-2 col-span-2 sm:col-span-1">
                            <Label htmlFor="confirm_password">Konfirmasi Password</Label>
                            <Input id="confirm_password" name="confirm_password" type="password" required disabled={loading} minLength={6} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Role (Peran)</Label>
                        <Select value={role} onValueChange={setRole} required disabled={loading}>
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih Role Anda" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="student">Mahasiswa</SelectItem>
                                <SelectItem value="teacher">Dosen (Teacher)</SelectItem>
                                <SelectItem value="qa">Tim QA Program Studi</SelectItem>
                                <SelectItem value="admin">Admin Program Studi</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {role === 'teacher' && (
                        <div className="space-y-4 p-4 border rounded-md bg-muted/10 border-blue-200">
                            <h4 className="text-sm font-semibold text-blue-700 mb-2">Informasi Profil Dosen</h4>
                            <div className="grid grid-cols-2 gap-4">
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
                        </div>
                    )}

                    {role === 'student' && (
                        <div className="space-y-4 p-4 border rounded-md bg-muted/10 border-green-200">
                            <h4 className="text-sm font-semibold text-green-700 mb-2">Informasi Profil Mahasiswa</h4>
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
                        </div>
                    )}

                    {needsDepartment && (
                        <div className="space-y-4 p-4 border rounded-md bg-muted/20">
                            <div className="flex flex-col space-y-1 mb-4">
                                <h4 className="text-sm font-semibold text-muted-foreground">{isDlb ? "Informasi Program Studi Tujuan Mengajar Pertama" : "Informasi Homebase (Unit Kerja)"}</h4>
                                {role === 'teacher' && (
                                    <div className="flex flex-col space-y-2 mt-2 bg-background p-3 rounded border">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="isDlb" checked={isDlb} onCheckedChange={(checked) => {
                                                setIsDlb(checked === true)
                                            }} disabled={loading} />
                                            <Label htmlFor="isDlb" className="cursor-pointer font-medium text-amber-700">Saya adalah Dosen Luar Biasa (DLB)</Label>
                                        </div>
                                        <p className="text-xs text-muted-foreground ml-6">
                                            Dosen Luar Biasa adalah praktisi atau dosen tidak tetap yang mengajar tanpa memiliki homebase spesifik di dalam program studi ini.
                                        </p>
                                    </div>
                                )}
                            </div>
                            
                            <div className="space-y-2">
                                <Label>Universitas</Label>
                                <Select value={univId} onValueChange={(val) => { setUnivId(val); setFacId(''); setDeptId('') }} disabled={loading}>
                                    <SelectTrigger><SelectValue placeholder="Pilih Universitas" /></SelectTrigger>
                                    <SelectContent>
                                        {universities.map(u => (
                                            <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Fakultas</Label>
                                <Select value={facId} onValueChange={(val) => { setFacId(val); setDeptId('') }} disabled={!univId || loading}>
                                    <SelectTrigger><SelectValue placeholder="Pilih Fakultas" /></SelectTrigger>
                                    <SelectContent>
                                        {faculties.map((f: any) => (
                                            <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Program Studi / Program Studi</Label>
                                <Select value={deptId} onValueChange={setDeptId} disabled={!facId || loading}>
                                    <SelectTrigger><SelectValue placeholder="Pilih Program Studi" /></SelectTrigger>
                                    <SelectContent>
                                        {departments.map((d: any) => (
                                            <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

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
                </CardContent>
                <CardFooter className="flex flex-col gap-3 mt-4 pt-4 border-t border-muted/50">
                    <Button className="w-full" type="submit" disabled={loading || (needsDepartment && !deptId)}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                        Daftar Akun
                    </Button>
                    <Button variant="ghost" className="w-full text-muted-foreground" type="button" disabled={loading} asChild>
                        <Link href="/">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Login
                        </Link>
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}
