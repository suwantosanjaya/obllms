import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import prisma from '@/lib/db'
import { getSessionUser } from '@/app/actions/userActions'
import { redirect } from 'next/navigation'
import { getStudentCourses } from '@/app/actions/courseActions'

export default async function StudentOBLPage() {
    const studentUser = await getSessionUser()

    if (!studentUser || !studentUser.roles?.includes('student')) {
        redirect('/')
    }

    // Get active courses for the student in their active department
    const enrollmentsRes = await getStudentCourses(studentUser.id, studentUser.activeDepartmentId)
    const activeEnrollments = enrollmentsRes.success ? (enrollmentsRes.enrollments || []) : []
    const activeCourses = activeEnrollments.map((enr: any) => enr.course)

    // A student might take Subject A in Curriculum 2020 and Subject B in Curriculum 2024.
    // We only want to show the CLOs for the specific Subject + Curriculum combinations they are taking.
    const courseConditions = activeCourses
        .filter((c: any) => c.curriculumYearId)
        .map((c: any) => ({
            subjectId: c.subjectId,
            clo: { curriculumYearId: c.curriculumYearId }
        }))

    let subjectCloMappings: any[] = []
    if (courseConditions.length > 0) {
        subjectCloMappings = await prisma.subjectCLO.findMany({
            where: { OR: courseConditions },
            include: {
                subject: true,
                clo: {
                    include: { curriculumYear: true }
                },
                plo: true,
                techniques: true
            },
            orderBy: [{ subjectId: 'asc' }, { clo: { curriculumYear: { name: 'asc' } } }, { plo: { code: 'asc' } }, { clo: { code: 'asc' } }]
        })
    }

    // Pre-calculate rowspan for Mata Kuliah
    const subjectRowSpans: Record<string, number> = {}
    subjectCloMappings.forEach((mapping: any) => {
        const key = `${mapping.subjectId}-${mapping.clo.curriculumYearId}`
        subjectRowSpans[key] = (subjectRowSpans[key] || 0) + 1
    })

    const renderedSubjectKeys = new Set<string>()
    let currentSubjectIndex = -1

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Pemetaan OBL</h1>
                    <p className="text-muted-foreground mt-1">Lihat capaian pembelajaran dan bobot penilaian dari kelas yang Anda ambil.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Daftar CPMK & Asesmen (Course Learning Outcomes)</CardTitle>
                    <CardDescription>
                        Capaian pembelajaran spesifik dan teknik penilaian untuk setiap mata kuliah yang Anda ikuti.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[120px]">Mata Kuliah</TableHead>
                                <TableHead className="w-[100px]">Kode</TableHead>
                                <TableHead>Deskripsi CPMK</TableHead>
                                <TableHead className="w-[150px]">Pemetaan CPL</TableHead>
                                <TableHead className="w-[180px]">Teknik & Bobot Asesmen</TableHead>
                            </TableRow>
                        </TableHeader>
                        <tbody className="[&_tr:last-child]:border-0">
                            {subjectCloMappings.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        Anda belum terdaftar di kelas manapun atau belum ada pemetaan CPMK.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                subjectCloMappings.map((mapping: any) => {
                                    const subjectKey = `${mapping.subjectId}-${mapping.clo.curriculumYearId}`
                                    const isFirstSubjectRow = !renderedSubjectKeys.has(subjectKey)
                                    if (isFirstSubjectRow) {
                                        renderedSubjectKeys.add(subjectKey)
                                        currentSubjectIndex++
                                    }
                                    
                                    const rowBg = currentSubjectIndex % 2 === 0 ? "!bg-background hover:!bg-muted/10" : "!bg-muted/50 hover:!bg-muted/70"

                                    return (
                                        <TableRow key={mapping.id} className={rowBg}>
                                            {isFirstSubjectRow && (
                                                <TableCell rowSpan={subjectRowSpans[subjectKey]} className="align-top border-r">
                                                    <div className="flex flex-col gap-1">
                                                        <Badge variant="outline" className="font-medium w-fit bg-background">{mapping.subject?.code}</Badge>
                                                        <span className="font-semibold text-sm">{mapping.subject?.title}</span>
                                                        <span className="text-xs text-muted-foreground">{mapping.clo.curriculumYear?.name}</span>
                                                    </div>
                                                </TableCell>
                                            )}
                                            <TableCell className="font-semibold align-top border-r">{mapping.clo.code}</TableCell>
                                            <TableCell className="max-w-[300px] align-top border-r">
                                                {mapping.clo.description}
                                            </TableCell>
                                            <TableCell className="align-top border-r">
                                                {mapping.plo ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        <Badge variant="outline" className="font-medium" title={mapping.plo.description}>
                                                            {mapping.plo.code}
                                                        </Badge>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-orange-500 font-medium bg-orange-50 px-2 py-1 rounded">Tanpa Peta</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="align-top">
                                                {mapping.techniques && mapping.techniques.length > 0 ? (
                                                    <div className="flex flex-col gap-1.5">
                                                        {mapping.techniques.map((t: any) => (
                                                            <div key={t.id} className="flex justify-between items-center text-xs">
                                                                <span className="text-muted-foreground">{t.technique}</span>
                                                                <span className="font-semibold bg-primary/10 text-primary px-1.5 py-0.5 rounded">{t.weight}%</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground italic">Belum diatur QA</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </tbody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
