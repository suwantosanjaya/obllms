'use client'

import { useState } from 'react'
import { Plus, Loader2 } from 'lucide-react'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { createAccessRequest } from '@/app/actions/accessRequestActions'

export function RequestAccessDialog({ universities, userId }: { universities: any[], userId: string }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    const [univId, setUnivId] = useState('')
    const [facId, setFacId] = useState('')
    const [deptId, setDeptId] = useState('')

    const selectedUniv = universities.find(u => u.id === univId)
    const faculties = selectedUniv?.faculties || []
    const selectedFac = faculties.find((f: any) => f.id === facId)
    const departments = selectedFac?.departments || []

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        if (!deptId) return

        setLoading(true)
        const res = await createAccessRequest(userId, deptId)
        setLoading(false)

        if (res.success) {
            toast({ title: 'Berhasil', description: 'Pengajuan akses departemen telah dikirim ke QA Departemen untuk disetujui.' })
            setOpen(false)
            setUnivId('')
            setFacId('')
            setDeptId('')
        } else {
            toast({ title: 'Gagal', description: res.error || 'Terjadi kesalahan.', variant: 'destructive' })
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Ajukan Akses Departemen Baru
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Ajukan Akses Mengajar</DialogTitle>
                        <DialogDescription>
                            Pilih departemen tempat Anda akan mengajar. Permintaan Anda akan ditinjau oleh tim QA dari departemen terkait.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
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
                            <Label>Program Studi / Departemen</Label>
                            <Select value={deptId} onValueChange={setDeptId} disabled={!facId || loading}>
                                <SelectTrigger><SelectValue placeholder="Pilih Departemen" /></SelectTrigger>
                                <SelectContent>
                                    {departments.map((d: any) => (
                                        <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={!deptId || loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Kirim Pengajuan
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
