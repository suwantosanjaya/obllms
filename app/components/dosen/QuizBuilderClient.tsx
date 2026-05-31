'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Save, ArrowLeft, GripVertical, CheckCircle2, Download } from 'lucide-react'
import { addQuizQuestion, deleteQuizQuestion, updateQuizQuestion, getQuestionBankBySubject, copyQuestionsToAssessment } from '@/app/actions/assessmentActions'
import { RichTextEditor } from '@/app/components/ui/RichTextEditor'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function QuizBuilderClient({ assessment, courseId }: { assessment: any, courseId: string }) {
    const router = useRouter()
    const { toast } = useToast()
    const [questions, setQuestions] = useState<any[]>(assessment.questions || [])
    const [loading, setLoading] = useState(false)
    
    // Bank Soal State
    const [isBankOpen, setIsBankOpen] = useState(false)
    const [bankQuestions, setBankQuestions] = useState<any[]>([])
    const [selectedBankQuestionIds, setSelectedBankQuestionIds] = useState<string[]>([])
    const [bankLoading, setBankLoading] = useState(false)
    const [bankCopying, setBankCopying] = useState(false)
    
    const availableClos = assessment.assessmentClos.map((ac: any) => ac.clo)

    // For adding/editing new question
    const [isAdding, setIsAdding] = useState(false)
    const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)
    const [newType, setNewType] = useState('MULTIPLE_CHOICE')
    const [newText, setNewText] = useState('')
    const [newPoints, setNewPoints] = useState(10)
    const [newCloId, setNewCloId] = useState(availableClos.length > 0 ? availableClos[0].id : '')
    const [newOptions, setNewOptions] = useState([{ text: '', isCorrect: true }, { text: '', isCorrect: false }])

    function handleEditClick(q: any) {
        setEditingQuestionId(q.id)
        setNewType(q.type)
        setNewText(q.text)
        setNewPoints(q.points)
        setNewCloId(q.cloId)
        if (q.type === 'MULTIPLE_CHOICE' && q.options && q.options.length > 0) {
            setNewOptions(q.options)
        } else {
            setNewOptions([{ text: '', isCorrect: true }, { text: '', isCorrect: false }])
        }
        setIsAdding(true)
        setTimeout(() => {
            document.getElementById('quiz-form-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 100)
    }

    async function handleSaveQuestion() {
        if (!newText.trim()) return
        if (!newCloId) {
            toast({
                title: "Gagal",
                description: "CLO wajib dipilih untuk soal ini.",
                variant: "destructive"
            })
            return
        }

        const payload = {
            assessmentId: assessment.id,
            text: newText,
            type: newType,
            points: newPoints,
            cloId: newCloId,
            options: newType === 'MULTIPLE_CHOICE' ? newOptions : []
        }

        const payloadSize = new Blob([JSON.stringify(payload)]).size / (1024 * 1024)
        if (payloadSize > 0.9) {
            toast({
                title: "Ukuran Terlalu Besar",
                description: `Ukuran soal (${payloadSize.toFixed(2)} MB) melebihi batas 0.9 MB. Silakan kurangi ukuran gambar (compress) sebelum menyimpan.`,
                variant: "destructive"
            })
            return
        }

        setLoading(true)
        
        if (editingQuestionId) {
            const res = await updateQuizQuestion({ id: editingQuestionId, ...payload })
            if (res.success) {
                setQuestions(questions.map(q => q.id === editingQuestionId ? res.question : q))
                setIsAdding(false)
                setEditingQuestionId(null)
                setNewText('')
                setNewOptions([{ text: '', isCorrect: true }, { text: '', isCorrect: false }])
            } else {
                toast({
                    title: "Error",
                    description: res.error,
                    variant: "destructive"
                })
            }
        } else {
            const res = await addQuizQuestion(payload)
            if (res.success) {
                setQuestions([...questions, res.question])
                setIsAdding(false)
                setNewText('')
                setNewOptions([{ text: '', isCorrect: true }, { text: '', isCorrect: false }])
            } else {
                toast({
                    title: "Error",
                    description: res.error,
                    variant: "destructive"
                })
            }
        }
        
        setLoading(false)
    }

    const [deleteId, setDeleteId] = useState<string | null>(null)

    async function handleDeleteQuestion(id: string) {
        setDeleteId(null)
        const res = await deleteQuizQuestion(id)
        if (res.success) {
            setQuestions(questions.filter(q => q.id !== id))
        }
    }

    async function openBankDialog() {
        setBankLoading(true)
        setIsBankOpen(true)
        // Subject ID is from assessment.course.subjectId
        const subjectId = assessment.course?.subjectId
        if (subjectId) {
            const res = await getQuestionBankBySubject(subjectId)
            if (res.success && res.questions) {
                // Filter out questions already in this assessment
                const existingTexts = questions.map(q => q.text)
                const availableBankQs = res.questions.filter((q: any) => !existingTexts.includes(q.text))
                setBankQuestions(availableBankQs)
            }
        }
        setBankLoading(false)
    }

    async function handleCopyFromBank() {
        if (selectedBankQuestionIds.length === 0) return
        
        setBankCopying(true)
        const res = await copyQuestionsToAssessment(selectedBankQuestionIds, assessment.id)
        if (res.success) {
            toast({ title: 'Berhasil', description: `${selectedBankQuestionIds.length} soal berhasil ditambahkan.` })
            setIsBankOpen(false)
            setSelectedBankQuestionIds([])
            // Reload page to get updated questions
            window.location.reload()
        } else {
            toast({ title: 'Error', description: res.error, variant: 'destructive' })
        }
        setBankCopying(false)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.push(`/teacher/course/${courseId}?tab=tugas`)}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Quiz Builder</h1>
                    <p className="text-muted-foreground">Merakit soal Pilihan Ganda & Esai untuk: <span className="font-semibold">{assessment.title}</span></p>
                </div>
            </div>

            <div className="flex justify-between items-end">
                <div className="bg-primary/5 p-4 rounded-lg border">
                    <h3 className="font-semibold text-primary">Info Kuis</h3>
                    <div className="text-sm mt-1 grid grid-cols-2 gap-x-8 gap-y-1">
                        <span className="text-muted-foreground">Teknik:</span> <span className="font-medium">{assessment.type}</span>
                        <span className="text-muted-foreground">Total Soal:</span> <span className="font-medium">{questions.length} Butir</span>
                        <span className="text-muted-foreground">Total Poin:</span> <span className="font-medium">{questions.reduce((sum, q) => sum + q.points, 0)} Poin</span>
                    </div>
                </div>
                {!isAdding && (
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={openBankDialog}>
                            <Download className="mr-2 h-4 w-4" /> Ambil dari Bank Soal
                        </Button>
                        <Button onClick={() => setIsAdding(true)}>
                            <Plus className="mr-2 h-4 w-4" /> Tambah Soal Baru
                        </Button>
                    </div>
                )}
            </div>

            {isAdding && (
                <Card id="quiz-form-card" className="border-primary shadow-sm bg-primary/5 scroll-mt-6">
                    <CardHeader>
                        <CardTitle className="text-primary text-lg">Soal Baru</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Tipe Soal</Label>
                                <Select value={newType} onValueChange={setNewType}>
                                    <SelectTrigger className="bg-background">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MULTIPLE_CHOICE">Pilihan Ganda</SelectItem>
                                        <SelectItem value="ESSAY">Esai / Uraian</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Poin / Bobot Soal</Label>
                                <Input type="number" min="1" value={newPoints} onChange={e => setNewPoints(Number(e.target.value))} className="bg-background" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Pemetaan ke CLO <span className="text-destructive">*</span></Label>
                            <Select value={newCloId} onValueChange={setNewCloId}>
                                <SelectTrigger className="bg-background">
                                    <SelectValue placeholder="Pilih CLO untuk soal ini" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableClos.map((clo: any) => (
                                        <SelectItem key={clo.id} value={clo.id}>{clo.code} - {clo.description.substring(0, 30)}...</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">Wajib memilih satu CLO. Nilai soal ini akan dihitung ke skor CLO tersebut.</p>
                        </div>

                        <div className="space-y-2">
                            <Label>Pertanyaan</Label>
                            <RichTextEditor 
                                value={newText}
                                onChange={setNewText}
                                placeholder="Ketik soal atau paste gambar di sini..." 
                            />
                        </div>

                        {newType === 'MULTIPLE_CHOICE' && (
                            <div className="space-y-3 pt-4 border-t border-primary/20">
                                <Label>Opsi Jawaban</Label>
                                {newOptions.map((opt, idx) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                const opts = newOptions.map((o, i) => ({...o, isCorrect: i === idx}))
                                                setNewOptions(opts)
                                            }}
                                            className={`p-1.5 rounded-full border flex-shrink-0 ${opt.isCorrect ? 'bg-green-500 border-green-600 text-white' : 'bg-background hover:bg-muted'}`}
                                            title="Tandai sebagai jawaban benar"
                                        >
                                            <CheckCircle2 className="h-5 w-5" />
                                        </button>
                                        <div className={`flex-1 ${opt.isCorrect ? 'ring-2 ring-green-400 rounded-md' : ''}`}>
                                            <RichTextEditor 
                                                value={opt.text}
                                                onChange={val => {
                                                    const opts = [...newOptions]
                                                    opts[idx].text = val
                                                    setNewOptions(opts)
                                                }}
                                                placeholder={`Opsi ${idx + 1}...`}
                                            />
                                        </div>
                                        {newOptions.length > 2 && (
                                            <Button variant="ghost" size="icon" onClick={() => setNewOptions(newOptions.filter((_, i) => i !== idx))} className="text-destructive">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm" 
                                    className="mt-2"
                                    onClick={() => setNewOptions([...newOptions, { text: '', isCorrect: false }])}
                                >
                                    <Plus className="h-3 w-3 mr-1" /> Tambah Opsi
                                </Button>
                            </div>
                        )}

                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" onClick={() => {
                                setIsAdding(false)
                                setEditingQuestionId(null)
                                setNewText('')
                            }}>Batal</Button>
                            <Button onClick={handleSaveQuestion} disabled={loading}>{loading ? 'Menyimpan...' : (editingQuestionId ? 'Simpan Perubahan' : 'Simpan Soal')}</Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="space-y-4">
                {questions.length === 0 && !isAdding ? (
                    <div className="text-center p-12 border-2 border-dashed rounded-xl bg-muted/10 text-muted-foreground">
                        Belum ada soal. Klik <b>Tambah Soal Baru</b> untuk mulai membuat kuis.
                    </div>
                ) : (
                    questions.map((q, index) => (
                        <Card key={q.id} className="relative group hover:border-primary/50 transition-colors">
                            <div className="absolute left-0 top-0 bottom-0 w-8 bg-muted flex items-center justify-center rounded-l-lg border-r cursor-grab text-muted-foreground">
                                <GripVertical className="h-4 w-4 opacity-50" />
                            </div>
                            <div className="pl-12 pr-4 py-4">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="font-bold text-sm bg-primary/10 text-primary px-2 py-0.5 rounded">Soal {index + 1}</span>
                                            <Badge variant="outline" className={q.type === 'MULTIPLE_CHOICE' ? 'text-blue-600 bg-blue-50' : 'text-purple-600 bg-purple-50'}>
                                                {q.type === 'MULTIPLE_CHOICE' ? 'Pilihan Ganda' : 'Esai'}
                                            </Badge>
                                            <span className="text-xs font-semibold text-muted-foreground ml-2">{q.points} Poin</span>
                                            {q.clo && (
                                                <Badge variant="outline" className="ml-2 bg-orange-50 text-orange-700 border-orange-200">
                                                    {q.clo.code}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="text-sm font-medium prose max-w-none prose-sm" dangerouslySetInnerHTML={{ __html: q.text }} />
                                        
                                        {q.type === 'MULTIPLE_CHOICE' && q.options && (
                                            <div className="mt-3 space-y-2">
                                                {q.options.map((opt: any) => (
                                                    <div key={opt.id} className={`flex items-center gap-2 p-2 rounded text-sm ${opt.isCorrect ? 'bg-green-50 border border-green-200 text-green-900 font-medium' : 'bg-muted/30 border border-transparent'}`}>
                                                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${opt.isCorrect ? 'bg-green-500 text-white' : 'bg-muted-foreground/30'}`}>
                                                            {opt.isCorrect && <CheckCircle2 className="h-3 w-3" />}
                                                        </div>
                                                        <div className="flex-1" dangerouslySetInnerHTML={{ __html: opt.text }} />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(q)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50" title="Edit Soal">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(q.id)} className="text-destructive hover:bg-destructive/10" title="Hapus Soal">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Soal</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus soal ini? Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteId && handleDeleteQuestion(deleteId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Hapus</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Dialog open={isBankOpen} onOpenChange={setIsBankOpen}>
                <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Bank Soal Mata Kuliah</DialogTitle>
                        <DialogDescription>
                            Pilih soal dari tugas/kuis lain di mata kuliah ini untuk diduplikat ke kuis Anda saat ini.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-2">
                        {bankLoading ? (
                            <div className="text-center p-8 text-muted-foreground">Memuat Bank Soal...</div>
                        ) : bankQuestions.length === 0 ? (
                            <div className="text-center p-8 border border-dashed rounded-lg text-muted-foreground">
                                Tidak ada soal yang tersedia di Bank Soal untuk mata kuliah ini, atau semua soal sudah ada di kuis ini.
                            </div>
                        ) : (
                            bankQuestions.map((q) => (
                                <div key={q.id} className="border rounded-lg p-4 flex gap-4 hover:border-primary/50 transition-colors">
                                    <div className="pt-1">
                                        <Checkbox 
                                            checked={selectedBankQuestionIds.includes(q.id)}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    setSelectedBankQuestionIds([...selectedBankQuestionIds, q.id])
                                                } else {
                                                    setSelectedBankQuestionIds(selectedBankQuestionIds.filter(id => id !== q.id))
                                                }
                                            }}
                                        />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className={q.type === 'MULTIPLE_CHOICE' ? 'text-blue-600 bg-blue-50' : 'text-purple-600 bg-purple-50'}>
                                                {q.type === 'MULTIPLE_CHOICE' ? 'Pilihan Ganda' : 'Esai'}
                                            </Badge>
                                            <span className="text-xs font-semibold text-muted-foreground">{q.points} Poin</span>
                                            {q.clo && (
                                                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                                    {q.clo.code}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="text-sm prose max-w-none prose-sm line-clamp-3" dangerouslySetInnerHTML={{ __html: q.text }} />
                                        <div className="text-xs text-muted-foreground mt-2 bg-muted p-2 rounded">
                                            Asal: {q.assessment?.title} (Kelas: {q.assessment?.course?.classCode || 'Unknown'}) - {q.assessment?.course?.instructor?.name || 'Unknown Dosen'}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <DialogFooter className="mt-4 pt-4 border-t">
                        <div className="flex items-center justify-between w-full">
                            <span className="text-sm text-muted-foreground">
                                {selectedBankQuestionIds.length} soal dipilih
                            </span>
                            <div className="flex gap-2">
                                <Button type="button" variant="outline" onClick={() => setIsBankOpen(false)}>Batal</Button>
                                <Button 
                                    onClick={handleCopyFromBank} 
                                    disabled={selectedBankQuestionIds.length === 0 || bankCopying}
                                >
                                    {bankCopying ? 'Menambahkan...' : 'Tambahkan ke Kuis Ini'}
                                </Button>
                            </div>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
