import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getCourseGradebookData } from '@/app/actions/assessmentActions'
import { getGradeScales } from '@/app/actions/gradeScaleActions'
import { calculateStudentOBEGrade } from '@/app/utils/obeCalculator'
import { Badge } from '@/components/ui/badge'
import { ExportGradebookExcelButton } from './ExportGradebookExcelButton'

// Map assessment type/technique to a distinct color class
const techniqueColorMap: Record<string, string> = {
    'Partisipasi':      'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    'Observasi':        'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    'Unjuk Kerja':      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    'Portofolio':       'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    'Tes Tertulis':     'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    'Kuis':             'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    'Tugas':            'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
}

function getTechniqueColor(type: string): string {
    return techniqueColorMap[type] ?? 'bg-muted text-muted-foreground'
}

export async function CourseTaskGradebookTab({ courseId }: { courseId: string }) {
    const dataRes = await getCourseGradebookData(courseId)
    if (!dataRes.success || !dataRes.course) {
        return (
            <div className="p-4 text-red-500">
                Gagal memuat data buku nilai.
                {dataRes.error && <div className="text-sm mt-2 text-red-400">Error: {dataRes.error}</div>}
            </div>
        )
    }

    const subject = dataRes.course?.subject
    const universityId = subject?.department?.faculty?.universityId || subject?.faculty?.universityId || null
    const scaleRes = await getGradeScales(universityId)
    const gradeScales = scaleRes.success ? (scaleRes.data ?? []) : []

    const { course, submissions, subjectClos } = dataRes
    const enrollments = course.enrollments || []
    const assessments = course.assessments || []

    // Collect unique techniques used in this course
    const usedTechniques = [...new Set(assessments.map((a: any) => a.type).filter(Boolean))] as string[]

    return (
        <Card className="border-none shadow-none bg-transparent mt-4">
            <CardHeader className="px-0 pt-0">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <CardTitle className="text-xl">Buku Nilai Komponen</CardTitle>
                        <CardDescription>
                            Rincian nilai per tugas/ujian. Setiap kolom menampilkan teknik penilaian dan CLO yang diukur.
                        </CardDescription>
                    </div>
                    <ExportGradebookExcelButton
                        course={course}
                        enrollments={enrollments}
                        assessments={assessments}
                        submissions={submissions}
                        subjectClos={subjectClos}
                        gradeScales={gradeScales}
                    />
                </div>
                {/* Legend: only show techniques actually used */}
                {usedTechniques.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 mt-3 p-3 bg-muted/30 rounded-lg border">
                        <span className="text-xs text-muted-foreground font-medium">Teknik Penilaian:</span>
                        {usedTechniques.map((t) => (
                            <span key={t} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${getTechniqueColor(t)}`}>
                                {t}
                            </span>
                        ))}
                        <span className="text-[10px] text-muted-foreground ml-2 border-l pl-2">
                            <span className="inline-block bg-primary/10 text-primary border border-primary/20 text-[9px] font-bold px-1.5 py-0.5 rounded mr-1">CLO-0XX</span>
                            = Capaian Pembelajaran MK
                        </span>
                    </div>
                )}
            </CardHeader>
            <CardContent className="px-0">
                <div className="rounded-xl border bg-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50 hover:bg-muted/50 align-top">
                                    <TableHead className="w-[260px] whitespace-nowrap border-r font-semibold text-primary align-middle">
                                        Mahasiswa
                                    </TableHead>
                                    <TableHead className="text-center w-[110px] border-r font-semibold text-primary bg-primary/5 align-middle">
                                        Nilai Akhir
                                    </TableHead>
                                    {assessments.map((a: any) => {
                                        const cloCodes: string[] = (a.assessmentClos ?? [])
                                            .map((ac: any) => ac.clo?.code)
                                            .filter(Boolean)
                                        const techniqueColor = getTechniqueColor(a.type)

                                        return (
                                            <TableHead key={a.id} className="text-center min-w-[160px] border-r px-3 py-3">
                                                <div className="flex flex-col gap-1.5 items-center">
                                                    {/* Assessment title */}
                                                    <span
                                                        className="font-semibold text-xs text-foreground truncate max-w-[150px]"
                                                        title={a.title}
                                                    >
                                                        {a.title}
                                                    </span>

                                                    {/* Technique badge */}
                                                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${techniqueColor}`}>
                                                        {a.type || '—'}
                                                    </span>

                                                    {/* CLO badges */}
                                                    {cloCodes.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1 justify-center">
                                                            {cloCodes.map((code: string) => (
                                                                <span
                                                                    key={code}
                                                                    className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20"
                                                                    title="Capaian Pembelajaran Mata Kuliah"
                                                                >
                                                                    {code}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-[9px] text-muted-foreground italic">Belum dipetakan</span>
                                                    )}
                                                </div>
                                            </TableHead>
                                        )
                                    })}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {enrollments.map((enr: any) => {
                                    const obeResult = calculateStudentOBEGrade(enr.studentId, assessments, submissions, subjectClos, gradeScales)

                                    return (
                                        <TableRow key={enr.id} className="hover:bg-muted/30 transition-colors">
                                            <TableCell className="border-r">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-sm">{enr.student.name}</span>
                                                    <span className="text-xs text-muted-foreground">{enr.student.identifier}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center border-r font-black bg-primary/5">
                                                {obeResult.finalGrade !== null ? obeResult.finalGrade.toFixed(2) : '-'}
                                                <div className="mt-1">
                                                    <Badge variant="outline" className="text-[10px] bg-background">
                                                        {obeResult.letterGrade}
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            {assessments.map((a: any) => {
                                                const sub = submissions.find((s: any) => s.assessmentId === a.id && s.studentId === enr.studentId)
                                                return (
                                                    <TableCell key={a.id} className="text-center border-r">
                                                        {sub && sub.score !== null ? (
                                                            <span className="font-semibold text-sm text-green-700 dark:text-green-400">
                                                                {Number(sub.score.toFixed(2))}
                                                            </span>
                                                        ) : sub && sub.content === 'DITOLAK' ? (
                                                            <span className="text-[10px] text-red-500 font-medium bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-full">
                                                                Ditolak
                                                            </span>
                                                        ) : sub && sub.SubmissionHistory && sub.SubmissionHistory.length > 0 ? (
                                                            <span className="text-[10px] text-blue-600 font-medium bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full">
                                                                Direvisi
                                                            </span>
                                                        ) : sub ? (
                                                            <span className="text-[10px] text-yellow-600 font-medium bg-yellow-50 dark:bg-yellow-950/40 px-2 py-0.5 rounded-full">
                                                                Menunggu
                                                            </span>
                                                        ) : (
                                                            <span className="text-muted-foreground">-</span>
                                                        )}
                                                    </TableCell>
                                                )
                                            })}
                                        </TableRow>
                                    )
                                })}
                                {enrollments.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={assessments.length + 2} className="h-24 text-center text-muted-foreground">
                                            Belum ada mahasiswa yang terdaftar.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
