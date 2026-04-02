'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createCLO } from '@/app/actions/obeActions'

export function CreateCLODialog({ courses, plos }: { courses: { id: string, title: string }[], plos: { id: string, code: string }[] }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError('')

        const formData = new FormData(e.currentTarget)
        const courseId = formData.get('courseId') as string
        const code = formData.get('code') as string
        const description = formData.get('description') as string
        const ploId = formData.get('ploId') as string

        const res = await createCLO({ courseId, code, description, ploId: ploId !== 'none' ? ploId : undefined })

        if (res.success) {
            setOpen(false)
        } else {
            setError(res.error || 'Gagal menambahkan CPMK / CLO')
        }
        setLoading(false)
    }

    if (courses.length === 0) {
        return (
            <Button disabled>
                <Plus className="mr-2 h-4 w-4" />
                Tambah CPMK (Buat Kelas Dulu)
            </Button>
        )
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Capaian Baru
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Buat Capaian Pembelajaran Mata Kuliah (CPMK/CLO)</DialogTitle>
                        <DialogDescription>
                            Tambahkan CPMK untuk kelas Anda dan petakan dengan profil CPL program studi.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="courseId" className="text-right">Mata Kuliah</Label>
                            <div className="col-span-3">
                                <Select name="courseId" required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Kelas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {courses.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="code" className="text-right">Kode</Label>
                            <Input id="code" name="code" placeholder="CPMK-1" className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="description" className="text-right mt-2">Deskripsi</Label>
                            <Textarea id="description" name="description" placeholder="Mahasiswa mampu merancang arsitektur..." className="col-span-3 min-h-[100px]" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="ploId" className="text-right">Peta CPL</Label>
                            <div className="col-span-3">
                                <Select name="ploId" defaultValue="none">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Pemetaan Profil CPL" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">-- Tanpa Pemetaan (Tidak Disarankan) --</SelectItem>
                                        {plos.map(p => (
                                            <SelectItem key={p.id} value={p.id}>{p.code}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
                        <Button type="submit" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan CPMK'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
