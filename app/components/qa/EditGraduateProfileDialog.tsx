'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Pencil } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { updateGraduateProfile } from '@/app/actions/obeActions'

export function EditGraduateProfileDialog({ 
    profile,
    visionMissions, 
    departments,
    departmentId
}: { 
    profile: { id: string, code: string, title: string, description: string | null, visionMissionId: string | null, departmentId: string | null },
    visionMissions: { id: string, code: string }[],
    departments: { id: string, code: string, name: string }[],
    departmentId?: string
}) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    const [formData, setFormData] = useState({
        code: profile.code,
        title: profile.title,
        description: profile.description || '',
        visionMissionId: profile.visionMissionId || '',
        departmentId: profile.departmentId || ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const payload = {
            ...formData,
            visionMissionId: formData.visionMissionId || undefined,
            departmentId: departmentId || formData.departmentId || undefined
        }

        const result = await updateGraduateProfile(profile.id, payload)

        if (result.success) {
            toast({ title: 'Sukses', description: 'Profil Lulusan berhasil diperbarui.' })
            setOpen(false)
        } else {
            toast({ title: 'Error', description: result.error, variant: 'destructive' })
        }
        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon"><Pencil className="w-4 h-4 text-blue-600" /></Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Edit Profil Lulusan</DialogTitle>
                        <DialogDescription>
                            Perbarui informasi profil lulusan.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="code">Kode</Label>
                            <Input
                                id="code"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="title">Judul / Peran</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>
                        {!departmentId && (
                            <div className="grid gap-2">
                                <Label htmlFor="departmentId">Program Studi</Label>
                                <Select value={formData.departmentId} onValueChange={(value) => setFormData({ ...formData, departmentId: value })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Program Studi" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {departments.map(p => (
                                            <SelectItem key={p.id} value={p.id}>{p.code} - {p.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        <div className="grid gap-2">
                            <Label htmlFor="visionMissionId">Penyelarasan (Visi/Misi)</Label>
                            <Select value={formData.visionMissionId} onValueChange={(value) => setFormData({ ...formData, visionMissionId: value })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Penyelarasan" />
                                </SelectTrigger>
                                <SelectContent>
                                    {visionMissions.map(vm => (
                                        <SelectItem key={vm.id} value={vm.id}>{vm.code}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Deskripsi</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
