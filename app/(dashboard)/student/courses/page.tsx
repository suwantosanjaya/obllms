/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BookOpen, Users, Clock, ChevronRight, GraduationCap, Search } from 'lucide-react'
import Link from 'next/link'
import { EnrollCourseButton } from '@/app/components/mahasiswa/EnrollCourseButton'
import { UnenrollCourseButton } from '@/app/components/mahasiswa/UnenrollCourseButton'
import { getStudentCourses, getAvailableCourses } from '@/app/actions/courseActions'
import { getSessionUser } from '@/app/actions/userActions'
import { redirect } from 'next/navigation'

export default async function MahasiswaCoursesPage() {
    const mhsUser = await getSessionUser()

    if (!mhsUser || !mhsUser.roles?.includes('student')) {
        redirect('/')
    }

    const enrolledRes = await getStudentCourses(mhsUser.id, mhsUser.activeDepartmentId)
    const availableRes = await getAvailableCourses(mhsUser.id, mhsUser.activeDepartmentId)

    const enrolledCourses = enrolledRes.success ? enrolledRes.enrollments || [] : []
    const availableCourses = availableRes.success ? availableRes.courses || [] : []
    
    const now = new Date()

    return (
        <div className="flex flex-col gap-8">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Eksplorasi Kelas</h1>
                <p className="text-muted-foreground mt-1">Daftar kelas baru dan lihat kelas yang sedang Anda ambil.</p>
            </div>

            {/* Kelas Anda (enrolled) — shown first if any */}
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <GraduationCap className="w-5 h-5 text-green-600" />
                    <h2 className="text-xl font-semibold">Kelas Anda</h2>
                    <Badge variant="secondary" className="ml-1">{enrolledCourses.length}</Badge>
                </div>

                {enrolledCourses.length === 0 ? (
                    <div className="text-center text-muted-foreground py-12 border border-dashed rounded-xl">
                        <GraduationCap className="w-10 h-10 mx-auto mb-3 opacity-40" />
                        <p className="font-medium">Belum terdaftar di kelas manapun.</p>
                        <p className="text-sm mt-1">Daftarkan diri Anda ke kelas yang tersedia di bawah.</p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {enrolledCourses.map((enrollment: any) => {
                            const deadline = enrollment.course.config?.enrollmentDeadline ? new Date(enrollment.course.config.enrollmentDeadline) : null;
                            const isClosed = deadline && now > deadline;
                            
                            return (
                                <div key={enrollment.id} className="flex flex-col p-4 border rounded-xl bg-card shadow-sm hover:shadow-md transition-all gap-3">
                                    {/* Top: Icon + Info */}
                                    <div className="flex items-start gap-3">
                                        <div className="h-10 w-10 rounded-full bg-green-500/10 flex shrink-0 items-center justify-center border border-green-500/20">
                                            <BookOpen className="h-5 w-5 text-green-600" />
                                        </div>
                                        <div className="flex flex-col gap-1 flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-muted/50 border-muted-foreground/20 shrink-0">
                                                    {enrollment.course.semester} {enrollment.course.academicYear}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">{enrollment.course.subject.code}</span>
                                            </div>
                                            <h3 className="font-semibold text-base leading-snug">
                                                {enrollment.course.subject.title}
                                                <span className="font-normal text-sm text-muted-foreground ml-1.5">
                                                    ({enrollment.course.classCode || 'Kelas Reguler'})
                                                </span>
                                            </h3>
                                        </div>
                                    </div>

                                    {/* Tags: Jadwal & Deadline */}
                                    <div className="flex flex-col gap-1.5">
                                        {enrollment.course.schedule && (
                                            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md w-fit">
                                                Jadwal: {enrollment.course.schedule}
                                            </span>
                                        )}
                                        {deadline && (
                                            <span className={`text-xs font-medium px-2 py-1 rounded-md w-fit flex items-center gap-1 ${isClosed ? 'text-red-600 bg-red-50' : 'text-orange-600 bg-orange-50'}`}>
                                                <Clock className="w-3 h-3 shrink-0" />
                                                {isClosed ? 'Sudah ditutup:' : 'Akan ditutup:'} {deadline.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        )}
                                        {enrollment.course.config?.isGamificationEnabled && (
                                            <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded-md w-fit flex items-center gap-1 border border-amber-200">
                                                <span className="font-bold">Lv.{enrollment.gameProfile?.level || 1}</span>
                                                <span className="mx-1">•</span>
                                                <span>{enrollment.gameProfile?.points || 0} Pts</span>
                                            </span>
                                        )}
                                    </div>

                                    {/* Footer: actions */}
                                    <div className="flex items-center justify-between border-t pt-3 mt-auto gap-2 flex-wrap">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Terdaftar</span>
                                            {!isClosed && (
                                                <UnenrollCourseButton studentId={mhsUser.id} courseId={enrollment.courseId} courseTitle={enrollment.course.subject.title} />
                                            )}
                                        </div>
                                        <Button asChild size="sm" variant="default" className="shrink-0">
                                            <Link href={`/student/course/${enrollment.courseId}`}>
                                                <BookOpen className="w-3.5 h-3.5 mr-1.5" /> Masuk Kelas
                                                <ChevronRight className="w-3.5 h-3.5 ml-1" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </section>

            {/* Kelas Tersedia */}
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <Search className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold">Kelas Tersedia</h2>
                    <Badge variant="secondary" className="ml-1">{availableCourses.length}</Badge>
                </div>

                {availableCourses.length === 0 ? (
                    <div className="text-center text-muted-foreground py-12 border border-dashed rounded-xl">
                        <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
                        <p className="font-medium">Tidak ada kelas baru yang tersedia saat ini.</p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {availableCourses.map((course: any) => {
                            const deadline = course.config?.enrollmentDeadline ? new Date(course.config.enrollmentDeadline) : null;
                            const isClosed = deadline && now > deadline;
                            
                            return (
                                <div key={course.id} className="flex flex-col p-4 border rounded-xl hover:border-primary/30 hover:shadow-md transition-all bg-card shadow-sm gap-3">
                                    {/* Top: Icon + Info */}
                                    <div className="flex items-start gap-3">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex shrink-0 items-center justify-center">
                                            <BookOpen className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className="flex flex-col gap-1 flex-1 min-w-0">
                                            <h3 className="font-semibold text-base leading-snug">
                                                {course.subject.title}
                                                <span className="font-normal text-sm text-muted-foreground ml-1.5">
                                                    ({course.classCode || 'Kelas Reguler'})
                                                </span>
                                            </h3>
                                            <span className="text-xs text-muted-foreground">{course.subject.code}</span>
                                            <span className="text-xs text-slate-500 flex items-center gap-1">
                                                <Users className="h-3 w-3 shrink-0" />
                                                {course._count?.enrollments || 0} terdaftar · Dosen: {course.instructor?.name || 'Belum diutus'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Tags: Jadwal & Deadline */}
                                    <div className="flex flex-col gap-1.5">
                                        {course.schedule && (
                                            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md w-fit">
                                                Jadwal: {course.schedule}
                                            </span>
                                        )}
                                        {deadline && (
                                            <span className={`text-xs font-medium px-2 py-1 rounded-md w-fit flex items-center gap-1 ${isClosed ? 'text-red-600 bg-red-50' : 'text-orange-600 bg-orange-50'}`}>
                                                <Clock className="w-3 h-3 shrink-0" />
                                                {isClosed ? 'Sudah ditutup:' : 'Akan ditutup:'} {deadline.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        )}
                                    </div>

                                    {/* Description */}
                                    {course.subject.description && (
                                        <p className="text-xs text-muted-foreground line-clamp-2">{course.subject.description}</p>
                                    )}

                                    {/* Footer: action */}
                                    <div className="flex items-center justify-end border-t pt-3 mt-auto">
                                        {isClosed ? (
                                            <Badge variant="destructive" className="px-3 py-1 text-xs">Pendaftaran Ditutup</Badge>
                                        ) : (
                                            <EnrollCourseButton studentId={mhsUser.id} courseId={course.id} courseTitle={course.subject.title} />
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </section>
        </div>
    )
}
