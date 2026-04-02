'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Plus } from 'lucide-react'
import { createSubject } from '@/app/actions/subjectActions'
import { getFakultasList } from '@/app/actions/prodiActions'

type Prodi = { id: string; code: string; name: string }
type Fakultas = { id: string; code: string; name: string; prodis: Prodi[] }

export function CreateSubjectDialog() {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()
    const router = useRouter()

    const [type, setType] = useState<'wajib' | 'pilihan'>('wajib')
    const [scope, setScope] = useState<'universitas' | 'fakultas' | 'prodi'>('prodi')
    const [fakultasId, setFakultasId] = useState<string>('')
    const [prodiId, setProdiId] = useState<string>('')
    const [fakultasList, setFakultasList] = useState<Fakultas[]>([])
    const [loadingFakultas, setLoadingFakultas] = useState(false)

    // Load fakultas list when dialog opens
    useEffect(() => {
        if (open) {
            setLoadingFakultas(true)
            getFakultasList().then(res => {
                if (res.success && res.fakultasList) setFakultasList(res.fakultasList as Fakultas[])
                setLoadingFakultas(false)
            })
        }
        // Reset form on close
        if (!open) {
            setType('wajib'); setScope('prodi')
            setFakultasId(''); setProdiId('')
        }
    }, [open])

    // Reset prodi selection when fakultas changes
    useEffect(() => { setProdiId('') }, [fakultasId])

    const selectedFakultas = fakultasList.find(f => f.id === fakultasId)
    const prodiList = selectedFakultas?.prodis ?? []

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        const formData = new FormData(e.currentTarget)

        const result = await createSubject({
            code: formData.get('code') as string,
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            type,
            scope,
            fakultasId: fakultasId || undefined,
            prodiId: prodiId || undefined,
        })

        setIsLoading(false)

        if (result.success) {
            toast({ title: 'Berhasil', description: 'Katalog Mata Kuliah telah ditambahkan.' })
            setOpen(false)
            router.refresh()
        } else {
            toast({ title: 'Gagal', description: result.error || 'Terjadi kesalahan', variant: 'destructive' })
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Mata Kuliah
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[520px]">
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle>Mata Kuliah Baru</DialogTitle>
                        <DialogDescription>
                            Tambahkan Master Mata Kuliah ke dalam katalog.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {/* Kode & Nama */}
                        <div className="grid gap-2">
                            <Label htmlFor="code">Kode Mata Kuliah</Label>
                            <Input id="code" name="code" placeholder="Contoh: TI101, MKU201" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="title">Nama Mata Kuliah</Label>
                            <Input id="title" name="title" placeholder="Contoh: Pemrograman Dasar" required />
                        </div>

                        {/* Tipe */}
                        <div className="grid gap-2">
                            <Label>Tipe</Label>
                            <Select value={type} onValueChange={v => setType(v as any)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="wajib">Wajib</SelectItem>
                                    <SelectItem value="pilihan">Pilihan</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Kelompok / Scope */}
                        <div className="grid gap-2">
                            <Label>Kelompok</Label>
                            <Select value={scope} onValueChange={v => { setScope(v as any); setFakultasId(''); setProdiId('') }}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="universitas">Mata Kuliah Universitas</SelectItem>
                                    <SelectItem value="fakultas">Mata Kuliah Fakultas</SelectItem>
                                    <SelectItem value="prodi">Mata Kuliah Prodi</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Fakultas — muncul jika scope = 'fakultas' atau 'prodi' */}
                        {(scope === 'fakultas' || scope === 'prodi') && (
                            <div className="grid gap-2">
                                <Label>Fakultas</Label>
                                <Select value={fakultasId} onValueChange={setFakultasId} disabled={loadingFakultas} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder={loadingFakultas ? 'Memuat...' : 'Pilih Fakultas'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {fakultasList.map(f => (
                                            <SelectItem key={f.id} value={f.id}>{f.name} ({f.code})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Prodi — muncul jika scope = 'prodi' dan fakultas sudah dipilih */}
                        {scope === 'prodi' && fakultasId && (
                            <div className="grid gap-2">
                                <Label>Program Studi</Label>
                                <Select value={prodiId} onValueChange={setProdiId} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Program Studi" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {prodiList.length === 0 ? (
                                            <SelectItem value="_none" disabled>Tidak ada prodi di fakultas ini</SelectItem>
                                        ) : prodiList.map(p => (
                                            <SelectItem key={p.id} value={p.id}>{p.name} ({p.code})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Deskripsi */}
                        <div className="grid gap-2">
                            <Label htmlFor="description">Deskripsi (Opsional)</Label>
                            <Textarea id="description" name="description" placeholder="Deskripsi singkat mata kuliah..." rows={3} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Menyimpan...</> : 'Simpan Mata Kuliah'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
