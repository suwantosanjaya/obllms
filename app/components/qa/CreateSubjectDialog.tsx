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
import { getFacultyList } from '@/app/actions/institutionActions'

type Department = { id: string; code: string; name: string }
type Faculty = { id: string; code: string; name: string; departments: Department[] }

export function CreateSubjectDialog() {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()
    const router = useRouter()

    const [type, setType] = useState<'wajib' | 'pilihan'>('wajib')
    const [scope, setScope] = useState<'universitas' | 'faculty' | 'department'>('department')
    const [credits, setCredits] = useState<string>('3')
    const [facultyId, setFakultasId] = useState<string>('')
    const [departmentId, setProdiId] = useState<string>('')
    const [facultyList, setFakultasList] = useState<Faculty[]>([])
    const [loadingFakultas, setLoadingFakultas] = useState(false)

    // Load faculty list when dialog opens
    useEffect(() => {
        if (open) {
            setLoadingFakultas(true)
            getFacultyList().then(res => {
                if (res.success && res.facultyList) setFakultasList(res.facultyList as Faculty[])
                setLoadingFakultas(false)
            })
        }
        // Reset form on close
        if (!open) {
            setType('wajib'); setScope('department'); setCredits('3')
            setFakultasId(''); setProdiId('')
        }
    }, [open])

    // Reset department selection when faculty changes
    useEffect(() => { setProdiId('') }, [facultyId])

    const selectedFakultas = facultyList.find(f => f.id === facultyId)
    const prodiList = selectedFakultas?.departments ?? []

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
            credits: parseInt(credits) || 3,
            facultyId: facultyId || undefined,
            departmentId: departmentId || undefined,
        })

        setIsLoading(false)

        if (result.success) {
            toast({ title: 'Sukses', description: 'Mata kuliah berhasil ditambahkan ke katalog.' })
            setOpen(false)
            router.refresh()
        } else {
            toast({ title: 'Error', description: result.error || 'An error occurred', variant: 'destructive' })
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
                            Tambahkan Master Mata Kuliah baru ke katalog.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {/* Kode & Nama */}
                        <div className="grid gap-2">
                            <Label htmlFor="code">Kode Mata Kuliah</Label>
                            <Input id="code" name="code" placeholder="misal: CS101, MAT201" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="title">Nama Mata Kuliah</Label>
                            <Input id="title" name="title" placeholder="misal: Pemrograman Dasar" required />
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

                        {/* Credits */}
                        <div className="grid gap-2">
                            <Label htmlFor="credits">SKS / Credits</Label>
                            <Input 
                                id="credits" 
                                type="number" 
                                min="1" 
                                max="10" 
                                value={credits} 
                                onChange={(e) => setCredits(e.target.value)} 
                                required 
                            />
                        </div>

                        {/* Kelompok / Scope */}
                        <div className="grid gap-2">
                            <Label>Cakupan</Label>
                            <Select value={scope} onValueChange={v => { setScope(v as any); setFakultasId(''); setProdiId('') }}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="universitas">Mata Kuliah Universitas</SelectItem>
                                    <SelectItem value="faculty">Mata Kuliah Fakultas</SelectItem>
                                    <SelectItem value="department">Mata Kuliah Departemen</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Faculty — muncul jika scope = 'faculty' atau 'department' */}
                        {(scope === 'faculty' || scope === 'department') && (
                            <div className="grid gap-2">
                                <Label>Fakultas</Label>
                                <Select value={facultyId} onValueChange={setFakultasId} disabled={loadingFakultas} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder={loadingFakultas ? 'Loading...' : 'Pilih Fakultas'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {facultyList.map(f => (
                                            <SelectItem key={f.id} value={f.id}>{f.name} ({f.code})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Department — muncul jika scope = 'department' dan faculty sudah dipilih */}
                        {scope === 'department' && facultyId && (
                            <div className="grid gap-2">
                                <Label>Departemen</Label>
                                <Select value={departmentId} onValueChange={setProdiId} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Departemen" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {prodiList.length === 0 ? (
                                            <SelectItem value="_none" disabled>Tidak ada departemen di fakultas ini</SelectItem>
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
                            <Textarea id="description" name="description" placeholder="Deskripsi singkat tentang mata kuliah..." rows={3} />
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
