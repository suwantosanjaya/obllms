/* eslint-disable @typescript-eslint/no-explicit-any */
import { getInstructorCourses } from '@/app/actions/courseActions'
import { getSessionUser } from '@/app/actions/userActions'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { BookOpen } from 'lucide-react'

export default async function ManageCoursesPage() {
    const dosenUser = await getSessionUser()
    if (!dosenUser || !dosenUser.roles?.includes('teacher')) {
        redirect('/')
    }
    const coursesResponse = await getInstructorCourses(dosenUser.id, dosenUser.activeDepartmentId)
    const courses = coursesResponse.courses || []

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manajemen Kelas</h1>
                    <p className="text-muted-foreground mt-1">Kelola kelas, struktur materi, dan konfigurasi LMS Anda.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Daftar Kelas Anda</CardTitle>
                    <CardDescription>Semua mata kuliah yang sedang Anda ajar semester ini.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Kode Kelas</TableHead>
                                <TableHead>Nama Mata Kuliah</TableHead>
                                <TableHead>Semester</TableHead>
                                <TableHead>Status Pendaftaran</TableHead>
                                <TableHead>Jadwal</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {courses.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        Belum ada kelas yang dibuat.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                courses.map((course: any) => {
                                    const isClosed = course.config?.enrollmentDeadline && new Date() > new Date(course.config.enrollmentDeadline);
                                    return (
                                        <TableRow key={course.id}>
                                        <TableCell className="font-medium">{course.subject.code}</TableCell>
                                        <TableCell>
                                            <span className="font-semibold block">{course.subject.title}</span>
                                            <span className="text-xs text-muted-foreground block">{course.classCode || 'Kelas Reguler'}</span>
                                            <span className="text-xs text-muted-foreground mt-1 block">{course._count?.enrollments || 0} Mahasiswa Terdaftar</span>
                                        </TableCell>
                                        <TableCell>
                                            {course.semester} {course.academicYear}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-2 items-start">
                                                {course.config?.isPublished ? (
                                                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-green-600 text-white">
                                                        Dipublikasi
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-slate-200 text-slate-700">
                                                        Draft
                                                    </span>
                                                )}
                                                {course.config?.enrollmentDeadline && (
                                                    <span className={`text-[10px] ${isClosed ? 'text-red-700 bg-red-50 border-red-200' : 'text-orange-700 bg-orange-50 border-orange-200'} border px-2 py-0.5 rounded flex flex-col`}>
                                                        <span className="font-semibold">{isClosed ? 'Sudah ditutup:' : 'Akan ditutup:'}</span>
                                                        <span>{new Date(course.config.enrollmentDeadline).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {course.schedule ? (
                                                <span className="text-sm font-medium">{course.schedule}</span>
                                            ) : (
                                                <span className="text-xs text-muted-foreground italic">Menunggu Jadwal dari QA</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/teacher/course/${course.id}`}>
                                                    <BookOpen className="w-4 h-4 mr-2" />
                                                    Kelola
                                                </Link>
                                            </Button>
                                        </TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
