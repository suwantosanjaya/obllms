'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { submitQuizAnswers } from '@/app/actions/assessmentActions'
import { RichTextEditor } from '@/app/components/ui/RichTextEditor'
import { ArrowLeft, CheckCircle2, Timer } from 'lucide-react'
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

export function QuizTakerClient({ assessment, courseId, studentId, existingSubmission }: { assessment: any, courseId: string, studentId: string, existingSubmission: any }) {
    const router = useRouter()
    
    const [answers, setAnswers] = useState<Record<string, { selectedOptionId?: string; textResponse?: string }>>({})
    const [loading, setLoading] = useState(false)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const [alertMessage, setAlertMessage] = useState<{ title: string, description: string, type: 'success' | 'error' } | null>(null)

    const [timeLeft, setTimeLeft] = useState<number | null>(null)
    const answersRef = useRef(answers)
    const isSubmittingRef = useRef(false)

    useEffect(() => {
        answersRef.current = answers
    }, [answers])

    useEffect(() => {
        if (!existingSubmission && assessment.timeLimit && timeLeft === null) {
            setTimeLeft(assessment.timeLimit * 60)
        }
    }, [assessment, existingSubmission, timeLeft])

    type DisplayQuestion = {
        id: string;
        text: string;
        type: string;
        points: number;
        options?: {
            id: string;
            text: string;
            isCorrect?: boolean;
        }[];
    };
    const [displayQuestions, setDisplayQuestions] = useState<DisplayQuestion[]>([])

    useEffect(() => {
        if (!assessment) return
        
        let questionsToDisplay = [...(assessment.questions || [])]
        
        if (assessment.shuffleQuestions && !existingSubmission) {
            // Shuffle questions
            for (let i = questionsToDisplay.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [questionsToDisplay[i], questionsToDisplay[j]] = [questionsToDisplay[j], questionsToDisplay[i]];
            }
            
            // Shuffle options
            questionsToDisplay = questionsToDisplay.map(q => {
                if (q.type === 'MULTIPLE_CHOICE' && q.options) {
                    const shuffledOptions = [...q.options]
                    for (let i = shuffledOptions.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
                    }
                    return { ...q, options: shuffledOptions }
                }
                return q
            })
        }
        
        setDisplayQuestions(questionsToDisplay)
    }, [assessment, existingSubmission])

    const autoSubmit = async () => {
        if (isSubmittingRef.current) return
        isSubmittingRef.current = true
        setLoading(true)
        
        const formattedAnswers = Object.entries(answersRef.current).map(([questionId, ans]) => ({
            questionId,
            selectedOptionId: ans.selectedOptionId,
            textResponse: ans.textResponse
        }))

        const res = await submitQuizAnswers({
            assessmentId: assessment.id,
            studentId,
            answers: formattedAnswers
        })

        if (res.success) {
            setAlertMessage({ title: 'Waktu Habis!', description: 'Waktu pengerjaan telah habis. Kuis Anda telah dikumpulkan secara otomatis.', type: 'success' })
        } else {
            setAlertMessage({ title: 'Gagal Mengumpulkan', description: res.error || 'Terjadi kesalahan saat mengumpulkan kuis', type: 'error' })
            setLoading(false)
            isSubmittingRef.current = false
        }
    }

    useEffect(() => {
        if (timeLeft === null || isConfirmOpen || isSubmittingRef.current || existingSubmission) return

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev === null) return null
                if (prev <= 1) {
                    clearInterval(timer)
                    autoSubmit()
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [timeLeft, isConfirmOpen, existingSubmission])

    if (existingSubmission) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => router.push(`/student/course/${courseId}?tab=tugas`)}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Hasil Kuis: {assessment.title}</h1>
                        <p className="text-muted-foreground">Anda sudah mengerjakan kuis ini.</p>
                    </div>
                </div>

                <Card className="border-green-500/30 bg-card text-card-foreground">
                    <CardHeader className="bg-transparent pb-0">
                        <CardTitle className="text-green-700 dark:text-green-400 text-center">Skor Anda</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 flex flex-col items-center">
                        {assessment.isScorePublished ? (
                            <>
                                <span className="text-5xl font-black text-green-600">{existingSubmission.score !== null ? existingSubmission.score.toFixed(1) : '?'}</span>
                                <span className="text-sm text-muted-foreground mt-2">dari 100</span>
                                {existingSubmission.score === null && (
                                    <Badge variant="outline" className="mt-4 bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30">Menunggu Penilaian Esai</Badge>
                                )}
                            </>
                        ) : (
                            <div className="flex flex-col items-center">
                                <span className="text-lg font-medium text-muted-foreground">Menunggu Publikasi</span>
                                <Badge variant="secondary" className="mt-2 bg-slate-100 text-slate-700 border-none">Nilai Belum Dipublikasi</Badge>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {assessment.allowReview && assessment.isScorePublished ? (
                    <div className="space-y-4">
                        <h3 className="font-bold text-lg border-b pb-2">Review Jawaban</h3>
                        {assessment.questions.map((q: any, index: number) => {
                            const ans = existingSubmission.answers?.find((a: any) => a.questionId === q.id)
                            return (
                                <Card key={q.id}>
                                    <div className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-bold text-sm text-primary">Soal {index + 1}</span>
                                            <Badge variant="outline">{ans?.points !== null ? `${ans?.points} Poin` : 'Belum Dinilai'}</Badge>
                                        </div>
                                        <p className="font-medium mb-4">{q.text}</p>
                                        
                                        {q.type === 'MULTIPLE_CHOICE' ? (
                                            <div className="space-y-2">
                                                {q.options.map((opt: any) => {
                                                    const isSelected = ans?.selectedOptionId === opt.id
                                                    const isCorrect = opt.isCorrect
                                                    let bgColor = 'bg-muted/20'
                                                    if (isSelected && isCorrect) bgColor = 'bg-green-100 border-green-300'
                                                    else if (isSelected && !isCorrect) bgColor = 'bg-red-100 border-red-300'
                                                    else if (!isSelected && isCorrect) bgColor = 'bg-green-50/50 border-green-200 border-dashed'

                                                    return (
                                                        <div key={opt.id} className={`p-2 rounded border flex items-center gap-2 ${bgColor}`}>
                                                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? (isCorrect ? 'bg-green-500 border-green-600' : 'bg-red-500 border-red-600') : 'border-muted-foreground'}`}>
                                                                {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                                            </div>
                                                            <span className={isSelected ? 'font-medium' : ''}>{opt.text}</span>
                                                            {isCorrect && <CheckCircle2 className="w-4 h-4 text-green-600 ml-auto" />}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        ) : (
                                            <div className="bg-muted/30 p-3 rounded-md border text-sm">
                                                <span className="text-muted-foreground block mb-1 text-xs font-semibold uppercase">Jawaban Anda:</span>
                                                {ans?.textResponse || <em className="text-muted-foreground">Tidak ada jawaban</em>}
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            )
                        })}
                    </div>
                ) : (
                    <div className="mt-8 text-center p-8 bg-muted/30 rounded-lg border border-dashed">
                        <p className="text-muted-foreground">
                            {!assessment.isScorePublished 
                                ? 'Review jawaban tidak tersedia karena nilai belum dipublikasikan.'
                                : 'Dosen menonaktifkan fitur review jawaban untuk kuis ini.'}
                        </p>
                    </div>
                )}
            </div>
        )
    }

    const handleOptionSelect = (questionId: string, optionId: string) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: { ...prev[questionId], selectedOptionId: optionId }
        }))
    }

    const handleTextChange = (questionId: string, text: string) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: { ...prev[questionId], textResponse: text }
        }))
    }

    const handleSubmit = async () => {
        setIsConfirmOpen(false)
        
        setLoading(true)
        
        // Convert answers map to array
        const formattedAnswers = Object.entries(answers).map(([questionId, ans]) => ({
            questionId,
            selectedOptionId: ans.selectedOptionId,
            textResponse: ans.textResponse
        }))

        const payloadSize = new Blob([JSON.stringify(formattedAnswers)]).size / (1024 * 1024)
        if (payloadSize > 0.9) {
            setAlertMessage({ title: 'Gagal Mengumpulkan', description: `Ukuran jawaban terlalu besar (${payloadSize.toFixed(2)} MB). Maksimal 0.9 MB. Silakan kurangi ukuran gambar (compress) pada jawaban Esai Anda.`, type: 'error' })
            setLoading(false)
            return
        }

        const res = await submitQuizAnswers({
            assessmentId: assessment.id,
            studentId,
            answers: formattedAnswers
        })

        if (res.success) {
            setAlertMessage({ title: 'Berhasil', description: 'Kuis berhasil dikumpulkan!', type: 'success' })
        } else {
            setAlertMessage({ title: 'Gagal', description: res.error || 'Terjadi kesalahan saat mengumpulkan kuis', type: 'error' })
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Sticky Timer Header */}
            {timeLeft !== null && (
                <div className={`sticky top-0 z-50 flex items-center justify-center p-3 mb-6 rounded-b-lg shadow-md border-b backdrop-blur-md ${timeLeft < 300 ? 'bg-red-500/90 text-white border-red-600' : 'bg-background/90 border-border'}`}>
                    <Timer className={`mr-2 h-5 w-5 ${timeLeft < 300 ? 'animate-pulse' : ''}`} />
                    <span className="font-mono font-bold text-lg tracking-wider">
                        {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </span>
                    {timeLeft < 300 && <span className="ml-3 font-semibold text-sm animate-pulse">Waktu hampir habis!</span>}
                </div>
            )}

            <div className="flex items-center gap-4 mt-2">
                <Button variant="outline" size="icon" onClick={() => router.push(`/student/course/${courseId}?tab=tugas`)}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{assessment.title}</h1>
                    <p className="text-muted-foreground">{assessment.description || 'Kerjakan soal-soal berikut dengan teliti.'}</p>
                </div>
            </div>

            <div className="space-y-6">
                {displayQuestions.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg bg-muted/10">
                        Kuis ini belum memiliki soal.
                    </div>
                ) : (
                    displayQuestions.map((q: any, index: number) => (
                        <Card key={q.id} className="border-primary/20 shadow-sm bg-card text-card-foreground">
                            <div className="p-5">
                                <div className="flex gap-3 mb-4">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                                        {index + 1}
                                    </div>
                                    <div className="w-full">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="font-semibold text-lg text-foreground prose max-w-none prose-sm" dangerouslySetInnerHTML={{ __html: q.text }} />
                                            <Badge variant="outline">{q.points} Poin</Badge>
                                        </div>

                                        {q.type === 'MULTIPLE_CHOICE' ? (
                                            <RadioGroup 
                                                value={answers[q.id]?.selectedOptionId} 
                                                onValueChange={(val) => handleOptionSelect(q.id, val)}
                                                className="space-y-2 mt-4"
                                            >
                                                {q.options.map((opt: any) => (
                                                    <div key={opt.id} className={`flex items-center space-x-2 border p-3 rounded-lg cursor-pointer transition-colors ${answers[q.id]?.selectedOptionId === opt.id ? 'bg-primary/10 border-primary/50 text-primary' : 'bg-background hover:bg-muted/50'}`}>
                                                        <RadioGroupItem value={opt.id} id={opt.id} />
                                                        <Label htmlFor={opt.id} className="flex-1 cursor-pointer font-medium text-foreground">
                                                            <div dangerouslySetInnerHTML={{ __html: opt.text }} className="prose max-w-none prose-sm" />
                                                        </Label>
                                                    </div>
                                                ))}
                                            </RadioGroup>
                                        ) : (
                                            <div className="mt-4">
                                                <RichTextEditor 
                                                    placeholder="Ketik jawaban uraian Anda di sini..."
                                                    className="min-h-[150px] mt-2"
                                                    value={answers[q.id]?.textResponse || ''}
                                                    onChange={(val) => handleTextChange(q.id, val)}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            {displayQuestions.length > 0 && (
                <div className="flex justify-end pt-4 border-t">
                    <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                        <AlertDialogTrigger asChild>
                            <Button size="lg" disabled={loading}>
                                {loading ? 'Mengirim...' : 'Kumpulkan Jawaban'}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Konfirmasi Pengumpulan</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Apakah Anda yakin ingin mengumpulkan kuis ini? Jawaban yang sudah dikirim tidak dapat diubah lagi.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction onClick={handleSubmit}>Kumpulkan</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            )}

            <AlertDialog open={!!alertMessage} onOpenChange={(open) => {
                if (!open) {
                    const wasSuccess = alertMessage?.type === 'success'
                    setAlertMessage(null)
                    if (wasSuccess) {
                        router.refresh()
                    }
                }
            }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{alertMessage?.title}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {alertMessage?.description}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={() => {
                            const wasSuccess = alertMessage?.type === 'success'
                            setAlertMessage(null)
                            if (wasSuccess) {
                                router.refresh()
                            }
                        }}>
                            Tutup
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
