/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { getAssessmentsByInstructor } from '@/app/actions/assessmentActions'
import { getInstructorCourses } from '@/app/actions/courseActions'
import prisma from '@/lib/db'
import { CreateAssessmentDialog } from '@/app/components/dosen/CreateAssessmentDialog'
import { GradeSubmissionDialog } from '@/app/components/dosen/GradeSubmissionDialog'
import { BookOpen } from 'lucide-react'

export default async function DosenAssessmentsPage() {
    const dosenUser = await prisma.user.findFirst({ where: { role: 'dosen' } })

    if (!dosenUser) {
        return <div className="p-8 text-center text-muted-foreground">User dosen tidak ditemukan di database. Pastikan seed database sudah berjalan.</div>
    }

    const coursesRes = await getInstructorCourses(dosenUser.id)
    const assessmentsRes = await getAssessmentsByInstructor(dosenUser.id)

    const courses = coursesRes.success
        ? coursesRes.courses?.map((c: any) => ({ id: c.id, title: `${c.subject.code} - ${c.subject.title} (${c.academicYear})` })) || []
        : []
    const assessments = assessmentsRes.success ? assessmentsRes.assessments || [] : []

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manajemen Tugas</h1>
                    <p className="text-muted-foreground mt-1">Buat tugas baru dan pantau pengumpulan dari mahasiswa.</p>
                </div>
                <CreateAssessmentDialog courses={courses} />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Daftar Tugas</CardTitle>
                    <CardDescription>Semua tugas yang telah Anda berikan di kelas-kelas Anda.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Judul Tugas</TableHead>
                                <TableHead>Kelas</TableHead>
                                <TableHead>CPMK</TableHead>
                                <TableHead>Tenggat Waktu</TableHead>
                                <TableHead>Pengumpulan</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {assessments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                        <div className="flex flex-col items-center gap-2">
                                            <BookOpen className="h-8 w-8 opacity-40" />
                                            <span>Belum ada tugas yang dibuat.</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                assessments.map((assessment: any) => (
                                    <React.Fragment key={assessment.id}>
                                        <TableRow className="bg-muted/30 hover:bg-muted/40">
                                            <TableCell className="font-medium">
                                                {assessment.title}
                                                {assessment.description && (
                                                    <p className="text-xs text-muted-foreground max-w-[250px] truncate mt-1">
                                                        {assessment.description}
                                                    </p>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {assessment.course.subject.code} - {assessment.course.subject.title}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {assessment.assessmentClos.map((ac: any) => (
                                                        <Badge
                                                            key={ac.cloId}
                                                            variant="outline"
                                                            className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/30"
                                                        >
                                                            {ac.clo.code} ({ac.weight}%)
                                                        </Badge>
                                                    ))}
                                                    {assessment.assessmentClos.length === 0 && (
                                                        <span className="text-xs text-muted-foreground">—</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className={new Date(assessment.dueDate) < new Date() ? 'text-red-500 font-medium' : ''}>
                                                    {new Date(assessment.dueDate).toLocaleString('id-ID', {
                                                        dateStyle: 'medium',
                                                        timeStyle: 'short'
                                                    })}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {assessment._count?.submissions || 0} Pengumpulan
                                            </TableCell>
                                        </TableRow>

                                        {/* Nested Submissions List */}
                                        {assessment.submissions && assessment.submissions.length > 0 && (
                                            <TableRow>
                                                <TableCell colSpan={5} className="p-0 border-b">
                                                    <div className="bg-muted/20 p-4 pl-12 border-l-4 border-l-primary">
                                                        <h4 className="text-sm font-semibold mb-2 text-foreground">Daftar Pengumpulan Mahasiswa:</h4>
                                                        <div className="space-y-2">
                                                            {assessment.submissions.map((sub: any) => (
                                                                <div key={sub.id} className="flex items-center justify-between bg-card p-3 rounded border border-border text-sm">
                                                                    <div className="flex flex-col gap-1">
                                                                        <span className="font-medium">{sub.student.name}</span>
                                                                        <a href={sub.content ?? '#'} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs">
                                                                            Lihat File
                                                                        </a>
                                                                    </div>

                                                                    {/* Per-CLO score breakdown */}
                                                                    {sub.cloScores && sub.cloScores.length > 0 && (
                                                                        <div className="flex flex-wrap gap-1 max-w-[300px]">
                                                                            {sub.cloScores.map((cs: any) => (
                                                                                <Badge
                                                                                    key={cs.cloId}
                                                                                    variant="outline"
                                                                                    className="text-xs bg-green-500/10 text-green-400 border-green-500/30"
                                                                                >
                                                                                    {cs.clo.code}: {cs.score}
                                                                                </Badge>
                                                                            ))}
                                                                        </div>
                                                                    )}

                                                                    <div className="flex items-center gap-4">
                                                                        <span className="text-muted-foreground text-xs">
                                                                            {new Date(sub.submittedAt).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                                                                        </span>
                                                                        {sub.score !== null && sub.score !== undefined ? (
                                                                            <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">
                                                                                Nilai: {sub.score}
                                                                            </Badge>
                                                                        ) : (
                                                                            <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-100">
                                                                                Belum Dinilai
                                                                            </Badge>
                                                                        )}
                                                                        <GradeSubmissionDialog
                                                                            submissionId={sub.id}
                                                                            studentName={sub.student.name}
                                                                            currentScore={sub.score}
                                                                            currentFeedback={sub.feedback}
                                                                            assessmentClos={assessment.assessmentClos}
                                                                            existingCloScores={sub.cloScores}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </React.Fragment>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
