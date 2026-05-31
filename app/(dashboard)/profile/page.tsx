'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { useUserStore } from '@/lib/store/useUserStore'
import { getUserProfile, updateProfile, changePassword } from '@/app/actions/profileActions'
import { Loader2, Save, KeyRound } from 'lucide-react'

export default function ProfilePage() {
    const { userId, role } = useUserStore()
    const { toast } = useToast()
    
    const [isLoading, setIsLoading] = useState(true)
    const [isSavingProfile, setIsSavingProfile] = useState(false)
    const [isSavingPassword, setIsSavingPassword] = useState(false)
    
    // Common Profile State
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')

    // Teacher fields
    const [nidn, setNidn] = useState('')
    const [nip, setNip] = useState('')
    const [gelarDepan, setGelarDepan] = useState('')
    const [gelarBelakang, setGelarBelakang] = useState('')

    // Student fields
    const [nim, setNim] = useState('')
    const [angkatan, setAngkatan] = useState('')
    const [jenisKelamin, setJenisKelamin] = useState('')
    const [alamat, setAlamat] = useState('')
    
    // Password State
    const [oldPassword, setOldPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    useEffect(() => {
        async function fetchProfile() {
            if (!userId) return
            
            const res = await getUserProfile(userId)
            if (res.success && res.user) {
                setName(res.user.name || '')
                setEmail(res.user.email || '')
                
                if (res.user.teacherProfile) {
                    setNidn(res.user.teacherProfile.nidn || '')
                    setNip(res.user.teacherProfile.nip || '')
                    setGelarDepan(res.user.teacherProfile.gelarDepan || '')
                    setGelarBelakang(res.user.teacherProfile.gelarBelakang || '')
                }

                if (res.user.studentProfile) {
                    setNim(res.user.studentProfile.nim || '')
                    setAngkatan(res.user.studentProfile.angkatan?.toString() || '')
                    setJenisKelamin(res.user.studentProfile.jenisKelamin || '')
                    setAlamat(res.user.studentProfile.alamat || '')
                }
            } else {
                toast({ title: 'Gagal memuat profil', description: res.error, variant: 'destructive' })
            }
            setIsLoading(false)
        }
        fetchProfile()
    }, [userId, toast])

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!userId) return
        
        setIsSavingProfile(true)
        const res = await updateProfile(userId, { 
            name, 
            email, 
            nidn, nip, gelarDepan, gelarBelakang,
            nim,
            angkatan: angkatan ? parseInt(angkatan) : undefined,
            jenisKelamin,
            alamat,
            isStudentProfile: isStudent,
            isTeacherProfile: isTeacherOrQa
        })
        
        if (res.success) {
            toast({ title: '✅ Berhasil', description: 'Profil berhasil diperbarui.' })
            useUserStore.getState().setUserName(name)
        } else {
            toast({ title: '❌ Gagal', description: res.error, variant: 'destructive' })
        }
        setIsSavingProfile(false)
    }

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!userId) return
        
        if (newPassword !== confirmPassword) {
            toast({ title: 'Kesalahan', description: 'Konfirmasi password baru tidak cocok.', variant: 'destructive' })
            return
        }
        
        if (newPassword.length < 6) {
            toast({ title: 'Kesalahan', description: 'Password baru minimal 6 karakter.', variant: 'destructive' })
            return
        }
        
        setIsSavingPassword(true)
        const res = await changePassword(userId, oldPassword, newPassword)
        
        if (res.success) {
            toast({ title: '✅ Berhasil', description: 'Password berhasil diubah.' })
            setOldPassword('')
            setNewPassword('')
            setConfirmPassword('')
        } else {
            toast({ title: '❌ Gagal', description: res.error, variant: 'destructive' })
        }
        setIsSavingPassword(false)
    }

    if (isLoading) {
        return <div className="flex h-[400px] items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
    }

    const isTeacherOrQa = ['teacher', 'qa', 'head_of_department'].includes(role || '')
    const isStudent = role === 'student'

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Pengaturan Profil</h1>
                <p className="text-muted-foreground">Kelola informasi pribadi dan keamanan akun Anda.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Profile Information Card */}
                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle>Informasi Profil</CardTitle>
                        <CardDescription>Perbarui data diri Anda di sini.</CardDescription>
                    </CardHeader>
                    <form onSubmit={handleUpdateProfile}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nama Lengkap</Label>
                                <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} disabled className="bg-muted" />
                            </div>
                            
                            {/* Student-specific fields */}
                            {isStudent && (
                                <div className="space-y-4 p-4 border rounded-md bg-muted/10">
                                    <h4 className="text-sm font-semibold">Data Mahasiswa</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="nim">NIM</Label>
                                            <Input id="nim" value={nim} onChange={e => setNim(e.target.value)} placeholder="Nomor Induk Mahasiswa" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="angkatan">Angkatan</Label>
                                            <Input id="angkatan" type="number" value={angkatan} onChange={e => setAngkatan(e.target.value)} placeholder="Contoh: 2023" min={2000} max={2099} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="jenisKelamin">Jenis Kelamin</Label>
                                        <Select value={jenisKelamin} onValueChange={setJenisKelamin}>
                                            <SelectTrigger id="jenisKelamin">
                                                <SelectValue placeholder="Pilih jenis kelamin" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                                                <SelectItem value="Perempuan">Perempuan</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="alamat">Alamat</Label>
                                        <Textarea id="alamat" value={alamat} onChange={e => setAlamat(e.target.value)} placeholder="Alamat lengkap" rows={3} />
                                    </div>
                                </div>
                            )}

                            {/* Teacher-specific fields */}
                            {isTeacherOrQa && (
                                <div className="space-y-4 p-4 border rounded-md bg-muted/10">
                                    <h4 className="text-sm font-semibold">Data Dosen (Opsional)</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="nidn">NIDN</Label>
                                            <Input id="nidn" value={nidn} onChange={e => setNidn(e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="nip">NIP / NIK</Label>
                                            <Input id="nip" value={nip} onChange={e => setNip(e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="gelarDepan">Gelar Depan</Label>
                                            <Input id="gelarDepan" value={gelarDepan} onChange={e => setGelarDepan(e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="gelarBelakang">Gelar Belakang</Label>
                                            <Input id="gelarBelakang" value={gelarBelakang} onChange={e => setGelarBelakang(e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="mt-4 pt-4 border-t">
                            <Button type="submit" disabled={isSavingProfile}>
                                {isSavingProfile ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                Simpan Profil
                            </Button>
                        </CardFooter>
                    </form>
                </Card>

                {/* Change Password Card */}
                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle>Ubah Kata Sandi</CardTitle>
                        <CardDescription>Pastikan akun Anda tetap aman dengan menggunakan kata sandi yang kuat.</CardDescription>
                    </CardHeader>
                    <form onSubmit={handleChangePassword}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="oldPassword">Password Lama</Label>
                                <Input id="oldPassword" type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="newPassword">Password Baru</Label>
                                <Input id="newPassword" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} minLength={6} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
                                <Input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} minLength={6} required />
                            </div>
                        </CardContent>
                        <CardFooter className="mt-4 pt-4 border-t">
                            <Button type="submit" variant="secondary" disabled={isSavingPassword}>
                                {isSavingPassword ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <KeyRound className="w-4 h-4 mr-2" />}
                                Perbarui Password
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    )
}
