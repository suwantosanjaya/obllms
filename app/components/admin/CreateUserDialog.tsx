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

export function CreateUserDialog({ departments = [], allowedRoles = ['student', 'teacher', 'qa'], qaMode = false, fixedDepartmentId }: { 
    departments?: { id: string, name: string, faculty?: { id: string, name: string } | null }[], 
    allowedRoles?: string[],
    qaMode?: boolean,
    fixedDepartmentId?: string,
}) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    // In qaMode, pre-select teacher role and the fixed department
    const [selectedRoles, setSelectedRoles] = useState<string[]>(qaMode ? ['teacher'] : [])
    const [roleDepts, setRoleDepts] = useState<Record<string, string[]>>(qaMode && fixedDepartmentId ? { teacher: [fixedDepartmentId] } : {})
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
        if (selectedRoles.length === 0) {
            setError('Pilih minimal satu peran.')
            setLoading(false)
            return
        }

        const managedRolesData = selectedRoles.map(role => ({
            role,
            departmentIds: roleDepts[role] || []
        }))

        const res = await createUser({ name, email, managedRolesData })

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
                    {qaMode ? 'Tambah Dosen' : 'Tambah Pengguna'}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{qaMode ? 'Tambah Dosen Baru' : 'Tambah Pengguna Baru'}</DialogTitle>
                        <DialogDescription>
                            {qaMode 
                                ? 'Tambahkan akun dosen baru untuk program studi Anda. Password awal akan digenerate otomatis dan dosen wajib menggantinya saat login pertama.'
                                : 'Masukkan detail pengguna dan pilih peran mereka.'
                            }
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
                            <div className="col-span-3 space-y-4 border p-3 rounded-md max-h-96 overflow-y-auto">
                                {/* QA Mode: simplified - role is locked to teacher, dept is fixed */}
                                {qaMode ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                                            <span className="text-sm font-medium">Peran:</span>
                                            <span className="text-sm text-primary font-semibold">Dosen (Teacher)</span>
                                        </div>
                                        {departments.length > 0 && (
                                            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                                                <span className="text-sm font-medium">Program Studi:</span>
                                                <span className="text-sm text-primary font-semibold">{departments[0]?.name}</span>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        {uniqueFaculty.length > 0 && (
                                    <Select value={selectedFacultyId} onValueChange={setSelectedFacultyId}>
                                        <SelectTrigger className="mb-2 h-8 text-xs">
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
                                {allowedRoles.map(r => (
                                    <div key={r} className="flex flex-col space-y-1">
                                        <div className="flex items-center space-x-2">
                                            <input 
                                                type="checkbox" 
                                                id={`role-${r}`} 
                                                checked={selectedRoles.includes(r)}
                                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedRoles([...selectedRoles, r])
                                                    } else {
                                                        setSelectedRoles(selectedRoles.filter(role => role !== r))
                                                    }
                                                }}
                                            />
                                            <Label htmlFor={`role-${r}`} className="font-normal cursor-pointer capitalize font-medium">
                                                {r === 'admin' ? 'Administrator' : r.replace('_', ' ')}
                                            </Label>
                                        </div>
                                        
                                        {selectedRoles.includes(r) && departments && departments.length > 0 && (
                                            <div className="ml-6 mt-2 space-y-2 border-l-2 pl-4 border-muted py-1">
                                                <Label className="text-xs text-muted-foreground block mb-2">Pilih Program Studi:</Label>
                                                <div className="max-h-32 overflow-y-auto space-y-2 pr-2">
                                                    {departments.map(department => {
                                                        const isVisible = selectedFacultyId === 'all' || department.faculty?.id === selectedFacultyId
                                                        return (
                                                            <div key={department.id} className={`items-center space-x-2 ${isVisible ? 'flex' : 'hidden'}`}>
                                                                <input
                                                                    type="checkbox"
                                                                    id={`role-${r}-dept-${department.id}`}
                                                                    checked={roleDepts[r]?.includes(department.id) || false}
                                                                    onChange={(e) => {
                                                                        setRoleDepts(prev => {
                                                                            const next = { ...prev }
                                                                            if (!next[r]) next[r] = []
                                                                            if (e.target.checked) {
                                                                                next[r] = [...next[r], department.id]
                                                                            } else {
                                                                                next[r] = next[r].filter(id => id !== department.id)
                                                                            }
                                                                            return next
                                                                        })
                                                                    }}
                                                                    className="h-3.5 w-3.5 rounded border-gray-300 text-primary focus:ring-primary"
                                                                />
                                                                <Label htmlFor={`role-${r}-dept-${department.id}`} className="text-xs font-normal cursor-pointer">
                                                                    {department.name}
                                                                </Label>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                    </>
                                )}
                            </div>
                        </div>
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
