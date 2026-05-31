'use client'

import { useState } from 'react'
import { Star, CheckCircle, MessageSquare, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { submitCourseFeedback } from '@/app/actions/qaFeedbackActions'

interface CourseFeedbackTabProps {
    courseId: string
    userId: string
    subjectTitle: string
    existingFeedback: { rating: number | null; content: string; createdAt: Date } | null
}

export function CourseFeedbackTab({ courseId, userId, subjectTitle, existingFeedback }: CourseFeedbackTabProps) {
    const [rating, setRating] = useState(0)
    const [hoveredRating, setHoveredRating] = useState(0)
    const [content, setContent] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [submitted, setSubmitted] = useState(!!existingFeedback)

    const ratingLabels: Record<number, string> = {
        1: 'Sangat Kurang',
        2: 'Kurang',
        3: 'Cukup',
        4: 'Baik',
        5: 'Sangat Baik',
    }

    const handleSubmit = async () => {
        if (rating === 0) {
            setError('Silakan pilih rating terlebih dahulu.')
            return
        }
        if (!content.trim()) {
            setError('Komentar tidak boleh kosong.')
            return
        }

        setError(null)
        setIsLoading(true)
        const res = await submitCourseFeedback(userId, courseId, rating, content)
        setIsLoading(false)

        if (res.success) {
            setSubmitted(true)
        } else {
            setError(res.error || 'Terjadi kesalahan.')
        }
    }

    // Already submitted view
    if (submitted || existingFeedback) {
        const displayRating = existingFeedback?.rating ?? rating
        const displayContent = existingFeedback?.content ?? content
        const displayDate = existingFeedback?.createdAt
            ? new Date(existingFeedback.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
            : new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })

        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5" />
                        Umpan Balik Kelas
                    </CardTitle>
                    <CardDescription>Sampaikan pengalaman belajar Anda di kelas ini kepada tim QA.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-8 text-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">Terima Kasih atas Umpan Balik Anda!</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Umpan balik Anda telah berhasil dikirimkan pada {displayDate}.
                            </p>
                        </div>
                        <div className="mt-2 p-4 rounded-xl border bg-muted/30 w-full max-w-md text-left space-y-3">
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map(s => (
                                    <Star key={s} className={`w-5 h-5 ${s <= (displayRating ?? 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                                ))}
                                <span className="ml-2 text-sm font-medium text-muted-foreground">{ratingLabels[displayRating ?? 0]}</span>
                            </div>
                            <p className="text-sm italic text-muted-foreground">"{displayContent}"</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Umpan balik hanya dapat dikirimkan satu kali per mata kuliah.</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Umpan Balik Kelas
                </CardTitle>
                <CardDescription>
                    Sampaikan pengalaman belajar Anda di kelas <strong>{subjectTitle}</strong> ini kepada tim QA.
                    Umpan balik bersifat anonim dan hanya dapat dikirimkan satu kali.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Star Rating */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Rating Kepuasan</label>
                    <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map(star => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoveredRating(star)}
                                onMouseLeave={() => setHoveredRating(0)}
                                className="focus:outline-none transition-transform hover:scale-110"
                                aria-label={`Rating ${star}`}
                            >
                                <Star
                                    className={`w-9 h-9 transition-colors ${
                                        star <= (hoveredRating || rating)
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-gray-300'
                                    }`}
                                />
                            </button>
                        ))}
                        {(hoveredRating || rating) > 0 && (
                            <span className="ml-2 text-sm font-medium text-muted-foreground">
                                {ratingLabels[hoveredRating || rating]}
                            </span>
                        )}
                    </div>
                </div>

                {/* Comment Textarea */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Komentar & Saran</label>
                    <Textarea
                        placeholder="Tuliskan pengalaman belajar Anda — apa yang sudah baik, apa yang perlu ditingkatkan dari materi, metode pengajaran, atau penilaian..."
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        rows={5}
                        className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground">{content.length} karakter</p>
                </div>

                {error && (
                    <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-md">{error}</p>
                )}

                <Button onClick={handleSubmit} disabled={isLoading} className="w-full sm:w-auto">
                    {isLoading ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Mengirim...</>
                    ) : (
                        'Kirim Umpan Balik'
                    )}
                </Button>
            </CardContent>
        </Card>
    )
}
