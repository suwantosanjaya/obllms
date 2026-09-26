import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SubmitAssessmentDialog } from '@/app/components/mahasiswa/SubmitAssessmentDialog'
import { ExpandableRichText } from '@/components/ui/expandable-rich-text'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FileText } from 'lucide-react'
import 'suneditor/dist/css/suneditor.min.css'
import prisma from '@/lib/db'
import { formatDateTime } from '@/lib/utils'

export async function StudentAssessmentsTab({ courseId, studentId }: { courseId: string, studentId: string }) {
    const assessments = await prisma.assessment.findMany({
        where: { courseId, isPublished: true },
        include: {
            course: {
                include: { subject: true }
            },
            assessmentClos: {
                include: { clo: true }
            },
            submissions: {
                where: { studentId },
                include: {
                    cloScores: { include: { clo: true } }
                }
            }
        },
        orderBy: { dueDate: 'asc' }
    })

    const upcomingTasks = assessments.filter(a => a.submissions.length === 0)
    const completedTasks = assessments.filter(a => a.submissions.length > 0)

    return (
        <div className="grid gap-6 xl:grid-cols-2">
            {/* Upcoming Tasks */}
            <Card className="overflow-hidden border-orange-200 dark:border-orange-800/50 !bg-orange-50 dark:!bg-orange-900/25">
                <CardHeader className="pb-4 border-b border-orange-200 dark:border-orange-800/50 bg-orange-50 dark:bg-transparent">
                    <CardTitle className="text-orange-900 dark:text-orange-400">Perlu Dikerjakan</CardTitle>
                    <CardDescription>Tugas yang belum Anda kumpulkan.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        {upcomingTasks.length === 0 ? (
                            <div className="text-center text-muted-foreground py-8 border border-dashed rounded-lg bg-card dark:bg-muted/10">
                                Tidak ada tugas yang tertunda saat ini.
                            </div>
                        ) : (
                            upcomingTasks.map((assessment: any) => (
                                <div key={assessment.id} className="flex flex-col p-4 border rounded-lg hover:shadow-sm transition-all gap-4 bg-card">
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg text-primary">{assessment.title}</h3>
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {assessment.assessmentClos.map((ac: any) => (
                                                    <Badge key={ac.cloId} variant="outline" className="text-[10px] bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                                        {ac.clo.code} ({ac.weight}%)
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                        <Badge variant="destructive" className="shrink-0 sm:self-start bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-400 border-none">Belum Selesai</Badge>
                                    </div>
                                    {assessment.description && (
                                        <div className="mt-2">
                                            <Sheet>
                                                <SheetTrigger asChild>
                                                    <Button variant="outline" size="sm" className="text-xs bg-muted/50 hover:bg-muted">
                                                        <FileText className="w-4 h-4 mr-2" />
                                                        Baca Detail Tugas
                                                    </Button>
                                                </SheetTrigger>
                                                <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-0 flex flex-col z-[100]">
                                                    <div className="p-6 border-b border-border/50 bg-muted/10">
                                                        <SheetHeader>
                                                            <SheetTitle className="text-xl text-primary">{assessment.title}</SheetTitle>
                                                            <SheetDescription>Detail dan instruksi penugasan.</SheetDescription>
                                                        </SheetHeader>
                                                    </div>
                                                    <div className="p-6">
                                                        <div
                                                            className="sun-editor-editable !bg-transparent !border-0 !p-0 rounded-lg text-sm dark:text-slate-200"
                                                            dangerouslySetInnerHTML={{ __html: assessment.description }}
                                                        />
                                                    </div>
                                                </SheetContent>
                                            </Sheet>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between mt-2 pt-4 border-t border-border/50">
                                        <span className="text-xs font-semibold text-orange-700 dark:text-orange-400 flex items-center gap-1">
                                            Tenggat: {formatDateTime(assessment.dueDate, { dateStyle: 'medium', timeStyle: 'short' })}
                                        </span>
                                        <SubmitAssessmentDialog
                                            assessmentId={assessment.id}
                                            courseId={courseId}
                                            studentId={studentId}
                                            isSubmitted={false}
                                            title={assessment.title}
                                            format={assessment.format}
                                            isPastDue={assessment.dueDate && !assessment.allowLateSubmission ? new Date(assessment.dueDate) < new Date() : false}
                                        />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Completed Tasks */}
            <Card className="overflow-hidden border-green-200 dark:border-green-800/50 !bg-green-50 dark:!bg-green-900/25">
                <CardHeader className="pb-4 border-b border-green-200 dark:border-green-800/50 bg-green-50 dark:bg-transparent">
                    <CardTitle className="text-green-900 dark:text-green-400">Sudah Selesai</CardTitle>
                    <CardDescription>Tugas yang berhasil dikumpulkan.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        {completedTasks.length === 0 ? (
                            <div className="text-center text-muted-foreground py-8 border border-dashed rounded-lg bg-card dark:bg-muted/10">
                                Belum ada tugas yang diselesaikan.
                            </div>
                        ) : (
                            completedTasks.map((assessment: any) => {
                                const submission = assessment.submissions[0]
                                return (
                                    <div key={assessment.id} className="flex flex-col p-4 border rounded-lg bg-card gap-4 hover:shadow-sm transition-all">
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                                            <div className="flex-1">
                                                <h4 className="font-bold text-base text-primary">{assessment.title}</h4>
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {submission.cloScores.length > 0 ? (
                                                        assessment.isScorePublished ? (
                                                            submission.cloScores.map((cs: any) => (
                                                                <Badge key={cs.cloId} variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                                                                    {cs.clo.code}: {Number(cs.score.toFixed(2))}
                                                                </Badge>
                                                            ))
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground italic">Nilai CLO disembunyikan</span>
                                                        )
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground italic">Menunggu penilaian dosen</span>
                                                    )}
                                                </div>
                                            </div>
                                            {submission.content === 'DITOLAK' ? (
                                                <Badge variant="destructive" className="bg-red-100 text-red-800 border-none dark:bg-red-900/40 dark:text-red-400">Ditolak / Dikembalikan</Badge>
                                            ) : submission.score !== null ? (
                                                assessment.isScorePublished ? (
                                                    <div className="flex flex-col sm:items-end mt-2 sm:mt-0 bg-green-50/50 dark:bg-green-950/20 p-2 rounded-md border border-green-100 dark:border-green-900/50 min-w-fit">
                                                        <span className="text-[10px] text-muted-foreground uppercase font-semibold">Nilai Akhir</span>
                                                        <span className="font-black text-2xl text-green-600 dark:text-green-500 leading-none">{Number(submission.score.toFixed(2))}</span>
                                                    </div>
                                                ) : (
                                                    <Badge variant="secondary" className="mt-2 sm:mt-0 bg-slate-100 text-slate-700 border-none">Sudah Dinilai</Badge>
                                                )
                                            ) : submission.history && submission.history.length > 0 ? (
                                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 shrink-0">Sudah Direvisi</Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-green-100 text-green-800 border-none dark:bg-green-900/40 dark:text-green-400">Terkumpul</Badge>
                                            )}
                                        </div>
                                        <div className="mt-1 flex flex-wrap gap-2">
                                            {assessment.description && (
                                                <Sheet>
                                                    <SheetTrigger asChild>
                                                        <Button variant="outline" size="sm" className="text-xs bg-muted/50 hover:bg-muted h-8">
                                                            <FileText className="w-4 h-4 mr-2" />
                                                            Lihat Detail Tugas
                                                        </Button>
                                                    </SheetTrigger>
                                                    <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-0 flex flex-col z-[100]">
                                                        <div className="p-6 border-b border-border/50 bg-muted/10">
                                                            <SheetHeader>
                                                                <SheetTitle className="text-xl text-primary">{assessment.title}</SheetTitle>
                                                                <SheetDescription>Detail dan instruksi penugasan.</SheetDescription>
                                                            </SheetHeader>
                                                        </div>
                                                        <div className="p-6">
                                                            <div
                                                                className="sun-editor-editable !bg-transparent !border-0 !p-0 rounded-lg text-sm dark:text-slate-200"
                                                                dangerouslySetInnerHTML={{ __html: assessment.description }}
                                                            />
                                                        </div>
                                                    </SheetContent>
                                                </Sheet>
                                            )}
                                            {submission.history && submission.history.length > 0 && (
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="outline" size="sm" className="text-xs text-muted-foreground bg-muted/50 hover:bg-muted h-8">
                                                            Lihat Riwayat Penolakan ({submission.history.length})
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
                                                        <DialogHeader>
                                                            <DialogTitle>Riwayat Penolakan: {assessment.title}</DialogTitle>
                                                            <DialogDescription>
                                                                Menampilkan tugas yang pernah dikembalikan beserta alasannya.
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <div className="flex flex-col gap-4 mt-2">
                                                            {submission.history.map((h: any, i: number) => (
                                                                <div key={h.id} className="bg-muted/30 p-3 rounded-md border flex flex-col gap-2 text-sm text-left">
                                                                    <div className="flex justify-between items-center border-b pb-2 mb-1">
                                                                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                                                                            Penolakan ke-{submission.history.length - i}
                                                                        </Badge>
                                                                        <span className="text-muted-foreground text-xs">
                                                                            {new Date(h.rejectedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                                        </span>
                                                                    </div>
                                                                    {h.feedback && (
                                                                        <div className="bg-red-50/50 p-2.5 rounded border border-red-100 text-red-800 text-sm">
                                                                            <span className="font-semibold block mb-1 text-xs">Alasan Penolakan:</span>
                                                                            {h.feedback}
                                                                        </div>
                                                                    )}
                                                                    {(h.attachments && h.attachments.length > 0) ? (
                                                                        <div className="flex flex-col gap-1 mt-1">
                                                                            <span className="font-semibold text-muted-foreground text-xs">Lampiran yang ditolak:</span>
                                                                            {h.attachments.map((url: string, idx: number) => (
                                                                                <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm flex items-center gap-1">
                                                                                    Berkas {idx + 1} ↗
                                                                                </a>
                                                                            ))}
                                                                        </div>
                                                                    ) : (h.content && h.content !== 'DITOLAK') ? (
                                                                        <div className="mt-1">
                                                                            <span className="font-semibold text-muted-foreground text-xs block mb-1">Jawaban yang ditolak:</span>
                                                                            {h.content.startsWith('http') ? (
                                                                                <a href={h.content} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm flex items-center gap-1">
                                                                                    Buka Link Jawaban ↗
                                                                                </a>
                                                                            ) : (
                                                                                <div className="bg-background p-3 rounded border max-h-40 overflow-y-auto whitespace-pre-wrap text-sm text-muted-foreground">
                                                                                    {h.content}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    ) : null}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            )}
                                        </div>
                                        {submission.feedback && (
                                            <div className={`${submission.content === 'DITOLAK' ? 'bg-red-50 text-red-900 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-900/50' : 'bg-blue-50 text-blue-900 border-blue-100 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-900/50'} p-3 rounded text-sm border`}>
                                                <span className="font-semibold block mb-1">
                                                    {submission.content === 'DITOLAK' ? 'Alasan Penolakan:' : 'Feedback Dosen:'}
                                                </span>
                                                {submission.feedback}
                                            </div>
                                        )}
                                        <div className="flex flex-wrap items-center justify-between gap-3 mt-2 pt-4 border-t border-border/50">
                                            <div className="flex flex-col gap-1 min-w-0">
                                                {assessment.dueDate && (
                                                    <span className="text-xs text-muted-foreground">
                                                        Tenggat: {formatDateTime(assessment.dueDate, { dateStyle: 'medium', timeStyle: 'short' })}
                                                    </span>
                                                )}
                                                <span className="text-xs text-muted-foreground">
                                                    Dikumpulkan: {formatDateTime(submission.submittedAt, { dateStyle: 'medium', timeStyle: 'short' })}
                                                </span>
                                                {submission.content === 'DITOLAK' ? (
                                                    <span className="text-xs text-red-600 font-semibold italic">Silakan kerjakan/kumpulkan ulang</span>
                                                ) : (
                                                    <a href={submission.content ?? '#'} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline font-semibold flex items-center gap-1">
                                                        Lihat Jawaban Saya ↗
                                                    </a>
                                                )}
                                            </div>
                                            <div className="w-full sm:w-auto">
                                                <SubmitAssessmentDialog
                                                    assessmentId={assessment.id}
                                                    courseId={courseId}
                                                    studentId={studentId}
                                                    isSubmitted={true}
                                                    title={assessment.title}
                                                    format={assessment.format}
                                                    isPastDue={assessment.dueDate && !assessment.allowLateSubmission ? new Date(assessment.dueDate) < new Date() : false}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
