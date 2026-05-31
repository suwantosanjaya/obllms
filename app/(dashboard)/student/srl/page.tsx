/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from 'next/navigation'
import { getSessionUser } from '@/app/actions/userActions'
import { getStudentAllReflections } from '@/app/actions/reflectionActions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BookOpen, Target, Trophy, CheckCircle2, XCircle, ArrowRight, PenLine } from 'lucide-react'
import Link from 'next/link'

export default async function SRLTrackerPage() {
    const user = await getSessionUser()
    if (!user || !user.roles?.includes('student')) {
        redirect('/')
    }

    const res = await getStudentAllReflections()
    const enrollments: any[] = res.success && (res as any).enrollments ? (res as any).enrollments : []
    const stats = res.success && (res as any).stats
        ? (res as any).stats
        : { totalReflections: 0, totalPointsFromReflection: 0, totalTargetMet: 0 }

    const targetMetPct = stats.totalReflections > 0
        ? Math.round((stats.totalTargetMet / stats.totalReflections) * 100)
        : 0

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">SRL Tracker</h1>
                <p className="text-muted-foreground mt-1">Pantau dan evaluasi catatan belajar mandiri (Self-Regulated Learning) Anda di semua kelas.</p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="pt-4 flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <PenLine className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-primary">{stats.totalReflections}</p>
                            <p className="text-xs text-muted-foreground">Total Jurnal</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/50">
                    <CardContent className="pt-4 flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
                            <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-green-700 dark:text-green-400">{targetMetPct}%</p>
                            <p className="text-xs text-muted-foreground">Target Tercapai</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800/50">
                    <CardContent className="pt-4 flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 dark:bg-yellow-900/40 rounded-lg">
                            <Trophy className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-yellow-700 dark:text-yellow-400">{stats.totalPointsFromReflection}</p>
                            <p className="text-xs text-muted-foreground">Poin dari Refleksi</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4 flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-blue-700 dark:text-blue-400">{enrollments.length}</p>
                            <p className="text-xs text-muted-foreground">Kelas Aktif</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Per-course reflection history */}
            <div className="grid gap-6 lg:grid-cols-2">
                {enrollments.length === 0 ? (
                    <Card className="col-span-2">
                        <CardContent className="py-12 text-center text-muted-foreground">
                            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
                            <p className="font-medium">Anda belum terdaftar di kelas manapun.</p>
                            <Button variant="outline" className="mt-4" asChild>
                                <Link href="/student/courses">Jelajahi Kelas</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    enrollments.map((enrollment: any) => {
                        const courseTitle = enrollment.course?.subject?.title || 'Kelas'
                        const courseCode = enrollment.course?.subject?.code || ''
                        const reflections = enrollment.reflections || []
                        const metCount = reflections.filter((r: any) => r.targetMet).length

                        return (
                            <Card key={enrollment.id} className="overflow-hidden">
                                <CardHeader className="pb-3 border-b">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <CardTitle className="text-base leading-snug">{courseTitle}</CardTitle>
                                            <CardDescription>{courseCode}</CardDescription>
                                        </div>
                                        <Badge variant="outline" className="shrink-0 text-xs">
                                            {reflections.length} Jurnal
                                        </Badge>
                                    </div>
                                    {reflections.length > 0 && (
                                        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                            <span>{metCount} dari {reflections.length} minggu target tercapai</span>
                                        </div>
                                    )}
                                </CardHeader>
                                <CardContent className="pt-4">
                                    {reflections.length === 0 ? (
                                        <div className="text-center py-4 border border-dashed rounded-lg">
                                            <p className="text-sm text-muted-foreground">Belum ada jurnal refleksi di kelas ini.</p>
                                            <Button variant="ghost" size="sm" className="mt-2" asChild>
                                                <Link href={`/student/course/${enrollment.courseId}?tab=refleksi`}>
                                                    Tulis Jurnal Pertama <ArrowRight className="ml-1 w-3 h-3" />
                                                </Link>
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {reflections.map((r: any) => (
                                                <div key={r.id} className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                                                    <div className="flex items-center gap-2">
                                                        {r.targetMet ? (
                                                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                                                        ) : (
                                                            <XCircle className="w-4 h-4 text-muted-foreground/50 shrink-0" />
                                                        )}
                                                        <span className="font-medium">Minggu {r.weekNumber}</span>
                                                        {r.targetMet && (
                                                            <Badge variant="outline" className="text-[10px] py-0 h-4 text-green-600 border-green-200 bg-green-50 dark:bg-green-900/20">
                                                                Target Tercapai
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">
                                                        {new Date(r.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                    </span>
                                                </div>
                                            ))}
                                            <Button variant="ghost" size="sm" className="w-full mt-1 text-xs" asChild>
                                                <Link href={`/student/course/${enrollment.courseId}?tab=refleksi`}>
                                                    Tulis Jurnal Baru <ArrowRight className="ml-1 w-3 h-3" />
                                                </Link>
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )
                    })
                )}
            </div>
        </div>
    )
}
