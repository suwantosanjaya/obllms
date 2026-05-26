'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createUser } from '@/app/actions/adminActions'

export function CreateUserDialog({ departments = [], allowedRoles = ['student', 'teacher', 'qa'] }: { departments?: { id: string, name: string, faculty?: { id: string, name: string } | null }[], allowedRoles?: string[] }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [selectedRoles, setSelectedRoles] = useState<string[]>([])
    const [selectedFacultyId, setSelectedFacultyId] = useState<string>('all')

    // Get unique faculty from departments
    const uniqueFaculty = Array.from(
        new Map(departments.filter(p => p.faculty).map(p => [p.faculty!.id, p.faculty])).values()
    )

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError('')

        const formData = new FormData(e.currentTarget)
        const name = formData.get('name') as string
        const email = formData.get('email') as string
        const roles = formData.getAll('roles') as string[]
        const role = roles.join(',')
        const departmentIds = formData.getAll('departmentIds') as string[]

        if (roles.length === 0) {
            setError('Pilih minimal satu peran.')
            setLoading(false)
            return
        }

        const needsDepartment = roles.some(r => ['qa', 'teacher', 'student', 'admin'].includes(r))

        const res = await createUser({ name, email, role, departmentIds: needsDepartment ? departmentIds : undefined })

        if (res.success) {
            setOpen(false)
        } else {
            setError(res.error || 'Failed to create user')
        }
        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Pengguna
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Tambah Pengguna Baru</DialogTitle>
                        <DialogDescription>
                            Masukkan detail pengguna dan pilih peran mereka.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Nama
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="Budi Santoso"
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">
                                Email
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="budi@campus.ac.id"
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right pt-2">
                                Peran
                            </Label>
                            <div className="col-span-3 space-y-2 border p-3 rounded-md">
                                {allowedRoles.map(r => (
                                    <div key={r} className="flex items-center space-x-2">
                                        <input 
                                            type="checkbox" 
                                            id={`role-${r}`} 
                                            name="roles" 
                                            value={r} 
                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedRoles([...selectedRoles, r])
                                                } else {
                                                    setSelectedRoles(selectedRoles.filter(role => role !== r))
                                                }
                                            }}
                                        />
                                        <Label htmlFor={`role-${r}`} className="font-normal cursor-pointer capitalize">
                                            {r === 'admin' ? 'Department Admin' : r.replace('_', ' ')}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {selectedRoles.some(r => ['qa', 'teacher', 'student', 'admin'].includes(r)) && departments.length > 0 && (
                            <div className="grid grid-cols-4 items-start gap-4">
                                <Label className="text-right pt-2">
                                    Program Studi
                                </Label>
                                <div className="col-span-3 space-y-3 border p-3 rounded-md">
                                    {uniqueFaculty.length > 0 && (
                                        <Select value={selectedFacultyId} onValueChange={setSelectedFacultyId}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Filter by Faculty" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Semua Faculty</SelectItem>
                                                {uniqueFaculty.map(f => (
                                                    <SelectItem key={f!.id} value={f!.id}>{f!.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                    <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                                        {departments.map(department => {
                                            const isVisible = selectedFacultyId === 'all' || department.faculty?.id === selectedFacultyId
                                            return (
                                                <div key={department.id} className={`items-center space-x-2 ${isVisible ? 'flex' : 'hidden'}`}>
                                                    <input 
                                                        type="checkbox" 
                                                        id={`department-${department.id}`} 
                                                        name="departmentIds" 
                                                        value={department.id} 
                                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                    />
                                                    <Label htmlFor={`department-${department.id}`} className="font-normal cursor-pointer">
                                                        {department.name}
                                                    </Label>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Menyimpan...' : 'Simpan'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
