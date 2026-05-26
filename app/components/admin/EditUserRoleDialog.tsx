'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { updateUserRole } from '@/app/actions/adminActions'
import { Edit2 } from 'lucide-react'

interface EditUserRoleDialogProps {
    user: {
        id: string
        name: string
        role: string
    }
    allowedRoles: string[]
}

const roleMap: Record<string, string> = {
    super_admin: 'Super Administrator',
    admin: 'Administrator (Departemen)',
    qa: 'Quality Assurance (QA)',
    teacher: 'Dosen (Teacher)',
    student: 'Mahasiswa (Student)'
}

export function EditUserRoleDialog({ user, allowedRoles }: EditUserRoleDialogProps) {
    const [open, setOpen] = useState(false)
    const [selectedRoles, setSelectedRoles] = useState<string[]>(user.role.split(',').map(r => r.trim()))
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

        const newRoleString = selectedRoles.join(',')

        if (newRoleString === user.role) {
            setOpen(false)
            return
        }

        setLoading(true)
        try {
            const res = await updateUserRole(user.id, newRoleString)
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
                    <Edit2 className="h-4 w-4" />
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
                            <div className="space-y-2 border p-3 rounded-md mt-2">
                                {allowedRoles.map(r => (
                                    <div key={r} className="flex items-center space-x-2">
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
                                        <Label htmlFor={`edit-role-${r}`} className="font-normal cursor-pointer">
                                            {roleMap[r] || r}
                                        </Label>
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
