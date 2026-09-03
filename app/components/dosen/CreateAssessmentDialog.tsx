'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
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
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { createAssessment, duplicateAssessment, getAssessmentsBySubject } from '@/app/actions/assessmentActions'
import { getCLOsBySubject } from '@/app/actions/obeActions'

type CLO = { id: string; code: string; description: string; curriculumYearId?: string | null }
type SelectedCLO = { cloId: string; weight: number }
type AssessmentTechnique = { technique: string }
type SubjectCLOMapping = { clo: CLO; techniques?: AssessmentTechnique[] }
type DuplicationAssessment = {
    id: string;
    title: string;
    type: string;
    format: string;
    course?: { classCode?: string | null } | null;
    questions?: { id: string }[];
}

export function CreateAssessmentDialog({ courses }: { courses: { id: string, subjectId: string, title: string, curriculumYearId?: string | null }[] }) {
    const router = useRouter()

    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const [selectedCourseId, setSelectedCourseId] = useState(courses.length === 1 ? courses[0].id : '')
    const [allMappings, setAllMappings] = useState<SubjectCLOMapping[]>([])
    const [selectedClos, setSelectedClos] = useState<SelectedCLO[]>([])
    const [availableTechniques, setAvailableTechniques] = useState<string[]>([])
    const [selectedTechnique, setSelectedTechnique] = useState('')
    const [format, setFormat] = useState('upload') // 'upload' or 'quiz'
    const [allowReview, setAllowReview] = useState(false)
    const [isScorePublished, setIsScorePublished] = useState(false)
    const [shuffleQuestions, setShuffleQuestions] = useState(false)
    const [timeLimit, setTimeLimit] = useState<number | ''>('')
    const [cloLoading, setCloLoading] = useState(false)
    const { toast } = useToast()

    // Duplication state
    const [duplicationAssessments, setDuplicationAssessments] = useState<DuplicationAssessment[]>([])
    const [selectedDuplicateId, setSelectedDuplicateId] = useState('')
    const [dupLoading, setDupLoading] = useState(false)

    // Setup default due date: 7 days from now at 23:59
    const defaultDueDate = new Date()
    defaultDueDate.setDate(defaultDueDate.getDate() + 7)
    defaultDueDate.setHours(23, 59, 0, 0)
    const tzOffset = defaultDueDate.getTimezoneOffset() * 60000
    const defaultDueDateStr = (new Date(defaultDueDate.getTime() - tzOffset)).toISOString().slice(0, 16)

    const totalWeight = selectedClos.reduce((s, c) => s + (c.weight || 0), 0)

    const availableClos = useMemo(() => {
        if (!selectedCourseId || allMappings.length === 0) {
            return []
        }
        const selectedCourse = courses.find(c => c.id === selectedCourseId)
        if (!selectedCourse) return []

        const uniqueClosMap = new Map()
        allMappings.forEach((m: SubjectCLOMapping) => {
            const isMatchingYear = selectedCourse.curriculumYearId
                ? m.clo.curriculumYearId === selectedCourse.curriculumYearId
                : true;
            
            // Check if this mapping supports the selected technique
            const hasTechnique = m.techniques && m.techniques.length > 0
                ? m.techniques.some((t: AssessmentTechnique) => t.technique === selectedTechnique)
                : true; // fallback if no techniques defined in mapping

            if (isMatchingYear && hasTechnique && !uniqueClosMap.has(m.clo.id)) {
                uniqueClosMap.set(m.clo.id, m.clo)
            }
        })
        return Array.from(uniqueClosMap.values())
    }, [selectedCourseId, allMappings, selectedTechnique, courses])

    const [prevAvailableClos, setPrevAvailableClos] = useState<CLO[]>(availableClos)
    if (availableClos !== prevAvailableClos) {
        setPrevAvailableClos(availableClos)
        const availableIds = new Set(availableClos.map(c => c.id))
        setSelectedClos(prev => prev.filter(c => availableIds.has(c.cloId)))
    }

    useEffect(() => {
        const fetchCourseData = async () => {
            if (!selectedCourseId) {
                setAllMappings([])
                setSelectedClos([])
                return
            }
            const selectedCourse = courses.find(c => c.id === selectedCourseId)
            if (!selectedCourse?.subjectId) {
                setAllMappings([])
                setSelectedClos([])
                return
            }

            setCloLoading(true)
            try {
                const res = await getCLOsBySubject(selectedCourse.subjectId)
                if (res.success) {
                    setAllMappings(res.mappings)
                    const uniqueTechniques = new Set<string>()
                    res.mappings.forEach((m: SubjectCLOMapping) => {
                        const isMatchingYear = selectedCourse.curriculumYearId
                            ? m.clo.curriculumYearId === selectedCourse.curriculumYearId
                            : true;
                        if (isMatchingYear && m.techniques) {
                            m.techniques.forEach((t: AssessmentTechnique) => uniqueTechniques.add(t.technique))
                        }
                    })
                    
                    const techArray = Array.from(uniqueTechniques)
                    if (techArray.length > 0) {
                        setAvailableTechniques(techArray)
                        setSelectedTechnique(techArray[0])
                    } else {
                        const fallback = ['Tugas', 'Kuis', 'Ujian Tulis']
                        setAvailableTechniques(fallback)
                        setSelectedTechnique(fallback[0])
                    }
                } else {
                    setAllMappings([])
                    setAvailableTechniques(['Tugas', 'Kuis', 'Ujian Tulis'])
                    setSelectedTechnique('Tugas')
                }
                setSelectedClos([])
                setCloLoading(false)
            } catch {
                setCloLoading(false)
            }
            
            // Fetch assessments for duplication
            try {
                const dupRes = await getAssessmentsBySubject(selectedCourse.subjectId, selectedCourse.id)
                if (dupRes.success && dupRes.assessments) {
                    setDuplicationAssessments(dupRes.assessments)
                } else {
                    setDuplicationAssessments([])
                }
            } catch {
                setDuplicationAssessments([])
            }
        }
        fetchCourseData()
    }, [selectedCourseId, courses])

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
        const courseId = selectedCourseId

        const res = await createAssessment({
            title,
            description,
            type: selectedTechnique,
            dueDate: new Date(dueDateStr),
            courseId,
            clos: selectedClos,
            format,
            allowReview,
            isScorePublished,
            shuffleQuestions,
            timeLimit: timeLimit === '' ? null : Number(timeLimit)
        })

        if (res.success) {
            setOpen(false)
            setSelectedCourseId(courses.length === 1 ? courses[0].id : '')
            setSelectedClos([])
            if (format === 'quiz' && res.assessmentId) {
                router.push(`/teacher/course/${courseId}/assessment/${res.assessmentId}/builder`)
            }
        } else {
            setError(res.error || 'Gagal membuat tugas')
        }
        setLoading(false)
    }

    async function handleDuplicate(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError('')
        if (!selectedDuplicateId) {
            setError('Pilih tugas/kuis yang ingin diduplikat.')
            return
        }

        setDupLoading(true)
        const res = await duplicateAssessment(selectedDuplicateId, selectedCourseId)
        if (res.success) {
            setOpen(false)
            toast({ title: 'Berhasil', description: 'Tugas/Kuis berhasil diduplikat!' })
            router.refresh()
        } else {
            setError(res.error || 'Gagal menduplikat tugas')
        }
        setDupLoading(false)
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
            <DialogContent className="sm:max-w-175 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Buat atau Salin Tugas</DialogTitle>
                    <DialogDescription>
                        Pilih untuk membuat tugas baru dari awal, atau menyalin tugas yang sudah ada dari kelas lain.
                    </DialogDescription>
                </DialogHeader>

                {error && <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-4">{error}</div>}

                <Tabs defaultValue="new" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="new">Tugas Baru</TabsTrigger>
                        <TabsTrigger value="duplicate">Salin dari Kelas Lain</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="new">
                        <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        {/* Course picker - MOVED TO TOP */}
                        <div className="grid gap-2">
                            <Label>Kelas</Label>
                            <Select value={selectedCourseId} onValueChange={setSelectedCourseId} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Kelas Terlebih Dahulu" />
                                </SelectTrigger>
                                <SelectContent>
                                    {courses.map(course => (
                                        <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">Pilih kelas untuk memuat Teknik Penilaian dan CLO yang tersedia.</p>
                        </div>

                        {/* Title */}
                        <div className="grid gap-2">
                            <Label htmlFor="title">Judul</Label>
                            <Input id="title" name="title" placeholder="Tugas 1: ERD" required />
                        </div>

                        {/* Type / Technique picker */}
                        <div className="grid gap-2">
                            <Label>Teknik Penilaian</Label>
                            <Select value={selectedTechnique} onValueChange={setSelectedTechnique} required disabled={!selectedCourseId}>
                                <SelectTrigger>
                                    <SelectValue placeholder={selectedCourseId ? "Pilih Teknik Penilaian" : "Pilih kelas dulu"} />
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
                            <Select value={format} onValueChange={setFormat} required>
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
                                <Label htmlFor="isScorePublished">Tampilkan Nilai ke Mahasiswa</Label>
                                <Switch
                                    id="isScorePublished"
                                    checked={isScorePublished}
                                    onCheckedChange={setIsScorePublished}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {isScorePublished ? 'Mahasiswa dapat melihat nilai mereka.' : 'Nilai disembunyikan sampai Anda mempublikasikannya.'}
                            </p>
                        </div>

                        {/* Allow Review switch (only for quiz) */}
                        {format === 'quiz' && (
                            <div className="grid gap-4">
                                <div className="grid gap-2 p-3 bg-muted/10 border rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="allowReview">Akses Kunci Jawaban</Label>
                                        <Switch
                                            id="allowReview"
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
                                        <Label htmlFor="shuffleQuestions">Acak Urutan Soal</Label>
                                        <Switch
                                            id="shuffleQuestions"
                                            checked={shuffleQuestions}
                                            onCheckedChange={setShuffleQuestions}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {shuffleQuestions ? 'Urutan soal akan diacak untuk setiap mahasiswa.' : 'Urutan soal akan sama persis seperti yang Anda buat.'}
                                    </p>
                                </div>
                                
                                <div className="grid gap-2">
                                    <Label htmlFor="timeLimit">Batas Waktu (Menit)</Label>
                                    <Input 
                                        id="timeLimit" 
                                        type="number" 
                                        min="1" 
                                        placeholder="Kosongkan jika tidak ada batas waktu" 
                                        value={timeLimit}
                                        onChange={e => setTimeLimit(e.target.value === '' ? '' : parseInt(e.target.value))}
                                    />
                                    <p className="text-xs text-muted-foreground">Durasi maksimal pengerjaan kuis.</p>
                                </div>
                            </div>
                        )}

                        {/* Course picker was moved to the top */}

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

                                {!cloLoading && availableClos.length === 0 && (
                                    <div className="text-xs text-muted-foreground bg-orange-50 p-2 rounded border border-orange-200">
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
                        <div className="grid gap-2">
                            <Label htmlFor="description">Deskripsi</Label>
                            <Textarea id="description" name="description" placeholder="Instruksi pengerjaan tugas..." className="min-h-20" required />
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
                        <Button type="submit" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan Tugas'}</Button>
                    </DialogFooter>
                </form>
            </TabsContent>

            <TabsContent value="duplicate">
                <form onSubmit={handleDuplicate}>
                    <div className="grid gap-4 py-4">
                        {duplicationAssessments.length === 0 ? (
                            <div className="text-center p-8 border border-dashed rounded-lg text-muted-foreground">
                                Tidak ada tugas/kuis lain yang tersedia untuk diduplikat dari mata kuliah ini.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <Label>Pilih Tugas/Kuis yang akan diduplikat:</Label>
                                <div className="space-y-2 max-h-75 overflow-y-auto pr-2">
                                    {duplicationAssessments.map(ass => (
                                        <div 
                                            key={ass.id} 
                                            className={`border rounded-lg p-3 cursor-pointer transition-colors ${selectedDuplicateId === ass.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:border-primary/50'}`}
                                            onClick={() => setSelectedDuplicateId(ass.id)}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-semibold">{ass.title}</h4>
                                                    <p className="text-xs text-muted-foreground mt-1">Kelas Asal: {ass.course?.classCode || 'Unknown Class'}</p>
                                                    <p className="text-xs text-muted-foreground">Tipe: {ass.type} • Format: {ass.format === 'quiz' ? 'CBT / Kuis Interaktif' : 'Unggah File'}</p>
                                                </div>
                                                <Badge variant="secondary">{ass.questions?.length || 0} Soal</Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-muted-foreground bg-blue-50 p-2 rounded">
                                    Info: Menduplikat tugas ini akan menyalin seluruh pengaturan, pemetaan CLO, bobot, beserta semua butir soal dan kunci jawabannya ke kelas ini.
                                </p>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
                        <Button type="submit" disabled={dupLoading || duplicationAssessments.length === 0}>
                            {dupLoading ? 'Menyalin...' : 'Duplikat Tugas'}
                        </Button>
                    </DialogFooter>
                </form>
            </TabsContent>
            
            </Tabs>
        </DialogContent>
        </Dialog>
    )
}
