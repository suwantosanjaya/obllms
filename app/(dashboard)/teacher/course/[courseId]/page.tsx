import { getCourseDetails } from '@/app/actions/courseActions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, AlertCircle, Trash2, Calendar, Users } from 'lucide-react'
import { CreateModuleDialog } from '@/app/components/dosen/CreateModuleDialog'
import { EditModuleDialog } from '@/app/components/dosen/EditModuleDialog'
import { CourseSettingsDialog } from '@/app/components/dosen/CourseSettingsDialog'
import { DeleteModuleButton } from '@/app/components/dosen/DeleteModuleButton'
import { Button } from '@/components/ui/button'
import { TeacherStudentManagementDialog } from '@/app/components/teacher/TeacherStudentManagementDialog'
import { RemoveStudentButton } from '@/app/components/teacher/RemoveStudentButton'
import { redirect } from 'next/navigation'
import { TabsContent } from "@/components/ui/tabs"
import { ForumTab } from '@/app/components/course/ForumTab'
import { SclSkillAssessmentDialog } from '@/app/components/dosen/SclSkillAssessmentDialog'
import { LeaderboardTab } from '@/app/components/course/LeaderboardTab'
import { ReflectionReviewTab } from '@/app/components/teacher/ReflectionReviewTab'
import { CourseTabsWrapper } from '@/app/components/course/CourseTabsWrapper'
import { CourseAssessmentsTab } from '@/app/components/course/CourseAssessmentsTab'
import { CourseGradebookTab } from '@/app/components/course/CourseGradebookTab'

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
    const isClosed = course.config?.enrollmentDeadline && new Date() > new Date(course.config.enrollmentDeadline);

    // Count only CLOs matching the course's curriculum year
    const cloCount = course.curriculumYearId
        ? (course.subject?.subjectClos?.filter((sc: any) => sc.clo?.curriculumYearId === course.curriculumYearId) ?? []).length
        : (course.subject?.subjectClos?.length ?? 0)

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div>
                    <div className="flex items-center gap-3 flex-wrap">
                        <Badge variant="outline" className="text-sm">
                            {course.subject.code}
                        </Badge>
                        <Badge variant="secondary" className="text-sm">
                            {course.semester} {course.academicYear}
                        </Badge>
                        {course.config?.isPublished ? (
                            <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-sm">Dipublikasi</Badge>
                        ) : (
                            <Badge variant="secondary" className="bg-slate-200 text-slate-700 hover:bg-slate-300 text-sm">Draft</Badge>
                        )}
                        {course.config?.enrollmentDeadline && (
                            <Badge variant="outline" className={`text-sm ${isClosed ? 'border-red-200 bg-red-50 text-red-700' : 'border-orange-200 bg-orange-50 text-orange-700'}`}>
                                {isClosed ? 'Sudah ditutup:' : 'Akan ditutup:'} {new Date(course.config.enrollmentDeadline).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </Badge>
                        )}
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight mt-3">{course.subject.title}</h1>
                    <p className="text-muted-foreground mt-2 max-w-3xl">{course.subject.description}</p>
                </div>
                <div className="flex gap-2">
                    <CourseSettingsDialog courseId={course.id} config={course.config} />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-4 lg:grid-cols-5">
                {/* Main Content Area */}
                <div className="md:col-span-3 lg:col-span-4 space-y-6">
                    <CourseTabsWrapper 
                        isForumEnabled={course.config?.isForumEnabled}
                        isReflectionsEnabled={course.config?.isReflectionsEnabled}
                        isGamificationEnabled={course.config?.isGamificationEnabled}
                    >
                        <TabsContent value="materi" className="mt-0">
                            <Card>
                        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/30 border-b">
                            <div>
                                <CardTitle>Materi & Aktivitas Mingguan</CardTitle>
                                <CardDescription>Kelola struktur pembelajaran dan pemetaan CLO (Capaian Pembelajaran).</CardDescription>
                            </div>
                            <CreateModuleDialog courseId={course.id} clos={(course.curriculumYearId
                                ? course.subject?.subjectClos?.filter((sc: any) => sc.clo?.curriculumYearId === course.curriculumYearId)
                                : course.subject?.subjectClos ?? []
                            )?.map((sc: any) => ({ id: sc.clo.id, code: sc.clo.code, description: sc.clo.description ?? '' })) ?? []} />
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
                                        <div key={module.id} className="group flex flex-col sm:flex-row gap-4 p-4 border rounded-xl hover:border-primary/20 transition-all bg-card shadow-sm hover:shadow-md">
                                            <div className="flex-none flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg sm:min-w-[100px] border">
                                                <Calendar className="w-5 h-5 text-muted-foreground mb-1 hidden sm:block" />
                                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Minggu</span>
                                                <span className="text-2xl font-bold">{module.weekNumber}</span>
                                            </div>
                                            <div className="flex-grow flex flex-col justify-center min-w-0">
                                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                                    <h3 className="font-bold text-lg leading-tight break-words">{module.title}</h3>
                                                    <div className="flex flex-wrap gap-1 justify-end">
                                                        {module.moduleClos && module.moduleClos.length > 0
                                                            ? module.moduleClos.map((mc: any) => (
                                                                <Badge key={mc.id} variant="secondary">{mc.clo.code}</Badge>
                                                            ))
                                                            : module.clo && (
                                                                <Badge variant="secondary">{module.clo.code}</Badge>
                                                            )
                                                        }
                                                    </div>
                                                </div>
                                                {module.content ? (
                                                    <div className="prose prose-sm max-w-none text-muted-foreground mt-2 break-words" dangerouslySetInnerHTML={{ __html: module.content }} />
                                                ) : (
                                                    <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap break-words">
                                                        Tidak ada rincian materi.
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex-none flex sm:flex-col items-center justify-end gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-border">
                                                <EditModuleDialog 
                                                    courseId={course.id} 
                                                    module={module} 
                                                    clos={(course.curriculumYearId
                                                        ? course.subject?.subjectClos?.filter((sc: any) => sc.clo?.curriculumYearId === course.curriculumYearId)
                                                        : course.subject?.subjectClos ?? []
                                                    )?.map((sc: any) => ({ id: sc.clo.id, code: sc.clo.code, description: sc.clo.description ?? '' })) ?? []}
                                                />
                                                <DeleteModuleButton 
                                                    moduleId={module.id} 
                                                    courseId={course.id} 
                                                    moduleTitle={module.title} 
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Daftar Mahasiswa */}
                    <Card>
                        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/30 border-b">
                            <div>
                                <CardTitle>Daftar Mahasiswa Terdaftar</CardTitle>
                                <CardDescription>Daftar peserta didik yang tergabung di kelas ini.</CardDescription>
                            </div>
                            <TeacherStudentManagementDialog courseId={course.id} departmentId={course.departmentId || course.subject?.departmentId || ''} />
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
                                                    {enr.student.studentProfile?.nim && (
                                                        <span className="text-xs font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded mt-0.5 w-fit">
                                                            NIM: {enr.student.studentProfile.nim}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {enr.student.isActive ? (
                                                    <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-none">
                                                        Aktif
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="bg-red-100 text-red-600 hover:bg-red-100 border-none">
                                                        Nonaktif
                                                    </Badge>
                                                )}
                                                <SclSkillAssessmentDialog 
                                                    enrollmentId={enr.id}
                                                    studentName={enr.student.name}
                                                    initialData={enr.skillAssessment}
                                                    enabledSkills={{
                                                        entrepreneurship: course.subject?.isEntrepreneurshipEnabled ?? true,
                                                        leadership: course.subject?.isLeadershipEnabled ?? true,
                                                        industryKnowledge: course.subject?.isIndustrySkillEnabled ?? true,
                                                        employabilitySkill: course.subject?.isEmployabilitySkillEnabled ?? true,
                                                    }}
                                                />
                                                <RemoveStudentButton studentId={enr.studentId} courseId={course.id} studentName={enr.student.name} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="tugas" className="mt-0">
                    <CourseAssessmentsTab courseId={course.id} />
                </TabsContent>

                <TabsContent value="rekap" className="mt-0">
                    <CourseGradebookTab courseId={course.id} />
                </TabsContent>

                {course.config?.isForumEnabled && (
                    <TabsContent value="forum" className="mt-0">
                        <ForumTab courseId={course.id} isStudent={false} />
                    </TabsContent>
                )}

                {course.config?.isReflectionsEnabled && (
                    <TabsContent value="refleksi" className="mt-0">
                        <ReflectionReviewTab courseId={course.id} />
                    </TabsContent>
                )}

                {course.config?.isGamificationEnabled && (
                    <TabsContent value="leaderboard" className="mt-0">
                        <LeaderboardTab courseId={course.id} />
                    </TabsContent>
                )}
            </CourseTabsWrapper>
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
                                        <span className="text-muted-foreground">Jurnal SRL & Refleksi</span>
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
                                <div className="text-3xl font-bold">{cloCount}</div>
                                <div className="text-xs text-muted-foreground mt-1">Capaian Pembelajaran (CLO)</div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
