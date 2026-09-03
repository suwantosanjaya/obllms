'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, AlertCircle } from 'lucide-react'
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
import { Switch } from '@/components/ui/switch'
import { createAssessment } from '@/app/actions/assessmentActions'
import { getCLOsBySubject } from '@/app/actions/obeActions'

type CLO = { id: string; code: string; description: string }
type SelectedCLO = { cloId: string; weight: number }

export function EditAssessmentDialog({ courses, assessment, hasGradedSubmissions }: { 
    courses: { id: string, subjectId: string, title: string, curriculumYearId?: string | null }[],
    assessment: any,
    hasGradedSubmissions: boolean
}) {
    const router = useRouter()

    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const [selectedCourseId, setSelectedCourseId] = useState(assessment.courseId)
    const [allMappings, setAllMappings] = useState<any[]>([])
    const [availableClos, setAvailableClos] = useState<CLO[]>([])
    const [selectedClos, setSelectedClos] = useState<SelectedCLO[]>(assessment.assessmentClos.map((ac: any) => ({ cloId: ac.cloId, weight: ac.weight })))
    const [availableTechniques, setAvailableTechniques] = useState<string[]>([assessment.type])
    const [selectedTechnique, setSelectedTechnique] = useState(assessment.type)
    const [format, setFormat] = useState(assessment.format || 'upload') // 'upload' or 'quiz'
    const [allowReview, setAllowReview] = useState(assessment.allowReview ?? false)
    const [isScorePublished, setIsScorePublished] = useState(assessment.isScorePublished ?? true)
    const [shuffleQuestions, setShuffleQuestions] = useState(assessment.shuffleQuestions ?? false)
    const [cloLoading, setCloLoading] = useState(false)

    // Setup default due date: existing
    const defaultDueDateStr = new Date(assessment.dueDate.getTime() - (assessment.dueDate.getTimezoneOffset() * 60000)).toISOString().slice(0, 16)

    const totalWeight = selectedClos.reduce((s, c) => s + (c.weight || 0), 0)

    useEffect(() => {
        if (courses.length === 1 && !selectedCourseId) {
            setSelectedCourseId(courses[0].id)
        }
    }, [courses])

    useEffect(() => {
        if (!open) return // Only fetch when opened
        if (!selectedCourseId) {
            setAvailableClos([])
            return
        }
        const selectedCourse = courses.find(c => c.id === selectedCourseId)
        if (!selectedCourse?.subjectId) {
            setAvailableClos([])
            setSelectedClos([])
            return
        }

        setCloLoading(true)
        getCLOsBySubject(selectedCourse.subjectId).then(res => {
            if (res.success) {
                setAllMappings(res.mappings)
                const uniqueTechniques = new Set<string>()
                res.mappings.forEach((m: any) => {
                    const isMatchingYear = selectedCourse.curriculumYearId
                        ? m.clo.curriculumYearId === selectedCourse.curriculumYearId
                        : true;
                    if (isMatchingYear && m.techniques) {
                        m.techniques.forEach((t: any) => uniqueTechniques.add(t.technique))
                    }
                })
                
                const techArray = Array.from(uniqueTechniques)
                if (!techArray.includes(assessment.type)) techArray.push(assessment.type)

                if (techArray.length > 0) {
                    setAvailableTechniques(techArray)
                    if (!techArray.includes(selectedTechnique)) setSelectedTechnique(techArray[0])
                } else {
                    const fallback = ['Tugas', 'Kuis', 'Ujian Tulis']
                    if (!fallback.includes(assessment.type)) fallback.push(assessment.type)
                    setAvailableTechniques(fallback)
                    if (!fallback.includes(selectedTechnique)) setSelectedTechnique(fallback[0])
                }
            } else {
                setAllMappings([])
                setAvailableTechniques([assessment.type, 'Tugas', 'Kuis', 'Ujian Tulis'].filter((v, i, a) => a.indexOf(v) === i))
                setSelectedTechnique(assessment.type)
            }
            setCloLoading(false)
        })
    }, [selectedCourseId, courses])

    useEffect(() => {
        if (!selectedCourseId || allMappings.length === 0) {
            setAvailableClos([])
            return
        }
        const selectedCourse = courses.find(c => c.id === selectedCourseId)
        if (!selectedCourse) return

        const uniqueClosMap = new Map()
        
        // Ensure originally mapped CLOs are always available for re-adding
        if (assessment.assessmentClos) {
            assessment.assessmentClos.forEach((ac: any) => {
                if (ac.clo && !uniqueClosMap.has(ac.cloId)) {
                    uniqueClosMap.set(ac.cloId, ac.clo)
                }
            })
        }

        allMappings.forEach((m: any) => {
            const isMatchingYear = selectedCourse.curriculumYearId
                ? m.clo.curriculumYearId === selectedCourse.curriculumYearId
                : true;
            
            // Check if this mapping supports the selected technique
            const hasTechnique = m.techniques && m.techniques.length > 0
                ? m.techniques.some((t: any) => t.technique === selectedTechnique)
                : true; // fallback if no techniques defined in mapping

            if (isMatchingYear && hasTechnique && !uniqueClosMap.has(m.clo.id)) {
                uniqueClosMap.set(m.clo.id, m.clo)
            }
        })
        setAvailableClos(Array.from(uniqueClosMap.values()))
    }, [selectedCourseId, allMappings, selectedTechnique, courses])

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
            setError('Pilih minimal 1 CLO untuk tugas ini.')
            return
        }
        if (Math.abs(totalWeight - 100) > 0.01) {
            setError(`Total bobot CLO harus 100%. Saat ini: ${totalWeight}%`)
            return
        }

        setLoading(true)
        const formData = new FormData(e.currentTarget)
        const title = formData.get('title') as string
        const description = formData.get('description') as string
        const dueDateStr = formData.get('dueDate') as string

        const { updateAssessment } = await import('@/app/actions/assessmentActions')
        const res = await updateAssessment({
            id: assessment.id,
            title,
            description,
            type: selectedTechnique,
            dueDate: new Date(dueDateStr),
            courseId: selectedCourseId,
            clos: selectedClos,
            allowReview,
            isScorePublished,
            shuffleQuestions,
        })

        if (res.success) {
            setOpen(false)
        } else {
            setError(res.error || 'Gagal mengubah tugas')
        }
        setLoading(false)
    }

    if (courses.length === 0) return null

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" title="Edit Tugas" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-100">
                    <Pencil className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-130 max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Edit Penugasan</DialogTitle>
                        <DialogDescription>
                            Ubah detail penugasan.
                            {hasGradedSubmissions && (
                                <span className="block mt-2 p-2 bg-orange-100 text-orange-800 rounded text-xs items-start gap-2">
                                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                    <span>Tugas ini sudah dinilai. Teknik Penilaian dan Pemetaan CLO dikunci agar tidak merusak perhitungan OBE mahasiswa.</span>
                                </span>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {/* Title */}
                        <div className="grid gap-2">
                            <Label htmlFor="title">Judul</Label>
                            <Input id="title" name="title" defaultValue={assessment.title} placeholder="Tugas 1: ERD" required />
                        </div>

                        {/* Type / Technique picker */}
                        <div className="grid gap-2">
                            <Label>Teknik Penilaian</Label>
                            <Select value={selectedTechnique} onValueChange={setSelectedTechnique} required disabled={hasGradedSubmissions}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Teknik Penilaian" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableTechniques.map(t => (
                                        <SelectItem key={t} value={t}>{t}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Format picker */}
                        <div className="grid gap-2">
                            <Label>Format Tugas</Label>
                            <Select value={format} onValueChange={setFormat} required disabled>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Format" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="upload">Unggah File / Teks Biasa</SelectItem>
                                    <SelectItem value="quiz">Kuis Interaktif (CBT)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Is Score Published */}
                        <div className="grid gap-2 p-3 bg-muted/10 border rounded-lg">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="editIsScorePublished">Tampilkan Nilai ke Mahasiswa</Label>
                                <Switch
                                    id="editIsScorePublished"
                                    checked={isScorePublished}
                                    onCheckedChange={setIsScorePublished}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {isScorePublished ? 'Mahasiswa dapat melihat nilai mereka.' : 'Nilai disembunyikan sampai Anda mempublikasikannya.'}
                            </p>
                        </div>

                        {/* Allow Review & Shuffle switches (only for quiz) */}
                        {format === 'quiz' && (
                            <div className="space-y-3">
                                <div className="grid gap-2 p-3 bg-muted/10 border rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="editAllowReview">Akses Kunci Jawaban</Label>
                                        <Switch
                                            id="editAllowReview"
                                            checked={allowReview}
                                            onCheckedChange={setAllowReview}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {allowReview ? 'Mahasiswa dapat melihat review (kunci jawaban) setelah selesai mengerjakan.' : 'Mahasiswa hanya melihat skor akhir (default).'}
                                    </p>
                                </div>
                                <div className="grid gap-2 p-3 bg-muted/10 border rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="editShuffleQuestions">Acak Urutan Soal</Label>
                                        <Switch
                                            id="editShuffleQuestions"
                                            checked={shuffleQuestions}
                                            onCheckedChange={setShuffleQuestions}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {shuffleQuestions ? 'Urutan soal akan diacak untuk setiap mahasiswa.' : 'Urutan soal akan sama persis seperti yang Anda buat.'}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Course picker */}
                        {courses.length > 1 && (
                            <div className="grid gap-2">
                                <Label>Kelas</Label>
                                <Select value={selectedCourseId} onValueChange={setSelectedCourseId} required disabled>
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
                        )}

                        {/* CLO multi-select */}
                        {selectedCourseId && (
                            <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/20 p-3 mt-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm font-semibold">CLO yang Diukur</Label>
                                    <span className={`text-xs font-medium ${Math.abs(totalWeight - 100) < 0.01 ? 'text-green-500' : 'text-orange-500'}`}>
                                        Total bobot: {totalWeight}%
                                    </span>
                                </div>

                                {cloLoading && <p className="text-xs text-muted-foreground">Memuat CLO...</p>}

                                {!cloLoading && availableClos.length === 0 && selectedClos.length === 0 && !hasGradedSubmissions && (
                                    <div className="text-xs text-muted-foreground bg-orange-50 text-orange-800 p-2 rounded border border-orange-200">
                                        <span className="font-semibold block mb-1">Perhatian!</span>
                                        Tidak ada CLO yang terhubung dengan teknik penilaian <b>{selectedTechnique}</b> pada kurikulum mata kuliah ini. 
                                        <br/>Silakan pilih teknik penilaian lain, atau hubungi QA untuk memperbarui pemetaan OBL.
                                    </div>
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
                                                    disabled={hasGradedSubmissions}
                                                    className="text-xs border border-dashed border-border rounded px-2 py-1 hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
                                                >
                                                    + {clo.code}
                                                </button>
                                            ))}
                                    </div>
                                )}

                                {/* Selected CLOs with weight inputs */}
                                {selectedClos.map(sc => {
                                    const clo = availableClos.find(c => c.id === sc.cloId) || assessment.assessmentClos.find((ac: any) => ac.cloId === sc.cloId)?.clo
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
                                                    disabled={hasGradedSubmissions}
                                                    required
                                                />
                                                <span className="text-xs text-muted-foreground">%</span>
                                            </div>
                                            {/* Opsi hapus CLO dinonaktifkan saat edit */}
                                            <button type="button" disabled className="text-muted-foreground/30 cursor-not-allowed" title="Penghapusan CLO tidak diizinkan saat mengedit">
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        {/* Description */}
                        <div className="grid gap-2">
                            <Label htmlFor="description">Deskripsi</Label>
                            <Textarea id="description" name="description" defaultValue={assessment.description} placeholder="Instruksi pengerjaan tugas..." className="min-h-[80px]" required />
                        </div>

                        {/* Due date */}
                        <div className="grid gap-2">
                            <Label htmlFor="dueDate">Tenggat Waktu (Due Date)</Label>
                            <Input id="dueDate" name="dueDate" type="datetime-local" defaultValue={defaultDueDateStr} required />
                        </div>

                        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
                        <Button type="submit" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan Perubahan'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
