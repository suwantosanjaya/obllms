'use client'

import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { updateQAStudentProfile } from '@/app/actions/qaStudentActions'

export function EditQAStudentDialog({ student }: { student: any }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const profile = student.studentProfile || {}

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError('')

        const formData = new FormData(e.currentTarget)
        const nim = formData.get('nim') as string
        const angkatanRaw = formData.get('angkatan') as string
        const jenisKelamin = formData.get('jenisKelamin') as string
        const alamat = formData.get('alamat') as string

        const angkatan = angkatanRaw ? parseInt(angkatanRaw) : undefined

        const res = await updateQAStudentProfile(student.id, { 
            nim, 
            angkatan, 
            jenisKelamin: jenisKelamin === 'none' ? undefined : jenisKelamin, 
            alamat 
        })

        if (res.success) {
            setOpen(false)
        } else {
            setError(res.error || 'Gagal menyimpan profil mahasiswa')
        }
        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 px-2">
                    <Pencil className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Edit Profil Mahasiswa</DialogTitle>
                        <DialogDescription>
                            Perbarui data profil untuk {student.name}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="nim">NIM</Label>
                            <Input
                                id="nim"
                                name="nim"
                                defaultValue={profile.nim || ''}
                                className="font-mono"
                                placeholder="Kosong"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="angkatan">Angkatan</Label>
                            <Input
                                id="angkatan"
                                name="angkatan"
                                type="number"
                                defaultValue={profile.angkatan || ''}
                                placeholder="Misal: 2024"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="jenisKelamin">Jenis Kelamin</Label>
                            <Select name="jenisKelamin" defaultValue={profile.jenisKelamin || 'none'}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Jenis Kelamin" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Belum ditentukan</SelectItem>
                                    <SelectItem value="L">Laki-laki</SelectItem>
                                    <SelectItem value="P">Perempuan</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="alamat">Alamat</Label>
                            <Input
                                id="alamat"
                                name="alamat"
                                defaultValue={profile.alamat || ''}
                                placeholder="Alamat mahasiswa"
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
