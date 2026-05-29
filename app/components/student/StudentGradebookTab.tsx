import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getCourseGradebookData } from '@/app/actions/assessmentActions'
import { Badge } from '@/components/ui/badge'
import { calculateStudentOBEGrade } from '@/app/utils/obeCalculator'

export async function StudentGradebookTab({ courseId, studentId }: { courseId: string, studentId: string }) {
    const dataRes = await getCourseGradebookData(courseId)
    if (!dataRes.success || !dataRes.course) {
        return <div className="p-4 text-red-500">Gagal memuat data rekapitulasi.</div>
    }

    const { course, submissions, subjectClos } = dataRes
    const assessments = course.assessments || []

    // Map CLOs associated with the subject
    const uniqueCLOs = new Map()
    subjectClos?.forEach((sc: any) => {
        if (!uniqueCLOs.has(sc.clo.id)) {
            uniqueCLOs.set(sc.clo.id, sc.clo)
        }
    })
    const clos = Array.from(uniqueCLOs.values())

    const obeResult = calculateStudentOBEGrade(studentId, assessments, submissions, subjectClos)

    // Calculate student's average score per CLO
    const studentCloAverages = clos.map((clo: any) => {
        const cloData = obeResult.cloResults.get(clo.id)
        return {
            cloId: clo.id,
            code: clo.code,
            description: clo.description,
            avg: cloData && cloData.mastery !== null ? cloData.mastery.toFixed(1) : null
        }
    })

    let gradedCount = 0
    assessments.forEach((a: any) => {
        const sub = submissions?.find((s: any) => s.studentId === studentId && s.assessmentId === a.id)
        if (sub?.score !== null && sub?.score !== undefined) {
            gradedCount++
        }
    })
    
    const finalAverage = obeResult.finalGrade !== null ? obeResult.finalGrade.toFixed(1) : null

    return (
        <div className="space-y-6">
            <Card className="border-primary/20 shadow-sm">
                <CardHeader className="border-b pb-4">
                    <CardTitle className="text-primary">Rekapitulasi Nilai & Capaian Pembelajaran</CardTitle>
                    <CardDescription>Pantau nilai tugas dan tingkat penguasaan CLO (Course Learning Outcome) Anda.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Summary Box */}
                        <div className="md:w-1/3 flex flex-col gap-4">
                            <div className="bg-card border rounded-xl p-6 text-center shadow-sm">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-2">Rata-Rata Nilai Tugas</h3>
                                <div className="text-5xl font-black text-primary">
                                    {finalAverage !== null ? finalAverage : '-'}
                                </div>
                                <p className="text-xs text-muted-foreground mt-4">
                                    Dari {gradedCount} tugas yang telah dinilai.
                                    {obeResult.hasCurriculumWeights && <span className="block mt-1 text-[10px] text-green-600 bg-green-50 p-1 rounded">Dihitung dengan Proporsi OBE</span>}
                                </p>
                            </div>

                            <div className="bg-card border rounded-xl p-4 shadow-sm">
                                <h3 className="text-sm font-semibold mb-3">Daftar Nilai Tugas</h3>
                                <div className="space-y-2">
                                    {assessments.length === 0 ? (
                                        <p className="text-xs text-muted-foreground italic">Belum ada tugas.</p>
                                    ) : (
                                        assessments.map((a: any) => {
                                            const sub = submissions?.find((s: any) => s.studentId === studentId && s.assessmentId === a.id)
                                            return (
                                                <div key={a.id} className="flex justify-between items-center text-sm border-b pb-2 last:border-0 last:pb-0">
                                                    <span className="text-muted-foreground truncate pr-2" title={a.title}>{a.title}</span>
                                                    {sub?.score !== null && sub?.score !== undefined ? (
                                                        <span className="font-bold text-primary">{sub.score}</span>
                                                    ) : sub ? (
                                                        <Badge variant="outline" className="text-[10px] text-orange-500 border-orange-200 px-1 py-0 h-4">Menunggu</Badge>
                                                    ) : (
                                                        <span className="text-muted-foreground text-xs italic">Belum buat</span>
                                                    )}
                                                </div>
                                            )
                                        })
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* CLO Radar / List */}
                        <div className="md:w-2/3">
                            <h3 className="text-lg font-bold mb-4">Penguasaan CLO (Course Learning Outcome)</h3>
                            <div className="grid gap-4">
                                {studentCloAverages.map((c: any) => {
                                    let bgColor = "bg-muted"
                                    let barColor = "bg-slate-200"
                                    let textColor = "text-muted-foreground"
                                    
                                    const val = c.avg !== null ? parseFloat(c.avg) : 0
                                    
                                    if (c.avg !== null) {
                                        if (val >= 80) {
                                            bgColor = "bg-green-50 border-green-200"
                                            barColor = "bg-green-500"
                                            textColor = "text-green-700"
                                        } else if (val >= 60) {
                                            bgColor = "bg-orange-50 border-orange-200"
                                            barColor = "bg-orange-500"
                                            textColor = "text-orange-700"
                                        } else {
                                            bgColor = "bg-red-50 border-red-200"
                                            barColor = "bg-red-500"
                                            textColor = "text-red-700"
                                        }
                                    }

                                    return (
                                        <div key={c.cloId} className={`p-4 rounded-xl border ${bgColor} flex flex-col gap-2 transition-colors`}>
                                            <div className="flex justify-between items-start gap-4">
                                                <div>
                                                    <Badge variant="outline" className={`font-mono bg-white ${textColor} border-current`}>
                                                        {c.code}
                                                    </Badge>
                                                    <p className="text-sm font-medium mt-2">{c.description}</p>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Capaian</span>
                                                    <span className={`text-2xl font-black ${textColor}`}>
                                                        {c.avg !== null ? c.avg : '-'}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            {/* Progress Bar */}
                                            <div className="w-full bg-black/5 rounded-full h-2.5 mt-2">
                                                <div 
                                                    className={`${barColor} h-2.5 rounded-full transition-all duration-1000`} 
                                                    style={{ width: `${val}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
