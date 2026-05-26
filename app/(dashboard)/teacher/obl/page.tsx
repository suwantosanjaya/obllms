import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { getInstructorCourses } from '@/app/actions/courseActions'
import { getPLOs } from '@/app/actions/obeActions'
import prisma from '@/lib/db'
// CLO is read-only for Dosen now.
// import { CreateCLODialog } from '@/app/components/dosen/CreateCLODialog'
// import { DeleteCLOButton } from '@/app/components/dosen/DeleteCLOButton'
import React from 'react'

export default async function DosenOBLPage() {
    // Get current simulated dosen
    const dosenUser = await prisma.user.findFirst({ where: { role: 'dosen' } })

    if (!dosenUser) {
        return <div className="p-8 text-center text-muted-foreground">User dosen tidak ditemukan di database. Pastikan seed database sudah berjalan.</div>
    }

    const coursesRes = await getInstructorCourses(dosenUser.id)
    const activeCourses = coursesRes.success ? (coursesRes.courses || []) : []
    const mappedCoursesToDropdown = activeCourses.map((c: any) => ({ id: c.id, title: `${c.subject.code} - ${c.subject.title}` }))

    const plosRes = await getPLOs()
    const activePlos = plosRes.success ? (plosRes.plos || []) : []
    const mappedPlosToDropdown = activePlos.map((p: { id: string, code: string }) => ({ id: p.id, code: p.code }))

    // Fetch all CLOs mapped to the subjects of the instructor's courses
    const subjectIds = Array.from(new Set(activeCourses.map((c: { subjectId: string }) => c.subjectId)))
    const subjectCloMappings = await prisma.subjectCLO.findMany({
        where: { subjectId: { in: subjectIds as string[] } },
        include: {
            subject: true,
            clo: true,
            plo: true
        },
        orderBy: [{ subjectId: 'asc' }, { plo: { code: 'asc' } }, { clo: { code: 'asc' } }]
    })

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Outcome Based Learning (OBL)</h1>
                    <p className="text-muted-foreground mt-1">Kelola CPMK kelas Anda dan selaraskan dengan CPL program studi.</p>
                </div>
                {/* CreateCLODialog removed as Dosen only views CLOs defined by Admin Departemen */}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Daftar CPMK (Course Learning Outcomes)</CardTitle>
                    <CardDescription>
                        Capaian pembelajaran spesifik untuk setiap mata kuliah yang Anda ajarkan.
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
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {subjectCloMappings.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        Belum ada CPMK yang dipetakan ke mata kuliah Anda.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                subjectCloMappings.map((mapping: any) => (
                                    <TableRow key={mapping.id}>
                                        <TableCell>
                                            <Badge variant="outline" className="font-medium">{mapping.subject?.code}</Badge>
                                        </TableCell>
                                        <TableCell className="font-semibold text-slate-700">{mapping.clo.code}</TableCell>
                                        <TableCell className="max-w-[300px]">
                                            {mapping.clo.description}
                                        </TableCell>
                                        <TableCell>
                                            {mapping.plo ? (
                                                <div className="flex flex-wrap gap-1">
                                                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none" title={mapping.plo.description}>
                                                        {mapping.plo.code}
                                                    </Badge>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-orange-500 font-medium bg-orange-50 px-2 py-1 rounded">Tanpa Peta</span>
                                            )}
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
