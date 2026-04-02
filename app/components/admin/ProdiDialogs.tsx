'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Plus } from 'lucide-react'
import { createFakultas, createProdi } from '@/app/actions/prodiActions'

type Fakultas = { id: string; code: string; name: string }

// ─── Dialog Tambah Fakultas ────────────────────────────────
export function CreateFakultasDialog() {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()
    const router = useRouter()

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        const formData = new FormData(e.currentTarget)
        const result = await createFakultas({
            code: formData.get('code') as string,
            name: formData.get('name') as string,
        })
        setIsLoading(false)
        if (result.success) {
            toast({ title: 'Berhasil', description: 'Fakultas berhasil ditambahkan.' })
            setOpen(false); router.refresh()
        } else {
            toast({ title: 'Gagal', description: result.error, variant: 'destructive' })
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline"><Plus className="mr-2 h-4 w-4" />Tambah Fakultas</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[420px]">
                <form onSubmit={onSubmit}>
                    <DialogHeader><DialogTitle>Fakultas Baru</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="fak-code">Kode Fakultas</Label>
                            <Input id="fak-code" name="code" placeholder="Contoh: FT, FE" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="fak-name">Nama Fakultas</Label>
                            <Input id="fak-name" name="name" placeholder="Contoh: Fakultas Teknik" required />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Menyimpan...</> : 'Simpan'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

// ─── Dialog Tambah Prodi ───────────────────────────────────
export function CreateProdiDialog({ fakultasList }: { fakultasList: Fakultas[] }) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [fakultasId, setFakultasId] = useState('')
    const { toast } = useToast()
    const router = useRouter()

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        const formData = new FormData(e.currentTarget)
        const result = await createProdi({
            code: formData.get('code') as string,
            name: formData.get('name') as string,
            fakultasId,
        })
        setIsLoading(false)
        if (result.success) {
            toast({ title: 'Berhasil', description: 'Program Studi berhasil ditambahkan.' })
            setOpen(false); router.refresh()
        } else {
            toast({ title: 'Gagal', description: result.error, variant: 'destructive' })
        }
    }

    return (
        <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) setFakultasId('') }}>
            <DialogTrigger asChild>
                <Button><Plus className="mr-2 h-4 w-4" />Tambah Prodi</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[420px]">
                <form onSubmit={onSubmit}>
                    <DialogHeader><DialogTitle>Program Studi Baru</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Fakultas</Label>
                            <Select value={fakultasId} onValueChange={setFakultasId} required>
                                <SelectTrigger><SelectValue placeholder="Pilih Fakultas" /></SelectTrigger>
                                <SelectContent>
                                    {fakultasList.map(f => (
                                        <SelectItem key={f.id} value={f.id}>{f.name} ({f.code})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="prodi-code">Kode Prodi</Label>
                            <Input id="prodi-code" name="code" placeholder="Contoh: TI, SI" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="prodi-name">Nama Program Studi</Label>
                            <Input id="prodi-name" name="name" placeholder="Contoh: Teknik Informatika" required />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
                        <Button type="submit" disabled={isLoading || !fakultasId}>
                            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Menyimpan...</> : 'Simpan'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
