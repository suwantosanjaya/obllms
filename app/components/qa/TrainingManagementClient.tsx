'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { createTrainingModule, updateTrainingModule, deleteTrainingModule, createTrainingCategory } from '@/app/actions/trainingActions'

export function TrainingManagementClient({ initialModules, initialCategories }: { initialModules: any[], initialCategories: any[] }) {
    const [modules, setModules] = useState(initialModules)
    const [categories, setCategories] = useState(initialCategories)
    const [isOpen, setIsOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(false)
    const [newCategoryName, setNewCategoryName] = useState('')
    const [isCreatingCategory, setIsCreatingCategory] = useState(false)
    
    const [formData, setFormData] = useState({
        id: '',
        title: '',
        description: '',
        categoryId: '',
        mediaUrl: '',
        mediaType: 'VIDEO'
    })
    const { toast } = useToast()

    const handleOpenCreate = () => {
        setFormData({ id: '', title: '', description: '', categoryId: categories[0]?.id || '', mediaUrl: '', mediaType: 'VIDEO' })
        setIsEditing(false)
        setIsOpen(true)
    }

    const handleOpenEdit = (mod: any) => {
        setFormData({
            id: mod.id,
            title: mod.title,
            description: mod.description,
            categoryId: mod.categoryId || '',
            mediaUrl: mod.mediaUrl || '',
            mediaType: mod.mediaType || 'VIDEO'
        })
        setIsEditing(true)
        setIsOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Apakah Anda yakin ingin menghapus modul ini?')) return
        setLoading(true)
        const res = await deleteTrainingModule(id)
        if (res.success) {
            setModules(modules.filter(m => m.id !== id))
            toast({ title: 'Berhasil dihapus' })
        } else {
            toast({ variant: 'destructive', title: 'Gagal', description: res.error })
        }
        setLoading(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        
        let finalCategoryId = formData.categoryId
        
        // If creating new category
        if (isCreatingCategory && newCategoryName.trim() !== '') {
            const catRes = await createTrainingCategory(newCategoryName)
            if (catRes.success && catRes.category) {
                setCategories([...categories, catRes.category])
                finalCategoryId = catRes.category.id
            } else {
                toast({ variant: 'destructive', title: 'Gagal membuat kategori', description: catRes.error })
                setLoading(false)
                return
            }
        }

        const payload = {
            title: formData.title,
            description: formData.description,
            categoryId: finalCategoryId,
            mediaUrl: formData.mediaUrl,
            mediaType: formData.mediaType
        }

        let res
        if (isEditing) {
            res = await updateTrainingModule(formData.id, payload)
        } else {
            res = await createTrainingModule(payload)
        }

        if (res.success) {
            if (isEditing) {
                setModules(modules.map(m => m.id === formData.id ? res.module : m))
            } else {
                setModules([res.module, ...modules])
            }
            toast({ title: 'Berhasil disimpan' })
            setIsOpen(false)
        } else {
            toast({ variant: 'destructive', title: 'Gagal menyimpan', description: res.error })
        }
        setLoading(false)
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manajemen Pelatihan Dosen</h1>
                    <p className="text-muted-foreground mt-1">Kelola modul video panduan untuk Dosen.</p>
                </div>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={handleOpenCreate}><Plus className="w-4 h-4 mr-2"/> Tambah Modul</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{isEditing ? 'Edit Modul' : 'Tambah Modul Baru'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label>Judul Modul</Label>
                                <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Deskripsi</Label>
                                <Textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Kategori</Label>
                                {!isCreatingCategory ? (
                                    <div className="flex gap-2">
                                        <Select value={formData.categoryId} onValueChange={v => setFormData({...formData, categoryId: v})}>
                                            <SelectTrigger className="flex-1"><SelectValue placeholder="Pilih Kategori" /></SelectTrigger>
                                            <SelectContent>
                                                {categories.map(c => (
                                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Button type="button" variant="outline" onClick={() => setIsCreatingCategory(true)}>+ Baru</Button>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <Input 
                                            placeholder="Nama kategori baru..." 
                                            value={newCategoryName} 
                                            onChange={e => setNewCategoryName(e.target.value)} 
                                            autoFocus 
                                            required 
                                        />
                                        <Button type="button" variant="outline" onClick={() => setIsCreatingCategory(false)}>Batal</Button>
                                    </div>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label>Tipe Media</Label>
                                <Select value={formData.mediaType} onValueChange={v => setFormData({...formData, mediaType: v})}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="VIDEO">Video Embed (YouTube)</SelectItem>
                                        <SelectItem value="PDF">Dokumen PDF (URL)</SelectItem>
                                        <SelectItem value="LINK">Tautan Web</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>URL Media</Label>
                                <Input placeholder="https://..." value={formData.mediaUrl} onChange={e => setFormData({...formData, mediaUrl: e.target.value})} />
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Batal</Button>
                                <Button type="submit" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan'}</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Judul</TableHead>
                            <TableHead>Tipe</TableHead>
                            <TableHead>Kategori</TableHead>
                            <TableHead>Tautan Media</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {modules.length === 0 ? (
                            <TableRow><TableCell colSpan={5} className="text-center py-4">Belum ada modul pelatihan.</TableCell></TableRow>
                        ) : modules.map(m => (
                            <TableRow key={m.id}>
                                <TableCell className="font-medium">{m.title}</TableCell>
                                <TableCell>{m.mediaType}</TableCell>
                                <TableCell>{m.category?.name || '-'}</TableCell>
                                <TableCell>{m.mediaUrl ? 'Tersedia' : '-'}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(m)}><Edit className="w-4 h-4"/></Button>
                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(m.id)}><Trash2 className="w-4 h-4"/></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
