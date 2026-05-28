import { getSessionUser } from '@/app/actions/userActions'
import { getCourseDetails } from '@/app/actions/courseActions'
import { redirect } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Calendar, ChevronRight, Link2, Users } from 'lucide-react'
import Link from 'next/link'
import prisma from '@/lib/db'

export default async function StudentCourseDetailPage(props: { params: Promise<{ courseId: string }> }) {
    const params = await props.params
    const user = await getSessionUser()

    if (!user || !user.roles?.includes('student')) {
        redirect('/')
    }

    // Verify student is enrolled in this course
    const enrollment = await prisma.enrollment.findUnique({
        where: {
            studentId_courseId: {
                studentId: user.id,
                courseId: params.courseId,
            }
        }
    })

    if (!enrollment) {
        redirect('/student/courses')
    }

    const res = await getCourseDetails(params.courseId)
    if (!res.success || !res.course) {
        redirect('/student/courses')
    }

    const course: any = res.course

    // Group modules by week
    const modulesByWeek: Record<number, any[]> = {}
    course.modules?.forEach((mod: any) => {
        const week = mod.weekNumber ?? 0
        if (!modulesByWeek[week]) modulesByWeek[week] = []
        modulesByWeek[week].push(mod)
    })
    const sortedWeeks = Object.keys(modulesByWeek).map(Number).sort((a, b) => a - b)

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Link href="/student/courses" className="hover:text-primary transition-colors">Kelas Saya</Link>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-foreground font-medium">{course.subject?.title}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge variant="outline">{course.subject?.code}</Badge>
                    <Badge variant="outline">{course.semester} {course.academicYear}</Badge>
                    {course.classCode && <Badge variant="outline">{course.classCode}</Badge>}
                </div>
                <h1 className="text-3xl font-bold tracking-tight">{course.subject?.title}</h1>
                <p className="text-muted-foreground mt-1">
                    Dosen: <span className="font-medium">{course.instructor?.name || 'Belum diutus'}</span>
                    {course.schedule && <span> · {course.schedule}</span>}
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content: Weekly Modules */}
                <div className="lg:col-span-2 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="w-5 h-5" />
                                Materi & Aktivitas Mingguan
                            </CardTitle>
                            <CardDescription>Daftar topik dan capaian pembelajaran per minggu.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {course.modules?.length === 0 ? (
                                <div className="text-center py-12 border border-dashed rounded-xl">
                                    <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                                    <p className="font-medium">Belum Ada Materi</p>
                                    <p className="text-sm text-muted-foreground mt-1">Dosen belum menambahkan materi untuk kelas ini.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {sortedWeeks.map(week => (
                                        <div key={week}>
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    Minggu {week}
                                                </div>
                                                <div className="flex-1 h-px bg-border" />
                                            </div>
                                            <div className="space-y-2 pl-2">
                                                {modulesByWeek[week].map((mod: any) => {
                                                    const clos = mod.moduleClos?.length > 0
                                                        ? mod.moduleClos.map((mc: any) => mc.clo)
                                                        : mod.clo ? [mod.clo] : []

                                                    // Detect if content is a URL
                                                    const isUrl = mod.content && (mod.content.startsWith('http://') || mod.content.startsWith('https://'))

                                                    return (
                                                        <div key={mod.id} className="flex gap-3 p-4 border rounded-xl bg-card hover:border-primary/20 hover:shadow-sm transition-all">
                                                            <div className="flex-none flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 shrink-0">
                                                                <BookOpen className="w-4 h-4 text-primary" />
                                                            </div>
                                                            <div className="flex-grow min-w-0">
                                                                <div className="flex flex-wrap items-start justify-between gap-2">
                                                                    <h3 className="font-semibold text-base leading-tight break-words">{mod.title}</h3>
                                                                    {clos.length > 0 && (
                                                                        <div className="flex flex-wrap gap-1">
                                                                            {clos.map((clo: any) => (
                                                                                <Badge key={clo.id} variant="secondary" className="text-xs">{clo.code}</Badge>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                {mod.content && (
                                                                    <div className="mt-1.5">
                                                                        {isUrl ? (
                                                                            <a
                                                                                href={mod.content}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline break-all"
                                                                            >
                                                                                <Link2 className="w-3.5 h-3.5 shrink-0" />
                                                                                Buka Materi / Video
                                                                            </a>
                                                                        ) : (
                                                                            <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed break-words" dangerouslySetInnerHTML={{ __html: mod.content }} />
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar: Course Info */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Informasi Kelas</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Dosen</span>
                                <span className="font-medium text-right">{course.instructor?.name || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Semester</span>
                                <span className="font-medium">{course.semester} {course.academicYear}</span>
                            </div>
                            {course.schedule && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Jadwal</span>
                                    <span className="font-medium text-right">{course.schedule}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Total Materi</span>
                                <span className="font-medium">{course.modules?.length ?? 0} topik</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Users className="w-4 h-4" /> Capaian Pembelajaran (CLO)
                            </CardTitle>
                            <CardDescription>Target hasil belajar yang harus Anda capai.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {course.subject?.subjectClos?.length === 0 ? (
                                <p className="text-sm text-muted-foreground italic">Belum ada CLO.</p>
                            ) : (
                                <ul className="space-y-2">
                                    {(course.curriculumYearId
                                        ? course.subject?.subjectClos?.filter((sc: any) => sc.clo?.curriculumYearId === course.curriculumYearId)
                                        : course.subject?.subjectClos ?? []
                                    ).map((sc: any) => (
                                        <li key={sc.id} className="text-sm">
                                            <span className="font-semibold text-primary">{sc.clo.code}</span>
                                            <span className="text-muted-foreground"> — {sc.clo.description}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
