'use client'

import { useState } from 'react'
import { MessageSquareText, Star } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import { submitStudentEvaluation } from '@/app/actions/sclActions'
import { cn } from '@/lib/utils'

export function CourseEvaluationDialog({
    enrollmentId,
    courseName,
    type,
    isCompleted = false,
    triggerButton,
}: {
    enrollmentId: string
    courseName: string
    type: 'EXPECTATION' | 'PERCEPTION'
    isCompleted?: boolean
    triggerButton?: React.ReactNode
}) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const [rating, setRating] = useState(0)
    const [content, setContent] = useState('')

    const title = type === 'EXPECTATION' ? 'Ekspektasi Pembelajaran' : 'Persepsi Pembelajaran'
    const description = type === 'EXPECTATION' 
        ? 'Apa harapan dan target Anda setelah menyelesaikan mata kuliah ini?'
        : 'Bagaimana persepsi Anda tentang efektivitas metode pembelajaran di mata kuliah ini?'

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (rating === 0) {
            setError('Harap berikan penilaian bintang terlebih dahulu.')
            return
        }
        setLoading(true)
        setError(null)

        const res = await submitStudentEvaluation({
            enrollmentId,
            type,
            content,
            rating,
        })

        if (res.success) {
            setSuccess(true)
            setTimeout(() => setOpen(false), 2000)
        } else {
            setError(res.error || 'Gagal mengirim evaluasi')
        }
        setLoading(false)
    }

    if (isCompleted && !open) {
        return (
            <Button variant="outline" size="sm" disabled className="text-green-600 border-green-600 bg-green-50">
                <MessageSquareText className="mr-2 h-4 w-4" />
                Evaluasi Selesai
            </Button>
        )
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {triggerButton ? triggerButton : (
                    <Button variant={type === 'EXPECTATION' ? 'default' : 'secondary'} size="sm">
                        <MessageSquareText className="mr-2 h-4 w-4" />
                        Isi {title}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px]">
                {success ? (
                    <div className="py-12 text-center flex flex-col items-center justify-center space-y-3">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                            <MessageSquareText className="h-6 w-6 text-green-600" />
                        </div>
                        <h3 className="font-semibold text-lg">Terima Kasih!</h3>
                        <p className="text-muted-foreground text-sm">Evaluasi Anda berhasil dikirim dan akan membantu peningkatan kualitas pembelajaran.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>{title}</DialogTitle>
                            <DialogDescription>
                                {courseName}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Beri Penilaian Umum</label>
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className="focus:outline-none transition-transform hover:scale-110"
                                        >
                                            {rating >= star ? (
                                                <Star className="h-8 w-8 text-yellow-400 fill-yellow-400" />
                                            ) : (
                                                <Star className="h-8 w-8 text-gray-300" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Ceritakan secara singkat</label>
                                <Textarea
                                    placeholder={description}
                                    value={content}
                                    onChange={e => setContent(e.target.value)}
                                    className="min-h-[120px]"
                                    required
                                />
                            </div>

                            {error && <p className="text-red-500 text-sm">{error}</p>}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={loading || !content.trim()}>
                                {loading ? 'Mengirim...' : 'Kirim Evaluasi'}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    )
}
