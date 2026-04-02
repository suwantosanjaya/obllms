/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Users } from 'lucide-react'
import { EnrollCourseButton } from '@/app/components/mahasiswa/EnrollCourseButton'
import { getStudentCourses, getAvailableCourses } from '@/app/actions/courseActions'
import prisma from '@/lib/db'

export default async function MahasiswaCoursesPage() {
    // Get the current simulated student
    const mhsUser = await prisma.user.findFirst({ where: { role: 'mahasiswa' } })

    if (!mhsUser) {
        return <div className="p-8 text-center text-muted-foreground">User mahasiswa tidak ditemukan di database. Pastikan seed database sudah berjalan.</div>
    }

    const enrolledRes = await getStudentCourses(mhsUser.id)
    const availableRes = await getAvailableCourses(mhsUser.id)

    const enrolledCourses = enrolledRes.success ? enrolledRes.enrollments || [] : []
    const availableCourses = availableRes.success ? availableRes.courses || [] : []

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Eksplorasi Kelas</h1>
                <p className="text-muted-foreground mt-1">Daftar kelas baru dan lihat kelas yang sedang Anda ambil.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Available Courses */}
                <Card>
                    <CardHeader>
                        <CardTitle>Kelas Tersedia</CardTitle>
                        <CardDescription>Mata kuliah yang dapat Anda ambil semester ini.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {availableCourses.length === 0 ? (
                                <div className="text-center text-muted-foreground py-8 border border-dashed rounded-lg">
                                    Tidak ada kelas baru yang tersedia saat ini.
                                </div>
                            ) : (
                                availableCourses.map((course: any) => (
                                    <div key={course.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className="h-10 w-10 mt-1 rounded-full bg-primary/10 flex shrink-0 items-center justify-center">
                                                <BookOpen className="h-5 w-5 text-primary" />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="font-semibold text-base">{course.title}</span>
                                                <span className="text-sm text-muted-foreground">{course.code}</span>
                                                <span className="text-xs font-medium text-slate-500 flex items-center gap-1 mt-1">
                                                    <Users className="h-3 w-3" /> {course._count?.enrollments || 0} Mahasiswa terdaftar • Dosen: {course.instructor?.name || 'Belum diutus'}
                                                </span>
                                                {course.description && (
                                                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{course.description}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="shrink-0 flex items-center justify-end">
                                            <EnrollCourseButton studentId={mhsUser.id} courseId={course.id} courseTitle={course.title} />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Enrolled Courses */}
                <Card>
                    <CardHeader>
                        <CardTitle>Kelas Anda</CardTitle>
                        <CardDescription>Mata kuliah yang sedang Anda ambil.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {enrolledCourses.length === 0 ? (
                                <div className="text-center text-muted-foreground py-8 border border-dashed rounded-lg">
                                    Belum terdaftar di kelas manapun.
                                </div>
                            ) : (
                                enrolledCourses.map((enrollment: any) => (
                                    <div key={enrollment.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg bg-card gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-green-500/10 flex shrink-0 items-center justify-center border border-green-500/20">
                                                <BookOpen className="h-5 w-5 text-green-600" />
                                            </div>
                                            <div className="flex flex-col gap-2.5 flex-1">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 bg-muted/50 border-muted-foreground/20">
                                                            {enrollment.course.semester} {enrollment.course.academicYear}
                                                        </Badge>
                                                        <span className="text-sm text-muted-foreground">{enrollment.course.subject.code}</span>
                                                    </div>
                                                    <h3 className="font-semibold text-lg hover:text-primary transition-colors cursor-pointer">{enrollment.course.subject.title}</h3>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="shrink-0 flex items-center justify-end">
                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Terdaftar</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
