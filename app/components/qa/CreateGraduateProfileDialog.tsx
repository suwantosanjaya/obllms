'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { createGraduateProfile } from '@/app/actions/obeActions'

export function CreateGraduateProfileDialog({ 
    visionMissions, 
    departments,
    selectedYearId,
    departmentId
}: { 
    visionMissions: { id: string, code: string }[],
    departments: { id: string, code: string, name: string }[],
    selectedYearId?: string,
    departmentId?: string
}) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    const [formData, setFormData] = useState({
        code: '',
        title: '',
        description: '',
        visionMissionId: '',
        departmentId: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const payload = {
            ...formData,
            visionMissionId: formData.visionMissionId || undefined,
            departmentId: departmentId || formData.departmentId || undefined,
            curriculumYearId: selectedYearId
        }

        const result = await createGraduateProfile(payload)

        if (result.success) {
            toast({ title: 'Sukses', description: 'Profil Lulusan berhasil dibuat.' })
            setOpen(false)
            setFormData({ code: '', title: '', description: '', visionMissionId: '', departmentId: '' })
        } else {
            toast({ title: 'Error', description: result.error, variant: 'destructive' })
        }
        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button><Plus className="w-4 h-4 mr-2" /> Tambah Profil Lulusan</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Tambah Profil Lulusan</DialogTitle>
                        <DialogDescription>
                            Buat profil lulusan baru dan hubungkan ke visi/misi dan departemen.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="code">Kode</Label>
                            <Input
                                id="code"
                                placeholder="misal: PL-1"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="title">Judul / Peran</Label>
                            <Input
                                id="title"
                                placeholder="misal: Software Engineer"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>
                        {!departmentId && (
                            <div className="grid gap-2">
                                <Label htmlFor="departmentId">Departemen</Label>
                                <Select value={formData.departmentId} onValueChange={(value) => setFormData({ ...formData, departmentId: value })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Departemen" />
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
                                placeholder="Deskripsi profil..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Menyimpan...' : 'Simpan'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
