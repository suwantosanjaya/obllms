import { getCourseDetails } from '@/app/actions/courseActions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, AlertCircle, Trash2, Calendar, Users } from 'lucide-react'
import { CreateModuleDialog } from '@/app/components/dosen/CreateModuleDialog'
import { CourseSettingsDialog } from '@/app/components/dosen/CourseSettingsDialog'
import { Button } from '@/components/ui/button'

export default async function DosenCourseDetailPage(props: { params: Promise<{ courseId: string }> }) {
    const params = await props.params;
    const res = await getCourseDetails(params.courseId)

    if (!res.success || !res.course) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center border rounded-xl bg-card">
                <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="text-xl font-bold">Mata Kuliah Tidak Ditemukan</h3>
                <p className="text-muted-foreground mt-2">Mata kuliah yang Anda cari tidak ada atau Anda tidak memiliki akses.</p>
            </div>
        )
    }

    const course: any = res.course

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-sm">
                            {course.subject.code}
                        </Badge>
                        <Badge variant="secondary" className="text-sm">
                            {course.semester} {course.academicYear}
                        </Badge>
                        <h1 className="text-3xl font-bold tracking-tight">{course.subject.title}</h1>
                    </div>
                    <p className="text-muted-foreground mt-2 max-w-3xl">{course.subject.description}</p>
                </div>
                <div className="flex gap-2">
                    <CourseSettingsDialog courseId={course.id} config={course.config} />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-4 lg:grid-cols-5">
                {/* Main Content Area */}
                <div className="md:col-span-3 lg:col-span-4 space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row justify-between items-center bg-muted/30 border-b">
                            <div>
                                <CardTitle>Materi & Aktivitas Mingguan</CardTitle>
                                <CardDescription>Kelola struktur pembelajaran dan pemetaan CLO (Capaian Pembelajaran).</CardDescription>
                            </div>
                            <CreateModuleDialog courseId={course.id} clos={course.clos.map((c: any) => ({ id: c.id, code: c.code }))} />
                        </CardHeader>
                        <CardContent className="pt-6">
                            {course.modules.length === 0 ? (
                                <div className="text-center py-12 border-2 border-dashed rounded-xl">
                                    <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                                    <h4 className="font-semibold">Belum Ada Materi</h4>
                                    <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                                        Anda belum menambahkan struktur minggu/topik pada mata kuliah ini.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {course.modules.map((module: any) => (
                                        <div key={module.id} className="group flex gap-4 p-4 border rounded-xl hover:border-primary/20 transition-all bg-card shadow-sm hover:shadow-md">
                                            <div className="flex-none flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg min-w-[100px] border">
                                                <Calendar className="w-5 h-5 text-muted-foreground mb-1" />
                                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Minggu</span>
                                                <span className="text-2xl font-bold">{module.weekNumber}</span>
                                            </div>
                                            <div className="flex-grow flex flex-col justify-center">
                                                <div className="flex justify-between items-start">
                                                    <h3 className="font-bold text-lg">{module.title}</h3>
                                                    {module.clo && (
                                                        <Badge variant="secondary">
                                                            {module.clo.code}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                                    {module.content || "Tidak ada rincian materi."}
                                                </p>
                                            </div>
                                            <div className="flex-none flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                {/* In a real app we'd use a form/action to delete or edit */}
                                                <form action={async () => { 'use server' }}>
                                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </form>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Daftar Mahasiswa */}
                    <Card>
                        <CardHeader className="flex flex-row justify-between items-center bg-muted/30 border-b">
                            <div>
                                <CardTitle>Daftar Mahasiswa Terdaftar</CardTitle>
                                <CardDescription>Daftar peserta didik yang tergabung di kelas ini.</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {course.enrollments && course.enrollments.length === 0 ? (
                                <div className="text-center py-12 border-2 border-dashed rounded-xl">
                                    <Users className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                                    <h4 className="font-semibold">Belum Ada Peserta</h4>
                                    <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                                        Saat ini tidak ada mahasiswa yang mengambil mata kuliah ini.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {course.enrollments?.map((enr: any) => (
                                        <div key={enr.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                            <div className="flex gap-3 items-center">
                                                <div className="bg-primary/10 p-2 rounded-full hidden sm:block">
                                                    <Users className="w-4 h-4 text-primary" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-sm">{enr.student.name}</span>
                                                    <span className="text-xs text-muted-foreground">{enr.student.email}</span>
                                                </div>
                                            </div>
                                            <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-none">
                                                Aktif
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Configuration Panel */}
                <div className="md:col-span-1 lg:col-span-1 space-y-6">
                    <Card className="bg-muted/30">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">Status Fitur LMS</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {course.config ? (
                                <>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">SRL Modul</span>
                                        <Badge variant={course.config.isSrlEnabled ? "default" : "secondary"}>
                                            {course.config.isSrlEnabled ? "ON" : "OFF"}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">Gamifikasi</span>
                                        <Badge variant={course.config.isGamificationEnabled ? "default" : "secondary"}>
                                            {course.config.isGamificationEnabled ? "ON" : "OFF"}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">Aktivasi Forum</span>
                                        <Badge variant={course.config.isForumEnabled ? "default" : "secondary"}>
                                            {course.config.isForumEnabled ? "ON" : "OFF"}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">Jurnal Refleksi</span>
                                        <Badge variant={course.config.isReflectionsEnabled ? "default" : "secondary"}>
                                            {course.config.isReflectionsEnabled ? "ON" : "OFF"}
                                        </Badge>
                                    </div>
                                </>
                            ) : (
                                <p className="text-xs text-muted-foreground">Config tidak tersedia (Kelas lama).</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">Statistik Kelas</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <div className="text-3xl font-bold">{course._count.enrollments}</div>
                                <div className="text-xs text-muted-foreground mt-1">Mahasiswa Aktif</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold">{course.clos.length}</div>
                                <div className="text-xs text-muted-foreground mt-1">Capaian Pembelajaran (CLO)</div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
