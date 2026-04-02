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
import { gradeSubmission } from '@/app/actions/assessmentActions'

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
}: {
    submissionId: string
    studentName: string
    currentScore?: number | null
    currentFeedback?: string | null
    assessmentClos: AssessmentCLO[]
    existingCloScores?: ExistingScore[]
}) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Initialize per-CLO score state
    const [scores, setScores] = useState<Record<string, string>>(() => {
        const init: Record<string, string> = {}
        for (const ac of assessmentClos) {
            const existing = existingCloScores?.find(s => s.cloId === ac.cloId)
            init[ac.cloId] = existing ? String(existing.score) : ''
        }
        return init
    })
    const [feedback, setFeedback] = useState(currentFeedback ?? '')

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

        const cloScores = assessmentClos.map(ac => ({
            cloId: ac.cloId,
            score: parseFloat(scores[ac.cloId]),
        }))

        const res = await gradeSubmission(submissionId, cloScores, feedback)

        if (res.success) {
            setOpen(false)
        } else {
            setError(res.error || 'Gagal menyimpan nilai')
        }
        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant={currentScore !== null && currentScore !== undefined ? 'outline' : 'default'} size="sm">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    {currentScore !== null && currentScore !== undefined ? 'Edit Nilai' : 'Beri Nilai'}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[520px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Penilaian: {studentName}</DialogTitle>
                        <DialogDescription>
                            Berikan nilai (0–100) untuk setiap CPMK yang diukur dalam tugas ini.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {/* Per-CLO score inputs */}
                        {assessmentClos.map((ac) => (
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
                                        required
                                        className="max-w-[100px]"
                                    />
                                </div>
                            </div>
                        ))}

                        {/* Weighted average preview */}
                        {allFilled && (
                            <div className="flex items-center justify-between rounded-lg bg-primary/10 border border-primary/30 px-4 py-2">
                                <span className="text-sm font-medium">Nilai Akhir (Weighted Average)</span>
                                <span className="text-lg font-bold text-primary">
                                    {Math.round(weightedAvg * 10) / 10}
                                </span>
                            </div>
                        )}

                        {/* General feedback */}
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

                        {error && <p className="text-red-500 text-sm">{error}</p>}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Menyimpan...' : 'Simpan Nilai'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
