/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getStudentAssessments } from '@/app/actions/assessmentActions'
import prisma from '@/lib/db'
import { SubmitAssessmentDialog } from '@/app/components/mahasiswa/SubmitAssessmentDialog'

export default async function MahasiswaAssessmentsPage() {
    // Get current simulated mahasiswa
    const mhsUser = await prisma.user.findFirst({ where: { role: 'mahasiswa' } })

    if (!mhsUser) {
        return <div className="p-8 text-center text-muted-foreground">User mahasiswa tidak ditemukan di database. Pastikan seed database sudah berjalan.</div>
    }

    const { success, assessments } = await getStudentAssessments(mhsUser.id)
    const validAssessments = success ? (assessments || []) : []

    const upcomingTasks = validAssessments.filter((a: any) => a.submissions.length === 0)
    const completedTasks = validAssessments.filter((a: any) => a.submissions.length > 0)

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Tugas & Asesmen</h1>
                <p className="text-muted-foreground mt-1">Kelola dan kumpulkan tugas dari semua kelas Anda.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Upcoming Tasks */}
                <Card>
                    <CardHeader className="pb-4 border-b">
                        <CardTitle>Perlu Dikerjakan</CardTitle>
                        <CardDescription>Tugas yang belum Anda kumpulkan.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            {upcomingTasks.length === 0 ? (
                                <div className="text-center text-muted-foreground py-8 border border-dashed rounded-lg">
                                    Hore! Tidak ada tugas yang tertunda.
                                </div>
                            ) : (
                                upcomingTasks.map((assessment: any) => (
                                    <div key={assessment.id} className="flex flex-col p-4 border rounded-lg hover:shadow-sm transition-all gap-4 bg-background">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-semibold text-lg">{assessment.title}</h3>
                                                <p className="text-sm font-medium text-muted-foreground mt-1">{assessment.course.subject.code} - {assessment.course.subject.title}</p>
                                            </div>
                                            <Badge variant="destructive" className="shrink-0">Belum Selesai</Badge>
                                        </div>
                                        {assessment.description && (
                                            <p className="text-sm text-slate-600 line-clamp-2">{assessment.description}</p>
                                        )}
                                        <div className="flex items-center justify-between mt-2 pt-4 border-t">
                                            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                                Tenggat: {new Date(assessment.dueDate).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                                            </span>
                                            <SubmitAssessmentDialog
                                                assessmentId={assessment.id}
                                                studentId={mhsUser.id}
                                                isSubmitted={false}
                                                title={assessment.title}
                                            />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Completed Tasks */}
                <Card>
                    <CardHeader className="pb-4 border-b">
                        <CardTitle>Sudah Selesai</CardTitle>
                        <CardDescription>Tugas yang berhasil dikumpulkan.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            {completedTasks.length === 0 ? (
                                <div className="text-center text-muted-foreground py-8 border border-dashed rounded-lg">
                                    Belum ada tugas yang diselesaikan.
                                </div>
                            ) : (
                                completedTasks.map((assessment: any) => {
                                    const submission = assessment.submissions[0]
                                    return (
                                        <div key={assessment.id} className="flex flex-col p-4 border rounded-lg bg-card gap-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-semibold text-base">{assessment.title}</h4>
                                                    <p className="text-sm text-muted-foreground mt-1">{assessment.course.subject.code}</p>
                                                </div>
                                                <Badge variant="default" className="shrink-0">Selesai</Badge>
                                            </div>
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2 pt-4 border-t">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs text-muted-foreground">
                                                        Dikumpulkan: {new Date(submission.submittedAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                                                    </span>
                                                    <a href={submission.content ?? '#'} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline font-medium break-all">
                                                        Lihat File
                                                    </a>
                                                </div>
                                                <SubmitAssessmentDialog
                                                    assessmentId={assessment.id}
                                                    studentId={mhsUser.id}
                                                    isSubmitted={true}
                                                    title={assessment.title}
                                                />
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
