'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { updateUserRole } from '@/app/actions/adminActions'
import { Pencil } from 'lucide-react'

interface EditUserRoleDialogProps {
    user: {
        id: string
        name: string
        role: string
        departmentRoles: any[]
    }
    allowedRoles: string[]
    departments?: { id: string, name: string }[]
}

const roleMap: Record<string, string> = {
    super_admin: 'Super Administrator',
    admin: 'Administrator (Universitas)',
    qa: 'Quality Assurance (QA)',
    teacher: 'Dosen (Teacher)',
    student: 'Mahasiswa (Student)'
}

export function EditUserRoleDialog({ user, allowedRoles, departments = [] }: EditUserRoleDialogProps) {
    const [open, setOpen] = useState(false)
    const initialSelectedRoles = user.role.split(',').map(r => r.trim()).filter(r => allowedRoles.includes(r))
    const [selectedRoles, setSelectedRoles] = useState<string[]>(initialSelectedRoles)
    
    // Initialize roleDepts from existing departmentRoles
    const initialRoleDepts: Record<string, string[]> = {}
    if (user.departmentRoles) {
        user.departmentRoles.forEach((dr: any) => {
            if (!initialRoleDepts[dr.role]) initialRoleDepts[dr.role] = []
            initialRoleDepts[dr.role].push(dr.departmentId)
        })
    }
    const [roleDepts, setRoleDepts] = useState<Record<string, string[]>>(initialRoleDepts)
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (selectedRoles.length === 0) {
            toast({
                variant: 'destructive',
                title: 'Validasi Gagal',
                description: 'Pengguna harus memiliki minimal satu peran.',
            })
            return
        }

        const managedRolesData = selectedRoles.map(role => ({
            role,
            departmentIds: roleDepts[role] || []
        }))

        setLoading(true)
        try {
            const res = await updateUserRole(user.id, managedRolesData)
            if (res.success) {
                toast({
                    title: 'Berhasil',
                    description: `Peran ${user.name} berhasil diperbarui.`,
                })
                setOpen(false)
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Gagal',
                    description: res.error || 'Terjadi kesalahan sistem.',
                })
            }
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Gagal mengubah peran.',
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only sm:not-sr-only">Edit Role</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Edit Peran Pengguna</DialogTitle>
                        <DialogDescription>
                            Ubah tingkat akses untuk {user.name}. Pengguna dapat memiliki lebih dari satu peran.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Peran Baru</Label>
                            <div className="space-y-4 border p-3 rounded-md mt-2 max-h-96 overflow-y-auto">
                                {allowedRoles.map(r => (
                                    <div key={r} className="flex flex-col space-y-1">
                                        <div className="flex items-center space-x-2">
                                            <input 
                                                type="checkbox" 
                                                id={`edit-role-${r}`} 
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
                                            <Label htmlFor={`edit-role-${r}`} className="font-normal cursor-pointer font-medium">
                                                {roleMap[r] || r}
                                            </Label>
                                        </div>
                                        
                                        {selectedRoles.includes(r) && departments && departments.length > 0 && (
                                            <div className="ml-6 mt-2 space-y-2 border-l-2 pl-4 border-muted py-1">
                                                <Label className="text-xs text-muted-foreground block mb-2">
                                                    {r === 'admin' ? 'Pilih Universitas:' : 'Pilih Program Studi:'}
                                                </Label>
                                                <div className="max-h-32 overflow-y-auto space-y-2 pr-2">
                                                    {r === 'admin' ? (
                                                        Array.from(new Map(departments.filter((d: any) => d.faculty?.university).map((d: any) => [d.faculty!.university!.id, d.faculty!.university])).values()).map((univ: any) => {
                                                            const univDeptIds = departments.filter((d: any) => d.faculty?.university?.id === univ.id).map(d => d.id)
                                                            const isSelected = univDeptIds.length > 0 && univDeptIds.every(id => roleDepts[r]?.includes(id))
                                                            return (
                                                                <div key={univ.id} className="flex items-center space-x-2">
                                                                    <input
                                                                        type="checkbox"
                                                                        id={`role-${r}-univ-${univ.id}`}
                                                                        checked={isSelected}
                                                                        onChange={(e) => {
                                                                            setRoleDepts(prev => {
                                                                                const next = { ...prev }
                                                                                if (!next[r]) next[r] = []
                                                                                if (e.target.checked) {
                                                                                    next[r] = [...new Set([...next[r], ...univDeptIds])]
                                                                                } else {
                                                                                    next[r] = next[r].filter(id => !univDeptIds.includes(id))
                                                                                }
                                                                                return next
                                                                            })
                                                                        }}
                                                                        className="h-3.5 w-3.5 rounded border-gray-300 text-primary focus:ring-primary"
                                                                    />
                                                                    <Label htmlFor={`role-${r}-univ-${univ.id}`} className="text-xs font-normal cursor-pointer">
                                                                        {univ.name}
                                                                    </Label>
                                                                </div>
                                                            )
                                                        })
                                                    ) : (
                                                        departments.map(d => (
                                                            <div key={d.id} className="flex items-center space-x-2">
                                                                <input
                                                                    type="checkbox"
                                                                    id={`role-${r}-dept-${d.id}`}
                                                                    checked={roleDepts[r]?.includes(d.id) || false}
                                                                    onChange={(e) => {
                                                                        setRoleDepts(prev => {
                                                                            const next = { ...prev }
                                                                            if (!next[r]) next[r] = []
                                                                            if (e.target.checked) {
                                                                                next[r] = [...next[r], d.id]
                                                                            } else {
                                                                                next[r] = next[r].filter(id => id !== d.id)
                                                                            }
                                                                            return next
                                                                        })
                                                                    }}
                                                                    className="h-3.5 w-3.5 rounded border-gray-300 text-primary focus:ring-primary"
                                                                />
                                                                <Label htmlFor={`role-${r}-dept-${d.id}`} className="text-xs font-normal cursor-pointer">
                                                                    {d.name}
                                                                </Label>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
