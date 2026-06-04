'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Plus, Pencil, Trash2 } from 'lucide-react'
import {
    createUniversity, updateUniversity,
    createFaculty, updateFaculty,
    createDepartment, updateDepartment, deleteUniversity, deleteFaculty, deleteDepartment
} from '@/app/actions/institutionActions'

// ─── University Dialogs ───────────────────────────────────────────────────────
export function CreateUniversityDialog() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)
        const res = await createUniversity(formData)
        setLoading(false)
        if (res.success) {
            toast({ title: 'Berhasil', description: 'Universitas berhasil ditambahkan' })
            setOpen(false)
        } else {
            toast({ title: 'Gagal', description: res.error, variant: 'destructive' })
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm"><Plus className="w-4 h-4 mr-2" />Tambah Universitas</Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle>Tambah Universitas</DialogTitle>
                        <DialogDescription>Tambahkan universitas baru ke dalam sistem.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Kode Universitas</Label>
                            <Input name="code" placeholder="Cth. UNIV1" required />
                        </div>
                        <div className="space-y-2">
                            <Label>Nama Universitas</Label>
                            <Input name="name" placeholder="Cth. Universitas Negeri" required />
                        </div>
                        <div className="space-y-2">
                            <Label>Logo Universitas (Opsional)</Label>
                            <Input name="logoFile" type="file" accept="image/*" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export function EditUniversityDialog({ university }: { university: { id: string, code: string, name: string, logo?: string | null } }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)
        const res = await updateUniversity(university.id, formData)
        setLoading(false)
        if (res.success) {
            toast({ title: 'Berhasil', description: 'Universitas berhasil diperbarui' })
            setOpen(false)
        } else {
            toast({ title: 'Gagal', description: res.error, variant: 'destructive' })
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon"><Pencil className="w-4 h-4" /></Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle>Edit Universitas</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Kode Universitas</Label>
                            <Input name="code" defaultValue={university.code} required />
                        </div>
                        <div className="space-y-2">
                            <Label>Nama Universitas</Label>
                            <Input name="name" defaultValue={university.name} required />
                        </div>
                        <div className="space-y-2">
                            <Label>Logo Universitas (Opsional)</Label>
                            {university.logo && (
                                <div className="mb-2">
                                    <img src={university.logo} alt="Logo" className="w-16 h-16 object-contain border rounded p-1" />
                                </div>
                            )}
                            <Input name="logoFile" type="file" accept="image/*" />
                            <p className="text-[10px] text-muted-foreground">Pilih file baru untuk mengganti logo sebelumnya.</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}


// ─── Faculty Dialogs ───────────────────────────────────────────────────────
export function CreateFacultyDialog({ universities }: { universities: { id: string, name: string }[] }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)
        const res = await createFaculty({
            code: formData.get('code') as string,
            name: formData.get('name') as string,
            universityId: formData.get('universityId') as string
        })
        setLoading(false)
        if (res.success) {
            toast({ title: 'Berhasil', description: 'Fakultas berhasil ditambahkan' })
            setOpen(false)
        } else {
            toast({ title: 'Gagal', description: res.error, variant: 'destructive' })
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline"><Plus className="w-4 h-4 mr-2" />Tambah Fakultas</Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle>Tambah Fakultas</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Universitas</Label>
                            <Select name="universityId" required>
                                <SelectTrigger><SelectValue placeholder="Pilih Universitas..." /></SelectTrigger>
                                <SelectContent>
                                    {universities.map(u => (
                                        <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Kode Fakultas</Label>
                            <Input name="code" placeholder="Cth. FT" required />
                        </div>
                        <div className="space-y-2">
                            <Label>Nama Fakultas</Label>
                            <Input name="name" placeholder="Cth. Fakultas Teknik" required />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export function EditFacultyDialog({ faculty, universities }: { faculty: any, universities: any[] }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)
        const res = await updateFaculty(faculty.id, {
            code: formData.get('code') as string,
            name: formData.get('name') as string,
            universityId: formData.get('universityId') as string
        })
        setLoading(false)
        if (res.success) {
            toast({ title: 'Berhasil', description: 'Fakultas berhasil diperbarui' })
            setOpen(false)
        } else {
            toast({ title: 'Gagal', description: res.error, variant: 'destructive' })
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon"><Pencil className="w-4 h-4" /></Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle>Edit Fakultas</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Universitas</Label>
                            <Select name="universityId" defaultValue={faculty.universityId} required>
                                <SelectTrigger><SelectValue placeholder="Pilih Universitas..." /></SelectTrigger>
                                <SelectContent>
                                    {universities.map(u => (
                                        <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Kode Fakultas</Label>
                            <Input name="code" defaultValue={faculty.code} required />
                        </div>
                        <div className="space-y-2">
                            <Label>Nama Fakultas</Label>
                            <Input name="name" defaultValue={faculty.name} required />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}


// ─── Department Dialogs ────────────────────────────────────────────────────
export function CreateDepartmentDialog({ faculties }: { faculties: { id: string, code: string, name: string }[] }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)
        const res = await createDepartment({
            code: formData.get('code') as string,
            name: formData.get('name') as string,
            facultyId: formData.get('facultyId') as string
        })
        setLoading(false)
        if (res.success) {
            toast({ title: 'Berhasil', description: 'Program Studi berhasil ditambahkan' })
            setOpen(false)
        } else {
            toast({ title: 'Gagal', description: res.error, variant: 'destructive' })
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline"><Plus className="w-4 h-4 mr-2" />Tambah Program Studi</Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle>Tambah Program Studi</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Fakultas</Label>
                            <Select name="facultyId" required>
                                <SelectTrigger><SelectValue placeholder="Pilih Fakultas..." /></SelectTrigger>
                                <SelectContent>
                                    {faculties.map(f => (
                                        <SelectItem key={f.id} value={f.id}>{f.code} - {f.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Kode Program Studi</Label>
                            <Input name="code" placeholder="Cth. TI" required />
                        </div>
                        <div className="space-y-2">
                            <Label>Nama Program Studi</Label>
                            <Input name="name" placeholder="Cth. Teknik Informatika" required />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export function EditDepartmentDialog({ department, faculties }: { department: any, faculties: any[] }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)
        const res = await updateDepartment(department.id, {
            code: formData.get('code') as string,
            name: formData.get('name') as string,
            facultyId: formData.get('facultyId') as string
        })
        setLoading(false)
        if (res.success) {
            toast({ title: 'Berhasil', description: 'Program Studi berhasil diperbarui' })
            setOpen(false)
        } else {
            toast({ title: 'Gagal', description: res.error, variant: 'destructive' })
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon"><Pencil className="w-4 h-4" /></Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle>Edit Program Studi</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Fakultas</Label>
                            <Select name="facultyId" defaultValue={department.facultyId} required>
                                <SelectTrigger><SelectValue placeholder="Pilih Fakultas..." /></SelectTrigger>
                                <SelectContent>
                                    {faculties.map(f => (
                                        <SelectItem key={f.id} value={f.id}>{f.code} - {f.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Kode Program Studi</Label>
                            <Input name="code" defaultValue={department.code} required />
                        </div>
                        <div className="space-y-2">
                            <Label>Nama Program Studi</Label>
                            <Input name="name" defaultValue={department.name} required />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export function DeleteUniversityDialog({ id, name }: { id: string, name: string }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        const res = await deleteUniversity(id)
        setLoading(false)
        if (res.success) {
            toast({ title: 'Berhasil', description: 'Universitas berhasil dihapus' })
            setOpen(false)
        } else {
            toast({ title: 'Gagal', description: res.error, variant: 'destructive' })
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle>Hapus Universitas</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus universitas <strong>{name}</strong>? Tindakan ini tidak dapat dibatalkan.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>Batal</Button>
                        <Button type="submit" variant="destructive" disabled={loading}>{loading ? 'Menghapus...' : 'Hapus'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export function DeleteFacultyDialog({ id, name }: { id: string, name: string }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        const res = await deleteFaculty(id)
        setLoading(false)
        if (res.success) {
            toast({ title: 'Berhasil', description: 'Fakultas berhasil dihapus' })
            setOpen(false)
        } else {
            toast({ title: 'Gagal', description: res.error, variant: 'destructive' })
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle>Hapus Fakultas</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus fakultas <strong>{name}</strong>? Tindakan ini tidak dapat dibatalkan.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>Batal</Button>
                        <Button type="submit" variant="destructive" disabled={loading}>{loading ? 'Menghapus...' : 'Hapus'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export function DeleteDepartmentDialog({ id, name }: { id: string, name: string }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        const res = await deleteDepartment(id)
        setLoading(false)
        if (res.success) {
            toast({ title: 'Berhasil', description: 'Program Studi berhasil dihapus' })
            setOpen(false)
        } else {
            toast({ title: 'Gagal', description: res.error, variant: 'destructive' })
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle>Hapus Program Studi</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus program studi <strong>{name}</strong>? Tindakan ini tidak dapat dibatalkan.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>Batal</Button>
                        <Button type="submit" variant="destructive" disabled={loading}>{loading ? 'Menghapus...' : 'Hapus'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
