import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SubmitAssessmentDialog } from '@/app/components/mahasiswa/SubmitAssessmentDialog'
import prisma from '@/lib/db'

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
                                        <p className="text-sm text-slate-600 dark:text-slate-300 bg-muted/50 dark:bg-muted/30 p-2 rounded">{assessment.description}</p>
                                    )}
                                    <div className="flex items-center justify-between mt-2 pt-4 border-t border-border/50">
                                        <span className="text-xs font-semibold text-orange-700 dark:text-orange-400 flex items-center gap-1">
                                            Tenggat: {new Date(assessment.dueDate).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                                        </span>
                                        <SubmitAssessmentDialog
                                            assessmentId={assessment.id}
                                            courseId={courseId}
                                            studentId={studentId}
                                            isSubmitted={false}
                                            title={assessment.title}
                                            format={assessment.format}
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
                                                        submission.cloScores.map((cs: any) => (
                                                            <Badge key={cs.cloId} variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                                                                {cs.clo.code}: {Number(cs.score.toFixed(2))}
                                                            </Badge>
                                                        ))
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground italic">Menunggu penilaian dosen</span>
                                                    )}
                                                </div>
                                            </div>
                                            {submission.score !== null ? (
                                                <div className="flex flex-col sm:items-end mt-2 sm:mt-0 bg-green-50/50 dark:bg-green-950/20 p-2 rounded-md border border-green-100 dark:border-green-900/50 min-w-fit">
                                                    <span className="text-[10px] text-muted-foreground uppercase font-semibold">Nilai Akhir</span>
                                                    <span className="font-black text-2xl text-green-600 dark:text-green-500 leading-none">{Number(submission.score.toFixed(2))}</span>
                                                </div>
                                            ) : (
                                                <Badge variant="outline" className="bg-green-100 text-green-800 border-none dark:bg-green-900/40 dark:text-green-400">Terkumpul</Badge>
                                            )}
                                        </div>
                                        {submission.feedback && (
                                            <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded text-sm text-blue-900 dark:text-blue-300 border border-blue-100 dark:border-blue-900/50">
                                                <span className="font-semibold block mb-1">Feedback Dosen:</span>
                                                {submission.feedback}
                                            </div>
                                        )}
                                        <div className="flex flex-wrap items-center justify-between gap-3 mt-2 pt-4 border-t border-border/50">
                                            <div className="flex flex-col gap-1 min-w-0">
                                                <span className="text-xs text-muted-foreground">
                                                    Dikumpulkan: {new Date(submission.submittedAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                                                </span>
                                                <a href={submission.content ?? '#'} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline font-semibold flex items-center gap-1">
                                                    Lihat Jawaban Saya ↗
                                                </a>
                                            </div>
                                            <div className="w-full sm:w-auto">
                                                <SubmitAssessmentDialog
                                                    assessmentId={assessment.id}
                                                    courseId={courseId}
                                                    studentId={studentId}
                                                    isSubmitted={true}
                                                    title={assessment.title}
                                                    format={assessment.format}
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
