'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { RichTextEditor } from '@/app/components/ui/RichTextEditor'
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { createAnnouncement, updateAnnouncement } from '@/app/actions/announcementActions'
import { Plus, Pencil } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Announcement, Department } from '@prisma/client'

const TAGS = ['Info', 'Fitur Baru', 'Pengumuman', 'Penting']

interface Props {
    mode?: 'create' | 'edit'
    announcement?: Announcement
    departments?: Department[]
    activeRole?: string
    activeDepartmentId?: string | null
}

export function AnnouncementDialog({ mode = 'create', announcement, activeRole, activeDepartmentId }: Props) {
    const router = useRouter()
    const { toast } = useToast()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const [title, setTitle] = useState(announcement?.title || '')
    const [content, setContent] = useState(announcement?.content || '')
    const [tag, setTag] = useState(announcement?.tag || 'Info')
    const [scope] = useState(announcement?.scope || (activeRole === 'qa' ? 'department' : 'global'))
    const [departmentId] = useState(announcement?.departmentId || activeDepartmentId || '')
    const [isActive, setIsActive] = useState(announcement?.isActive ?? true)

    const isQA = activeRole === 'qa'

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        // Check payload size (Next.js server action default limit is 1MB)
        const contentSizeInBytes = new Blob([content]).size
        if (contentSizeInBytes > 1000000) { // roughly 1MB limit
            toast({ 
                title: 'Ukuran Terlalu Besar', 
                description: 'Isi pengumuman (termasuk gambar) melebihi batas 1MB. Silakan gunakan gambar dengan ukuran lebih kecil atau kurangi jumlah gambar.', 
                variant: 'destructive' 
            })
            return
        }

        setLoading(true)
        const data = { title, content, tag, scope, departmentId: scope === 'department' ? departmentId : null, isActive }
        const res = mode === 'edit' && announcement
            ? await updateAnnouncement(announcement.id, data)
            : await createAnnouncement(data)

        setLoading(false)
        if (res.success) {
            toast({ title: 'Berhasil', description: mode === 'edit' ? 'Pengumuman diperbarui.' : 'Pengumuman berhasil dibuat.' })
            setOpen(false)
            router.refresh()
        } else {
            toast({ title: 'Gagal', description: res && typeof res === 'object' && 'error' in res ? String(res.error) : 'Terjadi kesalahan', variant: 'destructive' })
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {mode === 'edit' ? (
                    <Button variant="ghost" size="sm"><Pencil className="w-4 h-4" /></Button>
                ) : (
                    <Button><Plus className="mr-2 w-4 h-4" />Buat Pengumuman</Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-175 max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{mode === 'edit' ? 'Edit Pengumuman' : 'Buat Pengumuman Baru'}</DialogTitle>
                        <DialogDescription>
                            {isQA ? 'Pengumuman akan ditampilkan untuk mahasiswa di program studi Anda.' : 'Buat pengumuman global untuk seluruh mahasiswa.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Judul</Label>
                            <Input id="title" value={title} onChange={e => setTitle(e.target.value)} required placeholder="Judul pengumuman..." />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="content">Isi / Konten</Label>
                            <RichTextEditor value={content} onChange={setContent} placeholder="Tulis isi pengumuman..." className="min-h-50" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Tag</Label>
                                <Select value={tag} onValueChange={setTag}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {TAGS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                        </div>

                        <div className="flex items-center gap-3">
                            <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
                            <Label htmlFor="isActive">Aktifkan pengumuman sekarang</Label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Menyimpan...' : mode === 'edit' ? 'Simpan Perubahan' : 'Buat Pengumuman'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
