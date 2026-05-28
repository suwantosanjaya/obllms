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
import { Textarea } from '@/components/ui/textarea'
import { createCurriculumYear } from '@/app/actions/obeActions'

export function CreateCurriculumYearDialog({ departmentId }: { departmentId?: string }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError('')

        const formData = new FormData(e.currentTarget)
        const name = formData.get('name') as string
        const startYearStr = formData.get('startYear') as string
        const endYearStr = formData.get('endYear') as string
        const description = formData.get('description') as string
        
        const startYear = parseInt(startYearStr)
        const endYear = parseInt(endYearStr)

        const res = await createCurriculumYear(name, startYear, endYear, description, departmentId)

        if (res.success) {
            setOpen(false)
        } else {
            setError(res.error || 'Gagal membuat tahun kurikulum')
        }
        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Tahun
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Tambah Tahun Kurikulum</DialogTitle>
                        <DialogDescription>
                            Masukkan tahun akademik, misalnya "2024/2025"
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Nama Kurikulum</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="Kurikulum 2024"
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="startYear" className="text-right">Tahun Awal</Label>
                            <Input
                                id="startYear"
                                name="startYear"
                                type="number"
                                placeholder="2024"
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="endYear" className="text-right">Tahun Akhir</Label>
                            <Input
                                id="endYear"
                                name="endYear"
                                type="number"
                                placeholder="2028"
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">Keterangan</Label>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="Keterangan atau deskripsi singkat..."
                                className="col-span-3"
                            />
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
