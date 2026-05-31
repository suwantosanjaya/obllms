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
import { Switch } from '@/components/ui/switch'
import { updateQATeacherProfile } from '@/app/actions/qaTeacherActions'

export function EditQATeacherDialog({ teacher }: { teacher: any }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [isDlb, setIsDlb] = useState<boolean>(teacher.teacherProfile?.isDlb ?? false)

    const profile = teacher.teacherProfile || {}

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError('')

        const formData = new FormData(e.currentTarget)
        const name = formData.get('name') as string
        const nidn = formData.get('nidn') as string
        const nip = formData.get('nip') as string
        const gelarDepan = formData.get('gelarDepan') as string
        const gelarBelakang = formData.get('gelarBelakang') as string

        const res = await updateQATeacherProfile(teacher.id, {
            name,
            nidn,
            nip,
            gelarDepan,
            gelarBelakang,
            isDlb,
        })

        if (res.success) {
            setOpen(false)
        } else {
            setError(res.error || 'Gagal menyimpan profil dosen')
        }
        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 px-2" title="Edit Profil Dosen">
                    <Pencil className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Edit Profil Dosen</DialogTitle>
                        <DialogDescription>
                            Perbarui data profil untuk <strong>{teacher.name}</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {/* Basic Info */}
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nama Lengkap</Label>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={teacher.name || ''}
                                placeholder="Dr. Budi Santoso, M.Kom."
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-2">
                                <Label htmlFor="gelarDepan">Gelar Depan</Label>
                                <Input
                                    id="gelarDepan"
                                    name="gelarDepan"
                                    defaultValue={profile.gelarDepan || ''}
                                    placeholder="Dr., Prof."
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="gelarBelakang">Gelar Belakang</Label>
                                <Input
                                    id="gelarBelakang"
                                    name="gelarBelakang"
                                    defaultValue={profile.gelarBelakang || ''}
                                    placeholder="M.Kom., Ph.D."
                                />
                            </div>
                        </div>

                        {/* ID Numbers */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-2">
                                <Label htmlFor="nidn">NIDN</Label>
                                <Input
                                    id="nidn"
                                    name="nidn"
                                    defaultValue={profile.nidn || ''}
                                    className="font-mono"
                                    placeholder="0012345678"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="nip">NIP</Label>
                                <Input
                                    id="nip"
                                    name="nip"
                                    defaultValue={profile.nip || ''}
                                    className="font-mono"
                                    placeholder="198001012005011001"
                                />
                            </div>
                        </div>

                        {/* DLB Toggle */}
                        <div className="flex items-center justify-between rounded-lg border p-3">
                            <div>
                                <Label htmlFor="isDlb" className="text-sm font-medium">Dosen Luar Biasa (DLB)</Label>
                                <p className="text-xs text-muted-foreground mt-0.5">Aktifkan jika dosen berstatus dosen tidak tetap / luar biasa.</p>
                            </div>
                            <Switch
                                id="isDlb"
                                checked={isDlb}
                                onCheckedChange={setIsDlb}
                            />
                        </div>

                        {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-md">{error}</p>}
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
