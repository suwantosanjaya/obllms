import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getCourseGradebookData } from '@/app/actions/assessmentActions'
import { getGradeScales } from '@/app/actions/gradeScaleActions'
import { Badge } from '@/components/ui/badge'
import { calculateStudentOBEGrade } from '@/app/utils/obeCalculator'
import { CheckCircle2, Circle } from 'lucide-react'
import { ExportExcelButton } from './ExportExcelButton'

export async function CourseGradebookTab({ courseId }: { courseId: string }) {
    const dataRes = await getCourseGradebookData(courseId)
    if (!dataRes.success || !dataRes.course) {
        return <div className="p-4 text-red-500">Gagal memuat data rekapitulasi.</div>
    }

    const scaleRes = await getGradeScales()
    const gradeScales = scaleRes.success ? (scaleRes.data ?? []) : []

    const { course, submissions, subjectClos } = dataRes
    const enrollments = course.enrollments || []
    const assessments = course.assessments || []

    // Group assessments by CLO
    const uniqueCLOs = new Map()
    const ploMap = new Map() // ploId -> count or something to track PLOs
    
    subjectClos?.forEach((sc: any) => {
        if (!uniqueCLOs.has(sc.clo.id)) {
            uniqueCLOs.set(sc.clo.id, sc)
        }
        if (sc.ploId && !ploMap.has(sc.ploId)) {
            ploMap.set(sc.ploId, sc.plo)
        }
    })
    
    const clos = Array.from(uniqueCLOs.values())
    const plos = Array.from(ploMap.entries()) // [id, code][]

    const classAverages = {
        clo: new Map<string, { totalPoints: number, totalMastery: number, count: number }>(),
        plo: new Map<string, { totalPoints: number, totalMastery: number, count: number }>(),
    }

    enrollments.forEach((enr: any) => {
        const obeResult = calculateStudentOBEGrade(enr.studentId, assessments, submissions, subjectClos, gradeScales)
        
        obeResult.cloResults.forEach((val, key) => {
            if (!classAverages.clo.has(key)) classAverages.clo.set(key, { totalPoints: 0, totalMastery: 0, count: 0 })
            if (val.mastery !== null) {
                const acc = classAverages.clo.get(key)!
                acc.totalPoints += val.points
                acc.totalMastery += val.mastery
                acc.count += 1
            }
        })

        obeResult.ploResults.forEach((val, key) => {
            if (!classAverages.plo.has(key)) classAverages.plo.set(key, { totalPoints: 0, totalMastery: 0, count: 0 })
            if (val.mastery !== null) {
                const acc = classAverages.plo.get(key)!
                acc.totalPoints += val.points
                acc.totalMastery += val.mastery
                acc.count += 1
            }
        })
    })

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="bg-muted/30 border-b pb-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <CardTitle>Rekapitulasi Nilai & Capaian OBE</CardTitle>
                            <CardDescription className="mt-1">
                                Matriks lengkap nilai mahasiswa per teknik penilaian (tugas/kuis) yang dikelompokkan berdasarkan CLO, beserta akumulasi nilai PLO dan konversi Nilai Huruf Akhir.
                            </CardDescription>
                        </div>
                        <ExportExcelButton 
                            course={course}
                            enrollments={enrollments}
                            clos={clos}
                            plos={plos}
                            assessments={assessments}
                            submissions={submissions}
                            subjectClos={subjectClos}
                            gradeScales={gradeScales}
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                    <Table className="border-collapse">
                        <TableHeader>
                            <TableRow className="bg-muted/20 border-b">
                                <TableHead rowSpan={2} className="w-[50px] text-center border-r font-bold align-middle">No</TableHead>
                                <TableHead rowSpan={2} className="min-w-[120px] border-r font-bold align-middle">NIM</TableHead>
                                <TableHead rowSpan={2} className="min-w-[200px] border-r font-bold align-middle">Nama Mahasiswa</TableHead>
                                
                                {/* CLO Headers */}
                                {clos.map((sc: any) => {
                                    // Group by techniques defined in curriculum
                                    const techniques = sc.techniques || []
                                    const colSpan = Math.max(1, techniques.length)
                                    
                                    return (
                                        <TableHead key={sc.id} colSpan={colSpan} className="text-center border-r border-b font-bold bg-blue-50/50 dark:bg-blue-900/20">
                                            <div className="flex flex-col items-center gap-1">
                                                <span>{sc.clo.code}</span>
                                                <Badge variant="outline" className="text-[10px] bg-background">{sc.weight}%</Badge>
                                            </div>
                                        </TableHead>
                                    )
                                })}

                                {/* CLO Accumulations */}
                                {clos.map((sc: any) => (
                                    <TableHead key={`acc_${sc.id}`} rowSpan={2} className="text-center min-w-[100px] border-r font-bold align-middle bg-blue-50/30 dark:bg-blue-900/10">
                                        Akumulasi<br/>{sc.clo.code}
                                    </TableHead>
                                ))}

                                {/* PLO Accumulations */}
                                {plos.map(([id, plo]: any) => (
                                    <TableHead key={id} rowSpan={2} className="text-center min-w-[100px] border-r font-bold align-middle bg-purple-50/50 dark:bg-purple-900/20">
                                        Akumulasi<br/>{plo?.code || id}
                                    </TableHead>
                                ))}

                                {/* Final Grade */}
                                <TableHead rowSpan={2} className="text-center min-w-[100px] border-r font-bold align-middle bg-primary/10 dark:bg-primary/5">
                                    Nilai Akhir<br/>Angka
                                </TableHead>
                                <TableHead rowSpan={2} className="text-center min-w-[80px] font-bold align-middle bg-primary/10 dark:bg-primary/5">
                                    Nilai Akhir<br/>Huruf
                                </TableHead>
                            </TableRow>
                            
                            {/* Technique Headers (Row 2) */}
                            <TableRow className="bg-muted/10">
                                {clos.map((sc: any) => {
                                    const techniques = sc.techniques || []
                                    
                                    if (techniques.length === 0) {
                                        return <TableHead key={`${sc.id}_none`} className="text-center border-r text-xs italic font-normal text-muted-foreground">Tanpa Teknik</TableHead>
                                    }

                                    return techniques.map((t: any, idx: number) => {
                                        const isLast = idx === techniques.length - 1;
                                        return (
                                            <TableHead key={`${sc.id}_${t.id}`} className={`text-center text-xs font-medium min-w-[100px] ${isLast ? 'border-r' : 'border-r'}`} title={t.technique}>
                                                <div className="flex flex-col items-center gap-0.5">
                                                    <span className="truncate block max-w-[120px] mx-auto">{t.technique}</span>
                                                    <span className="text-[9px] text-muted-foreground">{t.weight}%</span>
                                                </div>
                                            </TableHead>
                                        )
                                    })
                                })}
                            </TableRow>
                        </TableHeader>
                        
                        <TableBody>
                            {enrollments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5 + clos.length + plos.length} className="text-center py-8 text-muted-foreground">Belum ada mahasiswa terdaftar.</TableCell>
                                </TableRow>
                            ) : (
                                enrollments.map((enr: any, idx: number) => {
                                    const obeResult = calculateStudentOBEGrade(enr.studentId, assessments, submissions, subjectClos, gradeScales)

                                    return (
                                        <TableRow key={enr.id} className="hover:bg-muted/30">
                                            <TableCell className="text-center border-r">{idx + 1}</TableCell>
                                            <TableCell className="text-muted-foreground border-r">{enr.student.studentProfile?.nim || '-'}</TableCell>
                                            <TableCell className="font-medium border-r">{enr.student.name}</TableCell>
                                            
                                            {/* CLO Columns (Techniques) */}
                                            {clos.map((sc: any) => {
                                                const techniques = sc.techniques || []
                                                
                                                if (techniques.length === 0) {
                                                    const cloData = obeResult.cloResults.get(sc.clo.id)
                                                    return (
                                                        <TableCell key={`${sc.id}_none`} className="text-center border-r bg-slate-50 dark:bg-slate-800/30">
                                                            {cloData && cloData.points > 0 ? Number(cloData.points.toFixed(2)) : '-'}
                                                        </TableCell>
                                                    )
                                                }

                                                return techniques.map((t: any, idx: number) => {
                                                    const techAssessments = assessments.filter((a: any) => 
                                                        a.type === t.technique && 
                                                        a.assessmentClos.some((ac: any) => ac.cloId === sc.clo.id)
                                                    )
                                                    
                                                    let techScoreSum = 0;
                                                    let techCount = 0;

                                                    techAssessments.forEach((a: any) => {
                                                        const sub = submissions?.find((s: any) => s.studentId === enr.studentId && s.assessmentId === a.id);
                                                        if (sub && sub.score !== null) {
                                                            const cloScore = sub.cloScores?.find((cs: any) => cs.cloId === sc.clo.id);
                                                            if (cloScore && cloScore.score !== null) {
                                                                techScoreSum += cloScore.score;
                                                                techCount++;
                                                            } else {
                                                                techScoreSum += sub.score;
                                                                techCount++;
                                                            }
                                                        }
                                                    });

                                                    const scoreToDisplay = techCount > 0 ? techScoreSum / techCount : null;
                                                    const isLast = idx === techniques.length - 1;

                                                    return (
                                                        <TableCell key={`${sc.id}_${t.id}`} className={`text-center ${isLast ? 'border-r' : 'border-r'}`}>
                                                            {scoreToDisplay !== null ? (
                                                                <span className="font-medium">{Number(scoreToDisplay.toFixed(2))}</span>
                                                            ) : (
                                                                <span className="text-muted-foreground/30">-</span>
                                                            )}
                                                        </TableCell>
                                                    )
                                                })
                                            })}

                                            {/* CLO Accumulations */}
                                            {clos.map((sc: any) => {
                                                const cloData = obeResult.cloResults.get(sc.clo.id)
                                                return (
                                                    <TableCell key={`acc_${sc.id}`} className="text-center border-r bg-blue-50/10 dark:bg-blue-900/5 font-medium">
                                                        {cloData && cloData.mastery !== null ? (
                                                            <div className="flex flex-col items-center">
                                                                <span>{Number(cloData.points.toFixed(2))}</span>
                                                                <span className="text-[10px] text-muted-foreground font-normal">({Number(cloData.mastery.toFixed(2))}%)</span>
                                                            </div>
                                                        ) : '-'}
                                                    </TableCell>
                                                )
                                            })}

                                            {/* PLO Accumulations */}
                                            {plos.map(([id, _]) => {
                                                const ploData = obeResult.ploResults.get(id)
                                                return (
                                                    <TableCell key={id} className="text-center border-r bg-purple-50/30 dark:bg-purple-900/10 font-medium">
                                                        {ploData && ploData.mastery !== null ? (
                                                            <div className="flex flex-col items-center">
                                                                <span>{Number(ploData.points.toFixed(2))}</span>
                                                                <span className="text-[10px] text-muted-foreground font-normal">({Number(ploData.mastery.toFixed(2))}%)</span>
                                                            </div>
                                                        ) : '-'}
                                                    </TableCell>
                                                )
                                            })}

                                            {/* Final Grades */}
                                            <TableCell className="text-center border-r bg-primary/5 dark:bg-primary/10 font-bold text-primary">
                                                {obeResult.finalGrade !== null ? Number(obeResult.finalGrade.toFixed(2)) : '-'}
                                            </TableCell>
                                            <TableCell className="text-center bg-primary/10 dark:bg-primary/20 font-bold text-lg text-primary">
                                                {obeResult.letterGrade}
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Rata-rata Kelas Card */}
                <Card>
                    <CardHeader className="bg-muted/30 border-b pb-4">
                        <CardTitle className="text-lg">Statistik Rata-rata Kelas</CardTitle>
                        <CardDescription>Rata-rata poin dan capaian (mastery) per CLO dan PLO untuk seluruh mahasiswa.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-6">
                            <div>
                                <h4 className="text-xs font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Course Learning Outcomes (CLO)</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {clos.map((sc: any) => {
                                        const avg = classAverages.clo.get(sc.clo.id)
                                        const points = avg && avg.count > 0 ? (avg.totalPoints / avg.count).toFixed(2) : '-'
                                        const mastery = avg && avg.count > 0 ? (avg.totalMastery / avg.count).toFixed(2) : '-'
                                        return (
                                            <div key={`avg_clo_${sc.id}`} className="flex flex-col bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-100 dark:border-blue-900/30">
                                                <span className="font-bold text-blue-900 dark:text-blue-100">{sc.clo.code}</span>
                                                <div className="mt-1 flex items-baseline gap-1.5">
                                                    <span className="text-lg font-semibold">{points}</span>
                                                    <span className="text-[10px] text-muted-foreground font-normal">({mastery}%)</span>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-xs font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Program Learning Outcomes (PLO)</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {plos.map(([id, plo]: any) => {
                                        const avg = classAverages.plo.get(id)
                                        const points = avg && avg.count > 0 ? (avg.totalPoints / avg.count).toFixed(2) : '-'
                                        const mastery = avg && avg.count > 0 ? (avg.totalMastery / avg.count).toFixed(2) : '-'
                                        return (
                                            <div key={`avg_plo_${id}`} className="flex flex-col bg-purple-50/50 dark:bg-purple-900/10 p-3 rounded-lg border border-purple-100 dark:border-purple-900/30">
                                                <span className="font-bold text-purple-900 dark:text-purple-100">{plo?.code || id}</span>
                                                <div className="mt-1 flex items-baseline gap-1.5">
                                                    <span className="text-lg font-semibold">{points}</span>
                                                    <span className="text-[10px] text-muted-foreground font-normal">({mastery}%)</span>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Keterangan Kurikulum Card */}
                <Card>
                    <CardHeader className="bg-muted/30 border-b pb-4">
                        <CardTitle className="text-lg">Keterangan Pemetaan Kurikulum</CardTitle>
                        <CardDescription>Daftar PLO dan CLO beserta komposisi bobot teknik penilaian.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            {plos.map(([ploId, plo]: any) => {
                                const relatedClos = clos.filter((sc: any) => sc.ploId === ploId)
                                return (
                                    <div key={`legend_plo_${ploId}`} className="border rounded-lg p-4 bg-card">
                                        <div className="mb-3">
                                            <span className="font-bold text-purple-700 dark:text-purple-400">{plo?.code || ploId}</span>
                                            {plo?.description && <p className="text-sm text-muted-foreground mt-0.5">{plo.description}</p>}
                                        </div>
                                        <div className="space-y-3 pl-4 border-l-2 border-muted ml-2">
                                            {relatedClos.map((sc: any) => (
                                                <div key={`legend_clo_${sc.id}`} className="bg-muted/30 p-2 rounded-md">
                                                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start justify-between text-sm">
                                                        <div>
                                                            <span className="font-semibold text-blue-700 dark:text-blue-400">{sc.clo.code}</span>
                                                            {sc.clo.description && <p className="text-xs text-muted-foreground">{sc.clo.description}</p>}
                                                        </div>
                                                        <Badge variant="outline" className="text-[10px] whitespace-nowrap mt-1 sm:mt-0">{sc.weight}%</Badge>
                                                    </div>
                                                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                                                        {sc.techniques && sc.techniques.length > 0 ? (
                                                            sc.techniques.map((t: any) => (
                                                                <span key={`legend_tech_${t.id}`} className="text-[10px] bg-muted px-2 py-0.5 rounded text-muted-foreground">
                                                                    {t.technique}: <span className="font-medium text-foreground">{t.weight}%</span>
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-[10px] text-muted-foreground italic">Belum ada teknik penilaian</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Execution Progress Section */}
            <div>
                <h3 className="text-lg font-semibold mb-4">Progres Pelaksanaan Teknik Penilaian per CLO</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {clos.map((sc: any) => {
                        const techniques = sc.techniques || []
                        const totalWeight = techniques.reduce((acc: number, t: any) => acc + t.weight, 0)
                        
                        let executedWeight = 0;
                        const techStatus = techniques.map((t: any) => {
                            const isExecuted = assessments.some((a: any) => 
                                a.type === t.technique && 
                                a.assessmentClos.some((ac: any) => ac.cloId === sc.clo.id)
                            )
                            if (isExecuted) executedWeight += t.weight;
                            return { ...t, isExecuted }
                        })

                        return (
                            <Card key={sc.id} className="border-border/50 shadow-sm">
                                <CardHeader className="py-3 bg-muted/20 border-b">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-sm font-bold">{sc.clo.code}</CardTitle>
                                        <Badge variant={executedWeight === totalWeight && totalWeight > 0 ? "default" : "secondary"} className="text-[10px]">
                                            {executedWeight} / {totalWeight}%
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-3">
                                    <div className="space-y-2">
                                        {techStatus.length === 0 ? (
                                            <p className="text-xs text-muted-foreground italic">Belum ada teknik penilaian yang dipetakan di kurikulum.</p>
                                        ) : techStatus.map((t: any) => (
                                            <div key={t.id} className="flex justify-between items-center text-xs">
                                                <div className="flex items-center gap-1.5">
                                                    {t.isExecuted ? (
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                                    ) : (
                                                        <Circle className="w-3.5 h-3.5 text-muted-foreground/50" />
                                                    )}
                                                    <span className={t.isExecuted ? "font-medium text-foreground" : "text-muted-foreground"}>
                                                        {t.technique}
                                                    </span>
                                                </div>
                                                <span className="text-muted-foreground font-medium">{t.weight}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
