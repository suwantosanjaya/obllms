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
import { Plus, Edit, Trash2 } from 'lucide-react'
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
        const res = await createUniversity({
            code: formData.get('code') as string,
            name: formData.get('name') as string
        })
        setLoading(false)
        if (res.success) {
            toast({ title: 'Success', description: 'University created successfully' })
            setOpen(false)
        } else {
            toast({ title: 'Error', description: res.error, variant: 'destructive' })
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm"><Plus className="w-4 h-4 mr-2" />Add University</Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle>Add University</DialogTitle>
                        <DialogDescription>Add a new university to the system.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>University Code</Label>
                            <Input name="code" placeholder="e.g. UNIV1" required />
                        </div>
                        <div className="space-y-2">
                            <Label>University Name</Label>
                            <Input name="name" placeholder="e.g. State University" required />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export function EditUniversityDialog({ university }: { university: { id: string, code: string, name: string } }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)
        const res = await updateUniversity(university.id, {
            code: formData.get('code') as string,
            name: formData.get('name') as string
        })
        setLoading(false)
        if (res.success) {
            toast({ title: 'Success', description: 'University updated successfully' })
            setOpen(false)
        } else {
            toast({ title: 'Error', description: res.error, variant: 'destructive' })
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon"><Edit className="w-4 h-4" /></Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle>Edit University</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>University Code</Label>
                            <Input name="code" defaultValue={university.code} required />
                        </div>
                        <div className="space-y-2">
                            <Label>University Name</Label>
                            <Input name="name" defaultValue={university.name} required />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
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
            toast({ title: 'Success', description: 'Faculty created successfully' })
            setOpen(false)
        } else {
            toast({ title: 'Error', description: res.error, variant: 'destructive' })
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline"><Plus className="w-4 h-4 mr-2" />Add Faculty</Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle>Add Faculty</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>University</Label>
                            <Select name="universityId" required>
                                <SelectTrigger><SelectValue placeholder="Select University..." /></SelectTrigger>
                                <SelectContent>
                                    {universities.map(u => (
                                        <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Faculty Code</Label>
                            <Input name="code" placeholder="e.g. FT" required />
                        </div>
                        <div className="space-y-2">
                            <Label>Faculty Name</Label>
                            <Input name="name" placeholder="e.g. Faculty of Engineering" required />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
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
            toast({ title: 'Success', description: 'Faculty updated successfully' })
            setOpen(false)
        } else {
            toast({ title: 'Error', description: res.error, variant: 'destructive' })
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon"><Edit className="w-4 h-4" /></Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle>Edit Faculty</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>University</Label>
                            <Select name="universityId" defaultValue={faculty.universityId} required>
                                <SelectTrigger><SelectValue placeholder="Select University..." /></SelectTrigger>
                                <SelectContent>
                                    {universities.map(u => (
                                        <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Faculty Code</Label>
                            <Input name="code" defaultValue={faculty.code} required />
                        </div>
                        <div className="space-y-2">
                            <Label>Faculty Name</Label>
                            <Input name="name" defaultValue={faculty.name} required />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
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
            toast({ title: 'Success', description: 'Department created successfully' })
            setOpen(false)
        } else {
            toast({ title: 'Error', description: res.error, variant: 'destructive' })
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline"><Plus className="w-4 h-4 mr-2" />Add Department</Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle>Add Department</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Faculty</Label>
                            <Select name="facultyId" required>
                                <SelectTrigger><SelectValue placeholder="Select Faculty..." /></SelectTrigger>
                                <SelectContent>
                                    {faculties.map(f => (
                                        <SelectItem key={f.id} value={f.id}>{f.code} - {f.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Department Code</Label>
                            <Input name="code" placeholder="e.g. TI" required />
                        </div>
                        <div className="space-y-2">
                            <Label>Department Name</Label>
                            <Input name="name" placeholder="e.g. Information Technology" required />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
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
            toast({ title: 'Success', description: 'Department updated successfully' })
            setOpen(false)
        } else {
            toast({ title: 'Error', description: res.error, variant: 'destructive' })
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon"><Edit className="w-4 h-4" /></Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle>Edit Department</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Faculty</Label>
                            <Select name="facultyId" defaultValue={department.facultyId} required>
                                <SelectTrigger><SelectValue placeholder="Select Faculty..." /></SelectTrigger>
                                <SelectContent>
                                    {faculties.map(f => (
                                        <SelectItem key={f.id} value={f.id}>{f.code} - {f.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Department Code</Label>
                            <Input name="code" defaultValue={department.code} required />
                        </div>
                        <div className="space-y-2">
                            <Label>Department Name</Label>
                            <Input name="name" defaultValue={department.name} required />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
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
            toast({ title: 'Success', description: 'University deleted successfully' })
            setOpen(false)
        } else {
            toast({ title: 'Error', description: res.error, variant: 'destructive' })
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
                        <DialogTitle>Delete University</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete university <strong>{name}</strong>? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
                        <Button type="submit" variant="destructive" disabled={loading}>{loading ? 'Deleting...' : 'Delete'}</Button>
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
            toast({ title: 'Success', description: 'Faculty deleted successfully' })
            setOpen(false)
        } else {
            toast({ title: 'Error', description: res.error, variant: 'destructive' })
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
                        <DialogTitle>Delete Faculty</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete faculty <strong>{name}</strong>? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
                        <Button type="submit" variant="destructive" disabled={loading}>{loading ? 'Deleting...' : 'Delete'}</Button>
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
            toast({ title: 'Success', description: 'Department deleted successfully' })
            setOpen(false)
        } else {
            toast({ title: 'Error', description: res.error, variant: 'destructive' })
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
                        <DialogTitle>Delete Department</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete department <strong>{name}</strong>? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
                        <Button type="submit" variant="destructive" disabled={loading}>{loading ? 'Deleting...' : 'Delete'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
