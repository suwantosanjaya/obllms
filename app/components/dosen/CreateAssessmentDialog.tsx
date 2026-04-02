'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { createAssessment } from '@/app/actions/assessmentActions'
import { getCLOsByCourse } from '@/app/actions/obeActions'

type CLO = { id: string; code: string; description: string }
type SelectedCLO = { cloId: string; weight: number }

export function CreateAssessmentDialog({ courses }: { courses: { id: string, title: string }[] }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const [selectedCourseId, setSelectedCourseId] = useState('')
    const [availableClos, setAvailableClos] = useState<CLO[]>([])
    const [selectedClos, setSelectedClos] = useState<SelectedCLO[]>([])
    const [cloLoading, setCloLoading] = useState(false)

    const totalWeight = selectedClos.reduce((s, c) => s + (c.weight || 0), 0)

    useEffect(() => {
        if (!selectedCourseId) {
            setAvailableClos([])
            setSelectedClos([])
            return
        }
        setCloLoading(true)
        getCLOsByCourse(selectedCourseId).then(res => {
            setAvailableClos(res.success ? res.clos : [])
            setSelectedClos([])
            setCloLoading(false)
        })
    }, [selectedCourseId])

    function addClo(cloId: string) {
        if (selectedClos.find(c => c.cloId === cloId)) return
        setSelectedClos(prev => [...prev, { cloId, weight: 0 }])
    }

    function removeClo(cloId: string) {
        setSelectedClos(prev => prev.filter(c => c.cloId !== cloId))
    }

    function updateWeight(cloId: string, weight: number) {
        setSelectedClos(prev => prev.map(c => c.cloId === cloId ? { ...c, weight } : c))
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError('')

        if (selectedClos.length === 0) {
            setError('Pilih minimal 1 CPMK untuk tugas ini.')
            return
        }
        if (Math.abs(totalWeight - 100) > 0.01) {
            setError(`Total bobot CPMK harus 100%. Saat ini: ${totalWeight}%`)
            return
        }

        setLoading(true)
        const formData = new FormData(e.currentTarget)
        const title = formData.get('title') as string
        const description = formData.get('description') as string
        const dueDateStr = formData.get('dueDate') as string
        const courseId = selectedCourseId

        const res = await createAssessment({
            title,
            description,
            dueDate: new Date(dueDateStr),
            courseId,
            clos: selectedClos,
        })

        if (res.success) {
            setOpen(false)
            setSelectedCourseId('')
            setSelectedClos([])
        } else {
            setError(res.error || 'Gagal membuat tugas')
        }
        setLoading(false)
    }

    if (courses.length === 0) {
        return (
            <Button disabled>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Tugas (Buat Kelas Dulu)
            </Button>
        )
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Tugas Baru
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Buat Tugas Baru</DialogTitle>
                        <DialogDescription>
                            Isi detail tugas dan pilih CPMK beserta bobotnya (total harus 100%).
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {/* Title */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="title" className="text-right">Judul</Label>
                            <Input id="title" name="title" placeholder="Tugas 1: ERD" className="col-span-3" required />
                        </div>

                        {/* Course picker */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Kelas</Label>
                            <div className="col-span-3">
                                <Select value={selectedCourseId} onValueChange={setSelectedCourseId} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Kelas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {courses.map(course => (
                                            <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* CLO multi-select */}
                        {selectedCourseId && (
                            <div className="col-span-4 flex flex-col gap-3 rounded-lg border border-border bg-muted/20 p-3">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm font-semibold">CPMK yang Diukur</Label>
                                    <span className={`text-xs font-medium ${Math.abs(totalWeight - 100) < 0.01 ? 'text-green-500' : 'text-orange-500'}`}>
                                        Total bobot: {totalWeight}%
                                    </span>
                                </div>

                                {cloLoading && <p className="text-xs text-muted-foreground">Memuat CPMK...</p>}

                                {!cloLoading && availableClos.length === 0 && (
                                    <p className="text-xs text-muted-foreground">Belum ada CPMK untuk kelas ini. Buat CPMK di halaman OBL Alignment dulu.</p>
                                )}

                                {/* Available CLOs to add */}
                                {!cloLoading && availableClos.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {availableClos
                                            .filter(clo => !selectedClos.find(s => s.cloId === clo.id))
                                            .map(clo => (
                                                <button
                                                    key={clo.id}
                                                    type="button"
                                                    onClick={() => addClo(clo.id)}
                                                    className="text-xs border border-dashed border-border rounded px-2 py-1 hover:border-primary hover:text-primary transition-colors"
                                                >
                                                    + {clo.code}
                                                </button>
                                            ))}
                                    </div>
                                )}

                                {/* Selected CLOs with weight inputs */}
                                {selectedClos.map(sc => {
                                    const clo = availableClos.find(c => c.id === sc.cloId)
                                    if (!clo) return null
                                    return (
                                        <div key={sc.cloId} className="flex items-center gap-3 bg-card rounded border border-border p-2">
                                            <Badge variant="outline" className="shrink-0 font-mono">{clo.code}</Badge>
                                            <span className="text-xs text-muted-foreground flex-1 line-clamp-1">{clo.description}</span>
                                            <div className="flex items-center gap-1 shrink-0">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    placeholder="0"
                                                    value={sc.weight || ''}
                                                    onChange={e => updateWeight(sc.cloId, parseFloat(e.target.value) || 0)}
                                                    className="w-16 h-7 text-xs"
                                                    required
                                                />
                                                <span className="text-xs text-muted-foreground">%</span>
                                            </div>
                                            <button type="button" onClick={() => removeClo(sc.cloId)} className="text-muted-foreground hover:text-destructive">
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        {/* Description */}
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="description" className="text-right mt-2">Deskripsi</Label>
                            <Textarea id="description" name="description" placeholder="Instruksi pengerjaan tugas..." className="col-span-3 min-h-[80px]" required />
                        </div>

                        {/* Due date */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="dueDate" className="text-right">Tenggat</Label>
                            <Input id="dueDate" name="dueDate" type="datetime-local" className="col-span-3" required />
                        </div>

                        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
                        <Button type="submit" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan Tugas'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
