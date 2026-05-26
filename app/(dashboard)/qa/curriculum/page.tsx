import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

import { CreateVisionMissionDialog } from '@/app/components/qa/CreateVisionMissionDialog'
import { EditVisionMissionDialog } from '@/app/components/qa/EditVisionMissionDialog'
import { DeleteVisionMissionButton } from '@/app/components/qa/DeleteVisionMissionButton'

import { CreateGraduateProfileDialog } from '@/app/components/qa/CreateGraduateProfileDialog'
import { EditGraduateProfileDialog } from '@/app/components/qa/EditGraduateProfileDialog'
import { DeleteGraduateProfileButton } from '@/app/components/qa/DeleteGraduateProfileButton'

import { CreatePLODialog } from '@/app/components/qa/CreatePLODialog'
import { EditPLODialog } from '@/app/components/qa/EditPLODialog'
import { DeletePLOButton } from '@/app/components/qa/DeletePLOButton'

import { CreateCLODialog } from '@/app/components/qa/CreateCLODialog'
import { EditCLODialog } from '@/app/components/qa/EditCLODialog'
import { DeleteCLOButton } from '@/app/components/qa/DeleteCLOButton'
import { SubjectCLOMappingTab } from '@/app/components/qa/SubjectCLOMappingTab'

import { getVisionMissions, getGraduateProfiles, getPLOs, getAllCLOs, checkCurriculumLock, getDepartmentCurriculumStatus } from '@/app/actions/obeActions'
import { getSessionUser } from '@/app/actions/userActions'
import prisma from '@/lib/db'
import { CurriculumYearSelector } from '@/app/components/qa/CurriculumYearSelector'
import { CurriculumApprovalBanner } from '@/app/components/qa/CurriculumApprovalBanner'

export default async function QaCurriculumPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | undefined }>
}) {
    const user = await getSessionUser()
    const departmentId = user?.activeDepartmentId || undefined

    const params = await searchParams
    
    // Get all curriculum years for the dropdown
    const curriculumYears = await prisma.curriculumYear.findMany({ orderBy: { name: 'desc' } })
    const activeYear = curriculumYears.find(cy => cy.isActive)
    const selectedYearId = params.yearId || activeYear?.id || undefined

    // Fetch all data scoped by departmentId and selectedYearId
    const lockStatus = await checkCurriculumLock(departmentId, selectedYearId)
    const isLocked = lockStatus.locked
    const currStatus = await getDepartmentCurriculumStatus(departmentId as string, selectedYearId as string)
    const department = departmentId ? await prisma.department.findUnique({ where: { id: departmentId } }) : null

    const vmRes = await getVisionMissions(departmentId)
    const visionMissions = vmRes.success ? (vmRes.visionMissions || []) : []

    const gpRes = await getGraduateProfiles(departmentId, selectedYearId)
    const graduateProfiles = gpRes.success ? (gpRes.profiles || []) : []

    const ploRes = await getPLOs(departmentId, selectedYearId)
    const plos = ploRes.success ? (ploRes.plos || []) : []

    const cloRes = await getAllCLOs(selectedYearId, departmentId)
    const clos = cloRes.success ? (cloRes.clos || []) : []

    // Master data for dropdowns
    const departments = await prisma.department.findMany({ orderBy: { code: 'asc' } })
    
    const subjectWhereClause = departmentId ? {
        OR: [
            { departmentId: departmentId },
            { scope: 'universitas' }
        ]
    } : {}
    const subjects = await prisma.subject.findMany({ where: subjectWhereClause, orderBy: { code: 'asc' } })
    
    const mappedSubjectsToDropdown = subjects.map(s => ({ id: s.id, title: `${s.code} - ${s.title}` }))
    const mappedPlosToDropdown = plos.map((p: any) => ({ id: p.id, code: p.code }))
    const mappedVisionMissionsToDropdown = visionMissions.map((vm: any) => ({ id: vm.id, code: vm.code }))
    const mappedGraduateProfilesToDropdown = graduateProfiles.map((gp: any) => ({ id: gp.id, code: gp.code, title: gp.title }))

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Curriculum Review (OBE)</h1>
                <div className="flex justify-between items-start mt-1">
                    <p className="text-muted-foreground">Manage the Outcome-Based Education cascade from Vision/Mission down to Course Learning Outcomes.</p>
                    <CurriculumYearSelector years={curriculumYears} activeYearId={activeYear?.id || null} />
                </div>
            </div>

            <CurriculumApprovalBanner
                departmentId={departmentId}
                curriculumYearId={selectedYearId}
                status={currStatus?.status || 'DRAFT'}
                activeRole={user?.activeRole || ''}
                activeHeadId={department?.activeHeadId || undefined}
                userId={user?.id}
            />

            <Tabs defaultValue="vision" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="vision">1. Vision & Mission</TabsTrigger>
                    <TabsTrigger value="gp">2. Graduate Profiles</TabsTrigger>
                    <TabsTrigger value="plo">3. PLO (Program)</TabsTrigger>
                    <TabsTrigger value="clo">4. CLO (Bank)</TabsTrigger>
                    <TabsTrigger value="mapping">5. CLO-Subject Mapping</TabsTrigger>
                </TabsList>

                {/* 1. VISION & MISSION TAB */}
                <TabsContent value="vision" className="pt-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Institution Vision & Mission</CardTitle>
                                <CardDescription>
                                    Visi dan misi departemen {department?.name || 'Anda'}.
                                </CardDescription>
                            </div>
                            <CreateVisionMissionDialog isLocked={isLocked} departmentId={departmentId} />
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[100px]">Code</TableHead>
                                        <TableHead className="w-[100px]">Type</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {visionMissions.length === 0 ? (
                                        <TableRow><TableCell colSpan={4} className="text-center py-4">No Vision/Mission data found.</TableCell></TableRow>
                                    ) : (
                                        visionMissions.map((vm: any) => (
                                            <TableRow key={vm.id}>
                                                <TableCell className="font-semibold">{vm.code}</TableCell>
                                                <TableCell>
                                                    <Badge variant={vm.type === 'vision' ? 'default' : 'secondary'}>{vm.type.toUpperCase()}</Badge>
                                                </TableCell>
                                                <TableCell>{vm.description}</TableCell>
                                                <TableCell className="text-right flex items-center justify-end gap-2">
                                                    <EditVisionMissionDialog vm={vm} isLocked={isLocked} departmentId={departmentId} />
                                                    <DeleteVisionMissionButton id={vm.id} code={vm.code} disabled={isLocked} />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* 2. GRADUATE PROFILES TAB */}
                <TabsContent value="gp" className="pt-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Program Graduate Profiles</CardTitle>
                                <CardDescription>Expected roles and capabilities of graduates, aligned with Vision/Mission.</CardDescription>
                            </div>
                            {!isLocked && <CreateGraduateProfileDialog visionMissions={mappedVisionMissionsToDropdown} departments={departments} selectedYearId={selectedYearId} departmentId={departmentId} />}
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[100px]">Code</TableHead>
                                        <TableHead>Role / Title</TableHead>
                                        <TableHead>Program Study</TableHead>
                                        <TableHead>Alignment (V/M)</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {graduateProfiles.length === 0 ? (
                                        <TableRow><TableCell colSpan={5} className="text-center py-4">No Graduate Profiles found.</TableCell></TableRow>
                                    ) : (
                                        graduateProfiles.map((gp: any) => (
                                            <TableRow key={gp.id}>
                                                <TableCell className="font-semibold">{gp.code}</TableCell>
                                                <TableCell>{gp.title}</TableCell>
                                                <TableCell>{gp.department?.name || '-'}</TableCell>
                                                <TableCell>{gp.visionMission?.code || '-'}</TableCell>
                                                <TableCell className="text-right space-x-2">
                                                    {!isLocked && (
                                                        <>
                                                            <EditGraduateProfileDialog profile={gp} visionMissions={mappedVisionMissionsToDropdown} departments={departments} departmentId={departmentId} />
                                                            <DeleteGraduateProfileButton id={gp.id} code={gp.code} />
                                                        </>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* 3. PLO TAB */}
                <TabsContent value="plo" className="pt-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Program Learning Outcomes (PLO)</CardTitle>
                                <CardDescription>Specific learning outcomes for the program, aligned to Graduate Profiles.</CardDescription>
                            </div>
                            {!isLocked && <CreatePLODialog graduateProfiles={mappedGraduateProfilesToDropdown} selectedYearId={selectedYearId} departmentId={departmentId} />}
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[100px]">Code</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Alignment (GP)</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {plos.length === 0 ? (
                                        <TableRow><TableCell colSpan={4} className="text-center py-4">No PLOs found.</TableCell></TableRow>
                                    ) : (
                                        plos.map((plo: any) => (
                                            <TableRow key={plo.id}>
                                                <TableCell className="font-semibold text-primary">{plo.code}</TableCell>
                                                <TableCell className="max-w-[400px]">{plo.description}</TableCell>
                                                <TableCell>
                                                    {plo.graduateProfiles && plo.graduateProfiles.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1">
                                                            {plo.graduateProfiles.map((gp: any) => (
                                                                <Badge key={gp.id} variant="secondary">{gp.code}</Badge>
                                                            ))}
                                                        </div>
                                                    ) : '-'}
                                                </TableCell>
                                                <TableCell className="text-right space-x-2">
                                                    {!isLocked && (
                                                        <>
                                                            <EditPLODialog plo={plo} graduateProfiles={mappedGraduateProfilesToDropdown} />
                                                            <DeletePLOButton id={plo.id} code={plo.code} />
                                                        </>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* 4. CLO BANK TAB */}
                <TabsContent value="clo" className="pt-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Bank CLO (Course Learning Outcomes)</CardTitle>
                                <CardDescription>Bank CLO Department — setiap CLO bisa dipetakan ke banyak mata kuliah dengan bobot berbeda.</CardDescription>
                            </div>
                            {!isLocked && <CreateCLODialog plos={mappedPlosToDropdown} departmentId={departmentId} selectedYearId={selectedYearId} />}
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[100px]">Kode</TableHead>
                                        <TableHead>Deskripsi</TableHead>
                                        <TableHead>Relasi PLO</TableHead>
                                        <TableHead>Dipakai di</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {clos.length === 0 ? (
                                        <TableRow><TableCell colSpan={5} className="text-center py-4">Belum ada CLO. Klik "Add CLO" untuk membuat.</TableCell></TableRow>
                                    ) : (
                                        clos.map((clo: any) => (
                                            <TableRow key={clo.id}>
                                                <TableCell className="font-semibold">{clo.code}</TableCell>
                                                <TableCell className="max-w-[300px]">{clo.description}</TableCell>
                                                <TableCell>
                                                    {clo.plos && clo.plos.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1">
                                                            {clo.plos.map((plo: any) => (
                                                                <Badge key={plo.id} className="bg-blue-100 text-blue-700">{plo.code}</Badge>
                                                            ))}
                                                        </div>
                                                    ) : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {clo.subjectClos && clo.subjectClos.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1">
                                                            {clo.subjectClos.map((sc: any) => (
                                                                <Badge key={sc.id} variant="outline">{sc.subject?.code}</Badge>
                                                            ))}
                                                        </div>
                                                    ) : <span className="text-muted-foreground text-xs">Belum dipetakan</span>}
                                                </TableCell>
                                                <TableCell className="text-right space-x-2">
                                                    {!isLocked && (
                                                        <>
                                                            <EditCLODialog clo={clo} plos={mappedPlosToDropdown} />
                                                            <DeleteCLOButton id={clo.id} code={clo.code} />
                                                        </>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* 5. CLO-SUBJECT MAPPING TAB */}
                <TabsContent value="mapping" className="pt-4">
                    <SubjectCLOMappingTab
                        subjects={subjects.map(s => ({ id: s.id, code: s.code, title: s.title }))}
                        allCLOs={clos.map((c: any) => ({ id: c.id, code: c.code, description: c.description, plos: c.plos }))}
                        isLocked={isLocked}
                    />
                </TabsContent>

            </Tabs>
        </div>
    )
}
