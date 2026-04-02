/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, BookOpen, AlertTriangle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { getInstructorCourses, getInstructorDashboardMetrics } from '@/app/actions/courseActions'
import { getSessionUser } from '@/app/actions/userActions'
import { CreateCourseDialog } from '@/app/components/dosen/CreateCourseDialog'
import { redirect } from 'next/navigation'

export default async function DosenDashboard() {
    const dosenUser = await getSessionUser()
    if (!dosenUser || dosenUser.role !== 'dosen') {
        redirect('/')
    }

    const coursesResponse = await getInstructorCourses(dosenUser.id)

    // Fetch real metrics
    const metricsRes = dosenUser ? await getInstructorDashboardMetrics(dosenUser.id) : null
    const metrics: any = metricsRes?.success ? metricsRes.metrics : {
        totalCourses: 0, totalStudents: 0, unassessedCount: 0, totalAssessments: 0, averageOBL: 0, atRiskStudents: []
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard Dosen</h1>
                    <p className="text-muted-foreground mt-1">Ringkasan kelas, pencapaian OBL, dan analisis mahasiswa.</p>
                </div>
                <CreateCourseDialog />
            </div>

            {/* Dosen Quick Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Kelas Aktif</CardTitle>
                        <BookOpen className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.totalCourses}</div>
                        <p className="text-xs text-muted-foreground mt-1">Semester ini</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Mahasiswa Diampu</CardTitle>
                        <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.totalStudents}</div>
                        <p className="text-xs text-muted-foreground mt-1">Total dari semua kelas</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tugas Perlu Dinilai</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.unassessedCount}</div>
                        <p className="text-xs text-muted-foreground mt-1">Dari {metrics.totalAssessments} tugas terkirim</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Rata-rata OBL</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.averageOBL}%</div>
                        <p className="text-xs text-muted-foreground mt-1">Estimasi indikator CPL</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Active Courses List */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Kelas Aktif Anda</CardTitle>
                        <CardDescription>Manajemen kelas dan pantau progress.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {coursesResponse.courses?.length === 0 ? (
                                <div className="text-center text-muted-foreground py-8 border border-dashed rounded-lg">
                                    Belum ada kelas yang dibuat.
                                </div>
                            ) : (
                                coursesResponse.courses?.map((course: any) => (
                                    <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-xs bg-muted/50 border-muted-foreground/20">
                                                    {course.semester} {course.academicYear}
                                                </Badge>
                                                <span className="font-semibold">{course.subject.title}</span>
                                            </div>
                                            <span className="text-sm text-muted-foreground">{course.subject.code} • {course._count?.enrollments || 0} Mahasiswa</span>
                                        </div>
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/dosen/course/${course.id}`}>Kelola</Link>
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                        <Button variant="outline" className="mt-6 w-full" asChild>
                            <Link href="/dosen/obl">Lihat Detail Pemetaan OBL</Link>
                        </Button>
                    </CardContent>
                </Card>

                {/* At-Risk Students */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Mahasiswa Berisiko</CardTitle>
                        <CardDescription>
                            Berdasarkan analitik performa dan interaksi mingguan.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {metrics.atRiskStudents && metrics.atRiskStudents.length > 0 ? (
                                metrics.atRiskStudents.map((risk: any, i: number) => (
                                    <div key={i} className="flex items-start gap-4 rounded-lg bg-orange-500/10 p-4 border border-orange-500/20">
                                        <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-semibold">{risk.studentName}</p>
                                            <p className="text-xs text-muted-foreground mt-1">{risk.courseName} - {risk.reason}.</p>
                                            <Button size="sm" variant="link" className="p-0 h-auto mt-2 text-orange-600">Terbitkan Peringatan</Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-muted-foreground py-8 border border-dashed rounded-lg">
                                    Hebat! Seluruh mahasiswa dalam track yang aman.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
