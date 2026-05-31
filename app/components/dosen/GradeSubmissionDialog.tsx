'use client'

import { useState } from 'react'
import { CheckCircle } from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'
import { gradeSubmission, resetSubmissionGrade } from '@/app/actions/assessmentActions'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'

type AssessmentCLO = {
    cloId: string
    weight: number
    clo: { code: string; description: string }
}

type ExistingScore = {
    cloId: string
    score: number
}

export function GradeSubmissionDialog({
    submissionId,
    studentName,
    currentScore,
    currentFeedback,
    assessmentClos,
    existingCloScores,
    format,
    answers,
    questions,
    triggerButton,
}: {
    submissionId: string
    studentName: string
    currentScore?: number | null
    currentFeedback?: string | null
    assessmentClos: AssessmentCLO[]
    existingCloScores?: ExistingScore[]
    format?: string
    answers?: any[]
    questions?: any[]
    triggerButton?: React.ReactNode
}) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [resetDialogOpen, setResetDialogOpen] = useState(false)
    const [resetting, setResetting] = useState(false)

    // Initialize per-CLO score state
    const [scores, setScores] = useState<Record<string, string>>(() => {
        const init: Record<string, string> = {}
        for (const ac of assessmentClos) {
            const existing = existingCloScores?.find(s => s.cloId === ac.cloId)
            init[ac.cloId] = existing ? String(existing.score) : ''
        }
        return init
    })
    
    // Initialize essay scores state for CBT
    const [essayScores, setEssayScores] = useState<Record<string, string>>(() => {
        const init: Record<string, string> = {}
        if (format === 'quiz' && answers) {
            answers.forEach(ans => {
                if (ans.question?.type === 'ESSAY') {
                    init[ans.id] = ans.points !== null ? String(ans.points) : ''
                }
            })
        }
        return init
    })
    
    const [feedback, setFeedback] = useState(currentFeedback ?? '')
    
    const hasEssay = questions?.some((q: any) => q.type === 'ESSAY') ?? false;

    // Compute weighted average preview
    const weightedAvg = assessmentClos.reduce((sum, ac) => {
        const s = parseFloat(scores[ac.cloId] ?? '')
        if (!isNaN(s)) {
            return sum + (s * ac.weight) / 100
        }
        return sum
    }, 0)

    const allFilled = assessmentClos.every(ac => scores[ac.cloId] !== '')

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError('')

        const cloScores = format === 'quiz' ? [] : assessmentClos.map(ac => ({
            cloId: ac.cloId,
            score: parseFloat(scores[ac.cloId]),
        }))

        const finalEssayScores = format === 'quiz' ? Object.entries(essayScores).map(([answerId, pointsStr]) => ({
            answerId,
            points: parseFloat(pointsStr || '0')
        })) : undefined

        const res = await gradeSubmission(submissionId, cloScores, feedback, finalEssayScores)

        if (res.success) {
            setOpen(false)
        } else {
            setError(res.error || 'Gagal menyimpan nilai')
        }
        setLoading(false)
    }

    const handleReset = async () => {
        setResetting(true)
        const res = await resetSubmissionGrade(submissionId, feedback.trim() !== '' ? feedback : undefined)
        if (res.success) {
            // Clear local state
            const emptyScores = {} as Record<string, string>
            assessmentClos.forEach(ac => {
                emptyScores[ac.cloId] = ''
            })
            setScores(emptyScores)
            setFeedback('')
            setOpen(false)
            setResetDialogOpen(false)
        } else {
            setError(res.error || 'Terjadi kesalahan')
        }
        setResetting(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {triggerButton ? triggerButton : (
                    <Button variant={currentScore !== null && currentScore !== undefined ? 'outline' : 'default'} size="sm">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        {currentScore !== null && currentScore !== undefined ? 'Edit Nilai' : 'Beri Nilai'}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[520px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Penilaian: {studentName}</DialogTitle>
                        <DialogDescription>
                            Berikan nilai {format === 'quiz' ? 'untuk setiap soal Esai' : '(0–100) untuk setiap CLO'}, atau cukup berikan Umpan Balik (Feedback).
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto px-1">
                        {/* Student Answers for Quiz */}
                        {format === 'quiz' && questions && questions.length > 0 && (
                            <div className="mb-4 space-y-3">
                                <h4 className="font-semibold text-sm">Jawaban Mahasiswa:</h4>
                                {questions.map((q: any, idx: number) => {
                                    const ans = answers?.find((a: any) => a.questionId === q.id)
                                    const isAnswered = !!ans
                                    return (
                                        <div key={q.id} className="bg-muted/30 p-3 rounded-lg border text-sm">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-medium text-primary">Soal {idx + 1}</span>
                                                {q.type === 'MULTIPLE_CHOICE' ? (
                                                    <Badge variant="outline" className={!isAnswered ? "bg-gray-50 text-gray-700" : (ans.points > 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700")}>
                                                        {!isAnswered ? 'Tidak Dijawab' : (ans.points > 0 ? 'Benar' : 'Salah')} {isAnswered ? `(${ans.points} Poin)` : '(0 Poin)'}
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="bg-purple-50 text-purple-700">Esai</Badge>
                                                )}
                                            </div>
                                            <div className="mb-2 text-muted-foreground prose max-w-none prose-sm" dangerouslySetInnerHTML={{ __html: q.text }} />
                                            <div className="bg-background p-2 rounded border">
                                                {q.type === 'MULTIPLE_CHOICE' ? (
                                                    <div className={`flex items-start gap-1 ${!isAnswered ? "text-gray-500 italic" : (ans.points > 0 ? "text-green-600 font-medium" : "text-red-600 font-medium")}`}>
                                                        <span>Opsi terpilih: </span>
                                                        {isAnswered ? (
                                                            <span dangerouslySetInnerHTML={{ __html: q.options?.find((o: any) => o.id === ans.selectedOptionId)?.text || ans.selectedOptionId }} className="prose max-w-none prose-sm inline-block" />
                                                        ) : (
                                                            <span>-</span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="space-y-3">
                                                        {isAnswered && ans.textResponse ? (
                                                            <div className="prose max-w-none prose-sm" dangerouslySetInnerHTML={{ __html: ans.textResponse }} />
                                                        ) : (
                                                            <em className="text-muted-foreground">Tidak dijawab</em>
                                                        )}
                                                        {format === 'quiz' && isAnswered && (
                                                            <div className="flex items-center gap-2 border-t pt-2 mt-2">
                                                                <Label className="text-xs">Nilai Esai (Max {q.points}):</Label>
                                                                <Input 
                                                                    type="number"
                                                                    min="0"
                                                                    max={q.points}
                                                                    step="0.1"
                                                                    value={essayScores[ans.id] || ''}
                                                                    onChange={e => setEssayScores(prev => ({ ...prev, [ans.id]: e.target.value }))}
                                                                    className="h-7 w-20 text-xs"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        {/* Per-CLO score inputs */}
                        {format !== 'quiz' && assessmentClos.map((ac) => (
                            <div key={ac.cloId} className="rounded-lg border border-border bg-muted/20 p-3 flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="shrink-0 font-mono">{ac.clo.code}</Badge>
                                        <span className="text-sm text-muted-foreground line-clamp-1">{ac.clo.description}</span>
                                    </div>
                                    <Badge className="shrink-0 bg-blue-500/20 text-blue-400 border-blue-500/30 border">
                                        Bobot {ac.weight}%
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Label className="w-16 text-sm shrink-0">Nilai</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.1"
                                        placeholder="0–100"
                                        value={scores[ac.cloId]}
                                        onChange={e => setScores(prev => ({ ...prev, [ac.cloId]: e.target.value }))}
                                        className="max-w-[100px]"
                                    />
                                </div>
                            </div>
                        ))}

                        {/* Weighted average preview */}
                        {format !== 'quiz' && allFilled && (
                            <div className="flex items-center justify-between rounded-lg bg-primary/10 border border-primary/30 px-4 py-2">
                                <span className="text-sm font-medium">Nilai Akhir (Weighted Average)</span>
                                <span className="text-lg font-bold text-primary">
                                    {Math.round(weightedAvg * 10) / 10}
                                </span>
                            </div>
                        )}

                        {/* General feedback */}
                        {!(format === 'quiz' && !hasEssay) && (
                            <div className="grid gap-2">
                                <Label htmlFor="feedback">Umpan Balik Umum</Label>
                                <Textarea
                                    id="feedback"
                                    placeholder="Kerja bagus, namun perhatikan..."
                                    value={feedback}
                                    onChange={e => setFeedback(e.target.value)}
                                    className="min-h-[80px]"
                                />
                            </div>
                        )}

                        {error && <p className="text-red-500 text-sm">{error}</p>}
                    </div>

                    <DialogFooter className="flex items-center justify-between sm:justify-between w-full">
                        <div className="flex justify-start">
                            <Button 
                                type="button" 
                                variant="destructive" 
                                onClick={() => setResetDialogOpen(true)}
                            >
                                Tolak & Kembalikan Jawaban
                            </Button>
                        </div>
                        <div className="flex gap-2">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                {format === 'quiz' && !hasEssay ? 'Tutup' : 'Batal'}
                            </Button>
                            {!(format === 'quiz' && !hasEssay) && (
                                <Button type="submit" disabled={loading}>
                                    {loading ? 'Menyimpan...' : 'Simpan Nilai'}
                                </Button>
                            )}
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
            
            <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Tolak & Kembalikan Jawaban?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini akan mengembalikan status tugas mahasiswa menjadi DITOLAK. Mahasiswa harus mengirimkan ulang jawaban/file dari awal. <br/><br/>
                            <span className="font-semibold text-orange-600 dark:text-orange-400">Penting:</span> Tulisan yang ada di kolom "Umpan Balik Umum" akan dikirimkan sebagai alasan penolakan. Lanjutkan?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={resetting}>Batal</AlertDialogCancel>
                        <AlertDialogAction 
                            disabled={resetting} 
                            onClick={(e) => {
                                e.preventDefault()
                                handleReset()
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {resetting ? 'Memproses...' : 'Ya, Hapus & Kembalikan'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Dialog>
    )
}
