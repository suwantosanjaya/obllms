import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { getAssessmentsForCourse } from '@/app/actions/assessmentActions'
import { CreateAssessmentDialog } from '@/app/components/dosen/CreateAssessmentDialog'
import { BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CourseAssessmentRow } from '@/app/components/course/CourseAssessmentRow'
import prisma from '@/lib/db'
import { getLateDuration, formatDateTime } from '@/lib/utils'

const isValidUrl = (string: string) => {
    try {
        new URL(string);
        return true;
    } catch {
        return false;
    }
}

export async function CourseAssessmentsTab({ courseId }: { courseId: string }) {
    // We need subject details to pass to CreateAssessmentDialog
    const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: { subject: true }
    })

    if (!course) return null

    const assessmentsRes = await getAssessmentsForCourse(courseId)
    const assessments = assessmentsRes.success ? assessmentsRes.assessments || [] : []

    const mockCoursesArray = [{ 
        id: course.id, 
        subjectId: course.subjectId, 
        title: `${course.subject.code} - ${course.subject.title}`,
        curriculumYearId: course.curriculumYearId
    }]

    type AssessmentType = NonNullable<Awaited<ReturnType<typeof getAssessmentsForCourse>>['assessments']>[number]
    type AssessmentCloType = AssessmentType['assessmentClos'][number]
    type SubmissionType = NonNullable<AssessmentType['submissions']>[number]
    type SubmissionCloScoreType = NonNullable<SubmissionType['cloScores']>[number]

    return (
        <Card>
            <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/30 border-b pb-6">
                <div>
                    <CardTitle>Tugas & Ujian</CardTitle>
                    <CardDescription>Berikan tugas atau ujian dan beri nilai berdasarkan CLO (Capaian Pembelajaran).</CardDescription>
                </div>
                <CreateAssessmentDialog courses={mockCoursesArray} />
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/10">
                            <TableHead className="pl-6">Judul Penugasan</TableHead>
                            <TableHead>Pemetaan CLO (Bobot)</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Tenggat Waktu</TableHead>
                            <TableHead>Pengumpulan</TableHead>
                            <TableHead className="pr-6 text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {assessments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                    <div className="flex flex-col items-center gap-3">
                                        <BookOpen className="h-10 w-10 opacity-20" />
                                        <span>Belum ada tugas atau ujian yang dibuat untuk kelas ini.</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            assessments.map((assessment: AssessmentType) => (
                                <CourseAssessmentRow 
                                    key={assessment.id}
                                    assessment={assessment}
                                    courseId={courseId}
                                    courses={mockCoursesArray}
                                />
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
