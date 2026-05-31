import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { getAssessmentsForCourse } from '@/app/actions/assessmentActions'
import { CreateAssessmentDialog } from '@/app/components/dosen/CreateAssessmentDialog'
import { EditAssessmentDialog } from '@/app/components/dosen/EditAssessmentDialog'
import { GradeSubmissionDialog } from '@/app/components/dosen/GradeSubmissionDialog'
import { TogglePublishAssessmentButton } from '@/app/components/dosen/TogglePublishAssessmentButton'
import { DeleteAssessmentButton } from '@/app/components/dosen/DeleteAssessmentButton'
import { BookOpen, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import prisma from '@/lib/db'

const isValidUrl = (string: string) => {
    try {
        new URL(string);
        return true;
    } catch (_) {
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
                            assessments.map((assessment: any) => (
                                <React.Fragment key={assessment.id}>
                                    <TableRow className="bg-background hover:bg-muted/20">
                                        <TableCell className="font-medium pl-6">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span>{assessment.title}</span>
                                                <Badge variant="secondary" className="text-[10px] font-normal h-5">{assessment.type}</Badge>
                                                {assessment.format === 'quiz' ? (
                                                    <Badge variant="outline" className="text-[10px] font-normal h-5 bg-blue-50 text-blue-700 border-blue-200">Kuis Interaktif</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-[10px] font-normal h-5">Unggah File</Badge>
                                                )}
                                            </div>
                                            {assessment.description && (
                                                <p className="text-xs text-muted-foreground max-w-[250px] truncate">
                                                    {assessment.description}
                                                </p>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1.5">
                                                {assessment.assessmentClos.map((ac: any) => (
                                                    <Badge
                                                        key={ac.cloId}
                                                        variant="outline"
                                                        className="text-[10px] bg-blue-500/10 text-blue-600 border-blue-500/30 font-medium"
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
                                            <TogglePublishAssessmentButton assessmentId={assessment.id} initialStatus={assessment.isPublished} />
                                        </TableCell>
                                        <TableCell>
                                            <span className={new Date(assessment.dueDate) < new Date() ? 'text-red-600 font-medium text-xs' : 'text-xs'}>
                                                {new Date(assessment.dueDate).toLocaleString('id-ID', {
                                                    dateStyle: 'medium',
                                                    timeStyle: 'short'
                                                })}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            <Badge variant="secondary" className="font-semibold">
                                                {assessment._count?.submissions || 0} Terkumpul
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="pr-6 text-right">
                                            <div className="flex justify-end gap-1">
                                                {assessment.format === 'quiz' && (
                                                    <Link href={`/teacher/course/${courseId}/assessment/${assessment.id}/builder`}>
                                                        <Button variant="ghost" size="icon" title="Pengaturan Soal Kuis" className="h-8 w-8 text-orange-600 hover:text-orange-700 hover:bg-orange-100">
                                                            <Settings className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                )}
                                                <EditAssessmentDialog 
                                                    courses={[{ id: courseId, subjectId: assessments[0]?.course?.subjectId || '', title: 'Current Course', curriculumYearId: assessments[0]?.course?.curriculumYearId }]} 
                                                    assessment={assessment} 
                                                    hasGradedSubmissions={assessment.submissions?.some((s: any) => s.score !== null)}
                                                />
                                                <DeleteAssessmentButton assessmentId={assessment.id} assessmentTitle={assessment.title} isPublished={assessment.isPublished} />
                                            </div>
                                        </TableCell>
                                    </TableRow>

                                    {/* Nested Submissions List */}
                                    {assessment.submissions && assessment.submissions.length > 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="p-0 border-b">
                                                <div className="bg-muted/10 px-6 py-4 border-l-4 border-l-primary/50">
                                                    <h4 className="text-xs font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Lembar Pengumpulan Mahasiswa</h4>
                                                    <div className="grid gap-2">
                                                        {assessment.submissions.map((sub: any) => (
                                                            <div key={sub.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-background p-3 rounded-lg border shadow-sm text-sm gap-4">
                                                                <div className="flex flex-col gap-1 min-w-[200px]">
                                                                    <span className="font-semibold text-primary">{sub.student.name}</span>
                                                                    {assessment.format === 'quiz' ? (
                                                                            <GradeSubmissionDialog
                                                                                submissionId={sub.id}
                                                                                studentName={sub.student.name}
                                                                                currentScore={sub.score}
                                                                                currentFeedback={sub.feedback}
                                                                                assessmentClos={assessment.assessmentClos}
                                                                                existingCloScores={sub.cloScores}
                                                                                format={assessment.format}
                                                                                answers={sub.answers}
                                                                                questions={assessment.questions}
                                                                                triggerButton={
                                                                                    <button type="button" className="text-muted-foreground hover:text-primary hover:underline text-xs flex items-center gap-1 text-left cursor-pointer">
                                                                                        Lihat Hasil Jawaban CBT ↗
                                                                                    </button>
                                                                                }
                                                                            />
                                                                    ) : sub.content === 'Otomatis dikonversi dari Poin Papan Peringkat Gamifikasi' ? (
                                                                        <span className="text-purple-600 text-xs italic flex items-center gap-1">
                                                                            ★ Dikonversi dari Papan Peringkat
                                                                        </span>
                                                                    ) : sub.content ? (
                                                                        isValidUrl(sub.content) ? (
                                                                            <a href={sub.content} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary hover:underline text-xs flex items-center gap-1">
                                                                                Lihat Lampiran Jawaban ↗
                                                                            </a>
                                                                        ) : (
                                                                            <Dialog>
                                                                                <DialogTrigger asChild>
                                                                                    <button type="button" className="text-muted-foreground hover:text-primary hover:underline text-xs flex items-center gap-1 text-left cursor-pointer">
                                                                                        Lihat Teks Jawaban ↗
                                                                                    </button>
                                                                                </DialogTrigger>
                                                                                <DialogContent className="sm:max-w-md">
                                                                                    <DialogHeader>
                                                                                        <DialogTitle>Teks Jawaban Mahasiswa</DialogTitle>
                                                                                        <DialogDescription>
                                                                                            {sub.student.name}
                                                                                        </DialogDescription>
                                                                                    </DialogHeader>
                                                                                    <div className="bg-muted/30 p-4 rounded-md border text-sm whitespace-pre-wrap mt-2 max-h-[60vh] overflow-y-auto">
                                                                                        {sub.content}
                                                                                    </div>
                                                                                </DialogContent>
                                                                            </Dialog>
                                                                        )
                                                                    ) : (
                                                                        <span className="text-muted-foreground text-xs italic flex items-center gap-1">
                                                                            Tidak ada lampiran file/link
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                {/* Per-CLO score breakdown */}
                                                                <div className="flex-1">
                                                                    {sub.cloScores && sub.cloScores.length > 0 ? (
                                                                        <div className="flex flex-wrap gap-2">
                                                                            {sub.cloScores.map((cs: any) => (
                                                                                <div key={cs.cloId} className="flex flex-col items-center bg-green-50 border border-green-100 rounded px-2 py-1">
                                                                                    <span className="text-[10px] text-green-600 font-semibold uppercase">{cs.clo.code}</span>
                                                                                    <span className="text-xs font-bold text-green-700">{Math.round(cs.score * 100) / 100}</span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-xs text-muted-foreground italic">Belum dinilai</span>
                                                                    )}
                                                                </div>

                                                                <div className="flex items-center gap-4 shrink-0">
                                                                    {sub.score !== null && sub.score !== undefined ? (
                                                                        <div className="flex flex-col items-end">
                                                                            <span className="text-[10px] text-muted-foreground uppercase">Nilai Akhir</span>
                                                                            <span className="font-bold text-lg text-primary">{Math.round(sub.score * 100) / 100}</span>
                                                                        </div>
                                                                    ) : (
                                                                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                                                            Perlu Dinilai
                                                                        </Badge>
                                                                    )}
                                                                    {assessment.format !== 'quiz' && (
                                                                        <GradeSubmissionDialog
                                                                            submissionId={sub.id}
                                                                            studentName={sub.student.name}
                                                                            currentScore={sub.score}
                                                                            currentFeedback={sub.feedback}
                                                                            assessmentClos={assessment.assessmentClos}
                                                                            existingCloScores={sub.cloScores}
                                                                            format={assessment.format}
                                                                            answers={sub.answers}
                                                                        />
                                                                    )}
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
    )
}
