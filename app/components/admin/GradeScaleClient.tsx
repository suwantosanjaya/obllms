'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { upsertGradeScale, deleteGradeScale } from '@/app/actions/gradeScaleActions'
import { Trash2, Plus, Save } from 'lucide-react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function GradeScaleClient({ initialScales, universityId }: { initialScales: any[], universityId?: string | null }) {
    const [scales, setScales] = useState(initialScales)
    const [loading, setLoading] = useState(false)
    const [deleteId, setDeleteId] = useState<string | null>(null)

    const handleAddRow = () => {
        setScales([...scales, { id: 'new_' + Date.now(), grade: '', minScore: 0, maxScore: 100, point: 0, isNew: true }])
    }

    const handleChange = (id: string, field: string, value: string) => {
        setScales(scales.map(s => s.id === id ? { ...s, [field]: value } : s))
    }

    const handleSave = async (scale: any) => {
        setLoading(true)
        const payload = {
            id: scale.isNew ? 'new' : scale.id,
            grade: scale.grade,
            minScore: scale.minScore,
            maxScore: scale.maxScore,
            point: scale.point
        }
        const res = await upsertGradeScale(payload, universityId)
        if (res.success) {
            setScales(scales.map(s => s.id === scale.id ? { ...res.data, isNew: false } : s).sort((a, b) => b.minScore - a.minScore))
        } else {
            alert(res.error)
        }
        setLoading(false)
    }

    const confirmDelete = (id: string) => {
        setDeleteId(id)
    }

    const handleDelete = async () => {
        if (!deleteId) return
        setLoading(true)
        if (!deleteId.startsWith('new_')) {
            await deleteGradeScale(deleteId)
        }
        setScales(scales.filter(s => s.id !== deleteId))
        setDeleteId(null)
        setLoading(false)
    }

    return (
        <div className="space-y-4">
            <Button onClick={handleAddRow} disabled={loading} variant="outline" size="sm" className="mb-2">
                <Plus className="mr-2 h-4 w-4" /> Tambah Rentang
            </Button>
            
            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Huruf (Grade)</TableHead>
                            <TableHead>Batas Bawah (&gt;=)</TableHead>
                            <TableHead>Batas Atas (&lt;)</TableHead>
                            <TableHead>Point (GPA)</TableHead>
                            <TableHead className="w-[120px]">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {scales.map((s) => (
                            <TableRow key={s.id}>
                                <TableCell>
                                    <Input value={s.grade} onChange={(e) => handleChange(s.id, 'grade', e.target.value)} placeholder="A" />
                                </TableCell>
                                <TableCell>
                                    <Input type="number" step="0.1" value={s.minScore} onChange={(e) => handleChange(s.id, 'minScore', e.target.value)} />
                                </TableCell>
                                <TableCell>
                                    <Input type="number" step="0.1" value={s.maxScore} onChange={(e) => handleChange(s.id, 'maxScore', e.target.value)} />
                                </TableCell>
                                <TableCell>
                                    <Input type="number" step="0.1" value={s.point} onChange={(e) => handleChange(s.id, 'point', e.target.value)} />
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <Button size="icon" variant="ghost" onClick={() => handleSave(s)} disabled={loading} title="Simpan" className="text-primary hover:bg-primary/10">
                                            <Save className="h-4 w-4" />
                                        </Button>
                                        <Button size="icon" variant="ghost" onClick={() => confirmDelete(s.id)} disabled={loading} className="text-destructive hover:bg-destructive/10">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {scales.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                    Belum ada data rentang nilai.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Rentang Nilai?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini akan menghapus rentang nilai secara permanen. Apakah Anda yakin?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={loading}>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} disabled={loading} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Ya, Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
