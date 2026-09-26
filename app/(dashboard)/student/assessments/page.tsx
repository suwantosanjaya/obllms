/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getStudentAssessments } from '@/app/actions/assessmentActions'
import { getSessionUser } from '@/app/actions/userActions'
import { SubmitAssessmentDialog } from '@/app/components/mahasiswa/SubmitAssessmentDialog'
import { ClipboardList, CheckCircle2, Clock, FileText } from 'lucide-react'
import { stripHtml, formatDateTime } from '@/lib/utils'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import 'suneditor/dist/css/suneditor.min.css'

export default async function StudentAssessmentsPage() {
    const user = await getSessionUser()
    if (!user || !user.roles?.includes('student')) {
        redirect('/')
    }

    const { success, assessments } = await getStudentAssessments(user.id)
    const validAssessments = success ? (assessments || []) : []

    const upcomingTasks = validAssessments.filter((a: any) => a.submissions.length === 0)
    const completedTasks = validAssessments.filter((a: any) => a.submissions.length > 0)

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Tugas &amp; Ujian</h1>
                <p className="text-muted-foreground mt-1">Kelola dan kumpulkan tugas dari semua kelas Anda.</p>
            </div>

            {/* Summary row */}
            <div className="grid gap-4 sm:grid-cols-3">
                <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800/50">
                    <CardContent className="pt-4 flex items-center gap-3">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/40 rounded-lg">
                            <ClipboardList className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-orange-700 dark:text-orange-400">{upcomingTasks.length}</p>
                            <p className="text-xs text-muted-foreground">Tugas Tertunda</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/50">
                    <CardContent className="pt-4 flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
                            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-green-700 dark:text-green-400">{completedTasks.length}</p>
                            <p className="text-xs text-muted-foreground">Sudah Selesai</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4 flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Clock className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-primary">{validAssessments.length}</p>
                            <p className="text-xs text-muted-foreground">Total Tugas</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
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
                                    <div key={assessment.id} className="flex flex-col p-4 border rounded-lg hover:shadow-sm transition-all gap-4 bg-card dark:bg-card">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-base text-primary">{assessment.title}</h3>
                                                <p className="text-xs text-muted-foreground mt-1">{assessment.course?.subject?.code} — {assessment.course?.subject?.title}</p>
                                            </div>
                                            <Badge variant="destructive" className="shrink-0 ml-2 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-400 border-none">Belum Selesai</Badge>
                                        </div>
                                        {assessment.description && (
                                            <div className="mt-1">
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
                                        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t">
                                            <span className="text-xs text-muted-foreground">
                                                Tenggat: {assessment.dueDate
                                                    ? formatDateTime(assessment.dueDate, { dateStyle: 'medium', timeStyle: 'short' })
                                                    : 'Tidak ada tenggat'}
                                            </span>
                                            <div className="w-full sm:w-auto">
                                                <SubmitAssessmentDialog
                                                    assessmentId={assessment.id}
                                                    courseId={assessment.courseId}
                                                    studentId={user.id}
                                                    isSubmitted={false}
                                                    title={assessment.title}
                                                    format={assessment.format}
                                                    isPastDue={assessment.dueDate && !assessment.allowLateSubmission ? new Date(assessment.dueDate) < new Date() : false}
                                                />
                                            </div>
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
                                        <div key={assessment.id} className="flex flex-col p-4 border rounded-lg bg-card dark:bg-card gap-3">
                                            <div className="flex justify-between items-start gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold text-base text-primary">{assessment.title}</h4>
                                                    <p className="text-xs text-muted-foreground mt-1">{assessment.course?.subject?.code} — {assessment.course?.subject?.title}</p>
                                                </div>
                                                {(submission.score !== null && assessment.isScorePublished) ? (
                                                    <div className="flex flex-col items-end bg-green-50/50 dark:bg-green-950/20 p-2 rounded-md border border-green-100 dark:border-green-900/50 shrink-0">
                                                        <span className="text-[10px] text-muted-foreground uppercase font-semibold">Nilai</span>
                                                        <span className="font-black text-xl text-green-600 dark:text-green-400 leading-none">{Number(submission.score.toFixed(1))}</span>
                                                    </div>
                                                ) : (submission.score !== null && !assessment.isScorePublished) ? (
                                                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800 shrink-0">Sudah Dinilai</Badge>
                                                ) : submission.content === 'DITOLAK' ? (
                                                    <Badge variant="destructive" className="bg-red-100 text-red-800 border-none dark:bg-red-900/40 dark:text-red-400 shrink-0">Ditolak / Dikembalikan</Badge>
                                                ) : submission.history && submission.history.length > 0 ? (
                                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 shrink-0">Sudah Direvisi</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800 shrink-0">Menunggu Nilai</Badge>
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

                                            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t">
                                                <div className="flex flex-col gap-1">
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
                                                        <a href={submission.content ?? '#'} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline font-medium">
                                                            Lihat File ↗
                                                        </a>
                                                    )}
                                                </div>
                                                <div className="w-full sm:w-auto">
                                                    <SubmitAssessmentDialog
                                                        assessmentId={assessment.id}
                                                        courseId={assessment.courseId}
                                                        studentId={user.id}
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
        </div>
    )
}
