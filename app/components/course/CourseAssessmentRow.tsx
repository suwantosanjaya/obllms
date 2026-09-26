'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { TableCell, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EditAssessmentDialog } from '@/app/components/dosen/EditAssessmentDialog'
import { GradeSubmissionDialog } from '@/app/components/dosen/GradeSubmissionDialog'
import { TogglePublishAssessmentButton } from '@/app/components/dosen/TogglePublishAssessmentButton'
import { DeleteAssessmentButton } from '@/app/components/dosen/DeleteAssessmentButton'
import { Settings, FileText, CheckCircle2, AlertCircle } from 'lucide-react'
import { getLateDuration, formatDateTime } from '@/lib/utils'
import 'suneditor/dist/css/suneditor.min.css'

const isValidUrl = (string: string) => {
    try {
        new URL(string);
        return true;
    } catch {
        return false;
    }
}

export function CourseAssessmentRow({
    assessment,
    courseId,
    courses
}: {
    assessment: any,
    courseId: string,
    courses: any[]
}) {
    const [isSheetOpen, setIsSheetOpen] = useState(false)
    const [activeTab, setActiveTab] = useState("detail")
    const hasSubmissions = assessment.submissions && assessment.submissions.length > 0;

    return (
        <React.Fragment>
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
                    {assessment.dueDate ? (
                        <span className={new Date(assessment.dueDate) < new Date() ? 'text-red-600 font-medium text-xs' : 'text-xs'}>
                            {formatDateTime(assessment.dueDate, {
                                dateStyle: 'medium',
                                timeStyle: 'short'
                            })}
                        </span>
                    ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                    )}
                </TableCell>
                <TableCell className="text-sm">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-2"
                        onClick={() => {
                            setActiveTab("pengumpulan")
                            setIsSheetOpen(true)
                        }}
                    >
                        <Badge variant="secondary" className="px-1.5 min-w-[20px] justify-center">{assessment._count?.submissions || 0}</Badge>
                        Terkumpul
                    </Button>
                </TableCell>
                <TableCell className="pr-6 text-right">
                    <div className="flex justify-end gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            title="Lihat Detail"
                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                            onClick={() => {
                                setActiveTab("detail")
                                setIsSheetOpen(true)
                            }}
                        >
                            <FileText className="h-4 w-4" />
                        </Button>

                        {assessment.format === 'quiz' && (
                            <Link href={`/teacher/course/${courseId}/assessment/${assessment.id}/builder`}>
                                <Button variant="ghost" size="icon" title="Pengaturan Soal Kuis" className="h-8 w-8 text-orange-600 hover:text-orange-700 hover:bg-orange-100">
                                    <Settings className="h-4 w-4" />
                                </Button>
                            </Link>
                        )}
                        <EditAssessmentDialog
                            courses={courses}
                            assessment={assessment}
                            hasGradedSubmissions={assessment.submissions?.some((s: any) => s.score !== null)}
                        />
                        <DeleteAssessmentButton assessmentId={assessment.id} assessmentTitle={assessment.title} isPublished={assessment.isPublished} />
                    </div>
                </TableCell>
            </TableRow>

            {/* Assessment Detail Sheet */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="w-[95vw] sm:max-w-4xl overflow-y-auto p-0" side="right">
                    <SheetHeader className="mb-6 pb-6 border-b p-6">
                        <div className="flex items-start justify-between gap-4 pr-6">
                            <div>
                                <SheetTitle className="text-xl font-bold">{assessment.title}</SheetTitle>
                                <SheetDescription className="mt-2 text-foreground/80 flex items-center gap-2">
                                    <Badge variant="secondary">{assessment.type}</Badge>
                                    <span className="text-xs text-muted-foreground">Tenggat: {assessment.dueDate ? formatDateTime(assessment.dueDate, { dateStyle: 'long', timeStyle: 'short' }) : 'Tidak ada'}</span>
                                </SheetDescription>
                            </div>
                        </div>
                    </SheetHeader>

                    <div className="px-6 pb-6">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-6">
                                <TabsTrigger value="detail">Detail Penugasan</TabsTrigger>
                                <TabsTrigger value="pengumpulan" className="flex items-center gap-2">
                                    Lembar Pengumpulan
                                    {hasSubmissions && (
                                        <Badge variant="secondary" className="px-1 text-[10px]">{assessment.submissions.length}</Badge>
                                    )}
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="detail" className="space-y-6">
                                {/* CLO Mapping */}
                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Pemetaan Capaian Pembelajaran (CLO)</h4>
                                    {assessment.assessmentClos.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {assessment.assessmentClos.map((ac: any) => (
                                                <Badge key={ac.cloId} variant="outline" className="bg-blue-50/50 text-blue-700 border-blue-200 py-1.5 px-3">
                                                    <span className="font-bold mr-1">{ac.clo.code}</span>
                                                    <span className="text-muted-foreground mr-2">Bobot: {ac.weight}%</span>
                                                    <span className="text-xs truncate max-w-[200px]" title={ac.clo.description}>{ac.clo.description}</span>
                                                </Badge>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground italic">Belum ada pemetaan CLO.</p>
                                    )}
                                </div>

                                {/* Description */}
                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Deskripsi Penugasan</h4>
                                    {assessment.description ? (
                                        <div
                                            className="sun-editor-editable !bg-muted/20 !border-0 !p-4 rounded-lg text-sm dark:text-slate-200"
                                            dangerouslySetInnerHTML={{ __html: assessment.description }}
                                        />
                                    ) : (
                                        <p className="text-sm text-muted-foreground italic">Tidak ada deskripsi yang ditambahkan.</p>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="pengumpulan" className="space-y-4">
                                {!hasSubmissions ? (
                                    <div className="text-center py-12 border rounded-lg bg-muted/10">
                                        <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
                                        <h3 className="text-sm font-medium">Belum Ada Pengumpulan</h3>
                                        <p className="text-xs text-muted-foreground mt-1">Belum ada mahasiswa yang mengumpulkan tugas ini.</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-3">
                                        {assessment.submissions.map((sub: any) => (
                                            <div key={sub.id} className="flex flex-col sm:flex-row sm:items-start justify-between bg-card p-4 rounded-xl border shadow-sm gap-4 transition-all hover:border-primary/30">
                                                <div className="flex flex-col gap-2 min-w-50 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-primary">{sub.student.name}</span>
                                                        {assessment.dueDate && new Date(sub.submittedAt) > new Date(assessment.dueDate) ? (
                                                            <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4">
                                                                Terlambat {getLateDuration(sub.submittedAt, assessment.dueDate)}
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-green-200 text-green-700 bg-green-50">
                                                                Tepat Waktu
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        Dikumpulkan: {formatDateTime(sub.submittedAt, { dateStyle: 'medium', timeStyle: 'short' })}
                                                    </div>

                                                    {/* Content / Attachments */}
                                                    <div className="mt-2 bg-muted/30 rounded-md p-3">
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
                                                                    <button type="button" className="text-primary hover:underline text-xs flex items-center gap-1 font-medium">
                                                                        Lihat Detail Jawaban CBT ↗
                                                                    </button>
                                                                }
                                                            />
                                                        ) : sub.content === 'Otomatis dikonversi dari Poin Papan Peringkat Gamifikasi' ? (
                                                            <span className="text-purple-600 text-xs italic flex items-center gap-1">
                                                                ★ Dikonversi otomatis dari Papan Peringkat Gamifikasi
                                                            </span>
                                                        ) : (sub.attachments && sub.attachments.length > 0) ? (
                                                            <div className="flex flex-col gap-2">
                                                                <span className="text-xs font-semibold text-muted-foreground">Lampiran File:</span>
                                                                {sub.attachments.map((url: string, i: number) => (
                                                                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                                                                        Berkas {i + 1} ↗
                                                                    </a>
                                                                ))}
                                                            </div>
                                                        ) : sub.content ? (
                                                            isValidUrl(sub.content) ? (
                                                                <a href={sub.content} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs flex items-center gap-1">
                                                                    Buka Link Jawaban ↗
                                                                </a>
                                                            ) : (
                                                                <Dialog>
                                                                    <DialogTrigger asChild>
                                                                        <button type="button" className="text-primary hover:underline text-xs flex items-center gap-1 font-medium">
                                                                            Baca Teks Jawaban ↗
                                                                        </button>
                                                                    </DialogTrigger>
                                                                    <DialogContent className="sm:max-w-2xl">
                                                                        <DialogHeader>
                                                                            <DialogTitle>Jawaban: {sub.student.name}</DialogTitle>
                                                                        </DialogHeader>
                                                                        <div className="bg-muted/30 p-4 rounded-md border text-sm whitespace-pre-wrap mt-2 max-h-[70vh] overflow-y-auto">
                                                                            {sub.content}
                                                                        </div>
                                                                    </DialogContent>
                                                                </Dialog>
                                                            )
                                                        ) : (
                                                            <span className="text-muted-foreground text-xs italic">
                                                                Tidak ada lampiran atau teks jawaban.
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-4 sm:items-end w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-border/50">
                                                    {/* Penilaian Section */}
                                                    <div className="flex items-center sm:items-end gap-3 justify-between sm:justify-start w-full">
                                                        {sub.score !== null && sub.score !== undefined ? (
                                                            <div className="flex items-center gap-2">
                                                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                                                                <div className="flex flex-col items-end">
                                                                    <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Nilai Akhir</span>
                                                                    <span className="font-bold text-xl text-primary leading-none">{Math.round(sub.score * 100) / 100}</span>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                                                Menunggu Penilaian
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

                                                    {/* Per-CLO Score Breakdown */}
                                                    {sub.cloScores && sub.cloScores.length > 0 && (
                                                        <div className="flex flex-wrap gap-1.5 sm:justify-end">
                                                            {sub.cloScores.map((cs: any) => (
                                                                <Badge key={cs.cloId} variant="outline" className="bg-green-50 text-green-700 border-green-200 flex gap-1">
                                                                    <span className="font-medium uppercase">{cs.clo.code}:</span>
                                                                    <span className="font-bold">{Math.round(cs.score * 100) / 100}</span>
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </div>
                </SheetContent>
            </Sheet>
        </React.Fragment>
    )
}
