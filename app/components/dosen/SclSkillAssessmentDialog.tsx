'use client'

import { useState } from 'react'
import { ClipboardCheck } from 'lucide-react'
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
import { upsertSclSkillAssessment } from '@/app/actions/sclActions'
import { Slider } from '@/components/ui/slider'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

export function SclSkillAssessmentDialog({
    enrollmentId,
    studentName,
    initialData,
    enabledSkills,
    triggerButton,
}: {
    enrollmentId: string
    studentName: string
    initialData?: {
        entrepreneurshipScore: number | null
        leadershipScore: number | null
        industryKnowledgeScore: number | null
        employabilitySkillScore: number | null
        notes: string | null
    }
    enabledSkills?: {
        entrepreneurship: boolean
        leadership: boolean
        industryKnowledge: boolean
        employabilitySkill: boolean
    }
    triggerButton?: React.ReactNode
}) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [scores, setScores] = useState({
        entrepreneurshipScore: initialData?.entrepreneurshipScore ?? 50,
        leadershipScore: initialData?.leadershipScore ?? 50,
        industryKnowledgeScore: initialData?.industryKnowledgeScore ?? 50,
        employabilitySkillScore: initialData?.employabilitySkillScore ?? 50,
    })
    const [notes, setNotes] = useState(initialData?.notes ?? '')

    const hasAnySkillEnabled = 
        enabledSkills?.entrepreneurship !== false || 
        enabledSkills?.leadership !== false || 
        enabledSkills?.industryKnowledge !== false || 
        enabledSkills?.employabilitySkill !== false;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const res = await upsertSclSkillAssessment({
            enrollmentId,
            entrepreneurshipScore: scores.entrepreneurshipScore,
            leadershipScore: scores.leadershipScore,
            industryKnowledgeScore: scores.industryKnowledgeScore,
            employabilitySkillScore: scores.employabilitySkillScore,
            notes,
        })

        if (res.success) {
            setOpen(false)
        } else {
            setError(res.error || 'Gagal menyimpan penilaian SCL')
        }
        setLoading(false)
    }

    const TriggerComponent = triggerButton ? triggerButton : (
        <Button variant={initialData ? 'outline' : 'default'} size="sm" disabled={!hasAnySkillEnabled}>
            <ClipboardCheck className="mr-2 h-4 w-4" />
            {initialData ? 'Edit Penilaian SCL' : 'Penilaian SCL'}
        </Button>
    )

    if (!hasAnySkillEnabled) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span tabIndex={0} className="inline-block cursor-not-allowed">
                            {TriggerComponent}
                        </span>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Aktifkan komponen SCL di pengaturan mata kuliah untuk memberikan penilaian.</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        )
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {TriggerComponent}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Penilaian SCL: {studentName}</DialogTitle>
                        <DialogDescription>
                            Evaluasi kompetensi non-teknis mahasiswa berdasarkan interaksi di kelas, diskusi, dan penugasan proyek.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                        {hasAnySkillEnabled ? (
                            <div className="space-y-4 rounded-lg border p-4 bg-muted/10">
                                {enabledSkills?.entrepreneurship !== false && (
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <Label>Kewirausahaan (Entrepreneurship)</Label>
                                        <span className="font-mono text-sm">{scores.entrepreneurshipScore}/100</span>
                                    </div>
                                    <Slider 
                                        min={0} max={100} step={1}
                                        value={[scores.entrepreneurshipScore]}
                                        onValueChange={val => setScores(s => ({ ...s, entrepreneurshipScore: val[0] }))}
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">Inisiatif, melihat peluang, inovasi solusi.</p>
                                </div>
                            )}

                            {enabledSkills?.leadership !== false && (
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <Label>Kepemimpinan (Leadership)</Label>
                                        <span className="font-mono text-sm">{scores.leadershipScore}/100</span>
                                    </div>
                                    <Slider 
                                        min={0} max={100} step={1}
                                        value={[scores.leadershipScore]}
                                        onValueChange={val => setScores(s => ({ ...s, leadershipScore: val[0] }))}
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">Manajemen kelompok, proaktif, dan komunikasi asertif.</p>
                                </div>
                            )}

                            {enabledSkills?.industryKnowledge !== false && (
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <Label>Wawasan Industri (Industry Knowledge)</Label>
                                        <span className="font-mono text-sm">{scores.industryKnowledgeScore}/100</span>
                                    </div>
                                    <Slider 
                                        min={0} max={100} step={1}
                                        value={[scores.industryKnowledgeScore]}
                                        onValueChange={val => setScores(s => ({ ...s, industryKnowledgeScore: val[0] }))}
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">Pemahaman praktik terbaik di industri dan kebutuhan pasar.</p>
                                </div>
                            )}

                            {enabledSkills?.employabilitySkill !== false && (
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <Label>Kesiapan Kerja (Employability)</Label>
                                        <span className="font-mono text-sm">{scores.employabilitySkillScore}/100</span>
                                    </div>
                                    <Slider 
                                        min={0} max={100} step={1}
                                        value={[scores.employabilitySkillScore]}
                                        onValueChange={val => setScores(s => ({ ...s, employabilitySkillScore: val[0] }))}
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">Kemampuan komunikasi, kerjasama tim, dan problem-solving di dunia kerja.</p>
                                </div>
                            )}
                            </div>
                        ) : (
                            <div className="text-sm text-muted-foreground text-center py-6 border rounded-lg bg-muted/10">
                                Tidak ada komponen SCL yang diaktifkan untuk mata kuliah ini.
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label htmlFor="notes">Catatan Tambahan (Opsional)</Label>
                            <Textarea
                                id="notes"
                                placeholder="Mahasiswa aktif bertanya dan memimpin diskusi..."
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                className="min-h-[80px]"
                            />
                        </div>

                        {error && <p className="text-red-500 text-sm">{error}</p>}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={loading || !hasAnySkillEnabled}>
                            {loading ? 'Menyimpan...' : 'Simpan Evaluasi SCL'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
