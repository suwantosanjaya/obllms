/* eslint-disable @typescript-eslint/no-explicit-any */
import { getInstructorCourses } from '@/app/actions/courseActions'
import prisma from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CreateCourseDialog } from '@/app/components/dosen/CreateCourseDialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { BookOpen } from 'lucide-react'

export default async function ManageCoursesPage() {
    const dosenUser = await prisma.user.findFirst({ where: { role: 'dosen' } })
    const coursesResponse = dosenUser ? await getInstructorCourses(dosenUser.id) : { courses: [] }
    const courses = coursesResponse.courses || []

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manajemen Kelas</h1>
                    <p className="text-muted-foreground mt-1">Kelola kelas, struktur materi, dan konfigurasi LMS Anda.</p>
                </div>
                <CreateCourseDialog />
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
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {courses.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        Belum ada kelas yang dibuat.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                courses.map((course: any) => (
                                    <TableRow key={course.id}>
                                        <TableCell className="font-medium">{course.subject.code}</TableCell>
                                        <TableCell>
                                            <span className="font-semibold block">{course.subject.title}</span>
                                            <span className="text-xs text-muted-foreground">{course._count?.enrollments || 0} Mahasiswa Terdaftar</span>
                                        </TableCell>
                                        <TableCell>
                                            {course.semester} {course.academicYear}
                                        </TableCell>
                                        <TableCell>
                                            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80">
                                                Aktif
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/dosen/course/${course.id}`}>
                                                    <BookOpen className="w-4 h-4 mr-2" />
                                                    Kelola
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
