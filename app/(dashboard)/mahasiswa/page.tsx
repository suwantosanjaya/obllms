import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Target, Clock, BookOpen, Activity, AlertCircle, ArrowRight, PlayCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { getStudentCourses, getStudentDashboardMetrics } from '@/app/actions/courseActions'
import { getSessionUser } from '@/app/actions/userActions'
import { redirect } from 'next/navigation'

export default async function MahasiswaDashboard() {
    // Validate session
    const mhsUser = await getSessionUser()
    if (!mhsUser || mhsUser.role !== 'mahasiswa') {
        redirect('/')
    }

    const coursesResponse = await getStudentCourses(mhsUser.id)
    const activeCourses = (coursesResponse.success && coursesResponse.enrollments) ? coursesResponse.enrollments : []

    // Fetch real metrics
    const metricsRes = mhsUser ? await getStudentDashboardMetrics(mhsUser.id) : null
    const metrics: any = metricsRes?.success ? metricsRes : {
        srlTarget: 10, srlAchieved: 0, progressMateri: "0%", studyTimeHours: 0, activityLevel: "Rendah", upcomingAssessments: []
    }

    const srlTarget = metrics.srlTarget || 10
    const srlAchieved = metrics.srlAchieved || 0
    const progressMateri = metrics.progressMateri || "0%"
    const studyTimeHours = metrics.studyTimeHours || 0
    const activityLevel = metrics.activityLevel || "Rendah"
    const upcomingAssessments = metrics.upcomingAssessments || []

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard Mahasiswa</h1>
                    <p className="text-muted-foreground mt-1">Selamat datang kembali! Berikut ringkasan belajar Anda.</p>
                </div>
            </div>

            {/* SRL Quick Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Target SRL Tercapai</CardTitle>
                        <Target className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{srlAchieved} / {srlTarget}</div>
                        <p className="text-xs text-muted-foreground mt-1">Target jam belajar</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Progress Materi</CardTitle>
                        <BookOpen className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{progressMateri}</div>
                        <p className="text-xs text-muted-foreground mt-1">Selesai dari total terdaftar</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Waktu Belajar</CardTitle>
                        <Clock className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{studyTimeHours} Jam</div>
                        <p className="text-xs text-muted-foreground mt-1">Riwayat Total</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Aktivitas</CardTitle>
                        <Activity className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activityLevel}</div>
                        <p className="text-xs text-muted-foreground mt-1">Konsistensi 5 hari terakhir</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Next Activities Segment */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Deadline & Aktivitas Terdekat</CardTitle>
                        <CardDescription>
                            Tugas dan kuis yang membutuhkan perhatian segera.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        {upcomingAssessments && upcomingAssessments.length > 0 ? (
                            upcomingAssessments.map((assessment: any) => (
                                <div key={assessment.id} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
                                    <div className="flex flex-col gap-1">
                                        <span className="font-semibold">{assessment.title} - {assessment.course?.title}</span>
                                        <span className="text-sm text-muted-foreground">
                                            {assessment.dueDate ? new Date(assessment.dueDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Tidak ada deadline'}
                                        </span>
                                    </div>
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={`/mahasiswa/assessments?courseId=${assessment.courseId}`}>Kerjakan</Link>
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-muted-foreground py-6 border border-dashed rounded-lg">
                                Hore! Tidak ada deadline terdekat saat ini.
                            </div>
                        )}

                        {/* Static SRL Reminder if SRL is poor */}
                        {srlAchieved < srlTarget && (
                            <div className="flex items-center justify-between p-4 border rounded-lg bg-red-50 hover:bg-red-100 transition-colors">
                                <div className="flex flex-col gap-1">
                                    <span className="font-semibold text-red-700">Refleksi Belajar & SRL Target</span>
                                    <span className="text-sm text-red-600">Anda belum mencapai target jam belajar Anda.</span>
                                </div>
                                <Button variant="destructive" size="sm" asChild>
                                    <Link href="/mahasiswa/srl">Update Jurnal</Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Courses Overview */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Mata Kuliah Aktif</CardTitle>
                        <CardDescription>
                            Progress pencapaian Outcome Based Learning (OBL).
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        {activeCourses.length === 0 ? (
                            <div className="text-center text-muted-foreground py-4">
                                Belum ada kelas yang diambil.
                            </div>
                        ) : (
                            activeCourses.map((enrollment: any) => (
                                <div key={enrollment.id} className="flex flex-col gap-2 pb-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 bg-muted/50 border-muted-foreground/20">
                                                {enrollment.course.semester} {enrollment.course.academicYear}
                                            </Badge>
                                            <span className="font-medium">{enrollment.course.subject.title}</span>
                                        </div>
                                        <span className="text-primary font-medium">Aktif</span>
                                    </div>
                                    <div className="w-full bg-secondary rounded-full h-2">
                                        <div className="bg-primary h-2 rounded-full" style={{ width: '50%' }}></div>
                                    </div>
                                </div>
                            ))
                        )}

                        <Button variant="ghost" className="w-full mt-2" asChild>
                            <Link href="/mahasiswa/courses">
                                Lihat Semua Mata Kuliah <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
