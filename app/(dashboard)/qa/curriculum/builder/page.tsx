import { CurriculumStepper } from '@/app/components/qa/CurriculumStepper'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

import { VisionMissionTab } from '@/app/components/qa/VisionMissionTab'
import { GraduateProfileTab } from '@/app/components/qa/GraduateProfileTab'
import { PLOTab } from '@/app/components/qa/PLOTab'
import { CLOTab } from '@/app/components/qa/CLOTab'
import { CurriculumSubjectTab } from '@/app/components/qa/CurriculumSubjectTab'
import { SubjectCLOMappingTab } from '@/app/components/qa/SubjectCLOMappingTab'
import { AssessmentDesignTab } from '@/app/components/qa/AssessmentDesignTab'
import { AssessmentWeightingTab } from '@/app/components/qa/AssessmentWeightingTab'
import { CurriculumReportTab } from '@/app/components/qa/CurriculumReportTab'
import { CurriculumApprovalBanner } from '@/app/components/qa/CurriculumApprovalBanner'

import { getVisionMissions, getGraduateProfiles, getPLOs, getAllCLOs, checkCurriculumLock, getDepartmentCurriculumStatus, getAllSubjectCLOMappings } from '@/app/actions/obeActions'
import { getCurriculumSubjects } from '@/app/actions/curriculumSubjectActions'
import { getSessionUser } from '@/app/actions/userActions'
import prisma from '@/lib/db'

export default async function QaCurriculumPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | undefined }>
}) {
    const user = await getSessionUser()
    const departmentId = user?.activeDepartmentId || undefined

    const params = await searchParams
    
    // Get all curriculum years for the dropdown
    const curriculumYears = await prisma.curriculumYear.findMany({ 
        where: departmentId ? { departmentId } : {},
        orderBy: { name: 'desc' } 
    })
    const selectedYearId = params.yearId || curriculumYears[0]?.id || undefined

    // Fetch all data scoped by departmentId and selectedYearId
    const lockStatus = await checkCurriculumLock(departmentId, selectedYearId)
    const isLocked = lockStatus.locked || user?.activeRole === 'head_of_department'
    const currStatus = await getDepartmentCurriculumStatus(departmentId as string, selectedYearId as string)
    const department = departmentId ? await prisma.department.findUnique({ where: { id: departmentId } }) : null

    const vmRes = await getVisionMissions(departmentId, selectedYearId)
    const visionMissions = vmRes.success ? (vmRes.visionMissions || []) : []

    const gpRes = await getGraduateProfiles(departmentId, selectedYearId)
    const graduateProfiles = gpRes.success ? (gpRes.profiles || []) : []

    const ploRes = await getPLOs(departmentId, selectedYearId)
    const plos = ploRes.success ? (ploRes.plos || []) : []

    const cloRes = await getAllCLOs(selectedYearId, departmentId)
    const clos = cloRes.success ? (cloRes.clos || []) : []

    const mappingsRes = await getAllSubjectCLOMappings(departmentId, selectedYearId)
    const initialMappings = mappingsRes.success ? (mappingsRes.mappings || []) : []

    const curriculumSubjectRes = await getCurriculumSubjects(selectedYearId as string)
    const curriculumSubjects = curriculumSubjectRes.success ? (curriculumSubjectRes.curriculumSubjects || []) : []

    // Master data for dropdowns
    const departments = await prisma.department.findMany({ orderBy: { code: 'asc' } })
    
    const subjectWhereClause = departmentId ? {
        OR: [
            { departmentId: departmentId },
            { scope: 'universitas' }
        ]
    } : {}
    const subjects = await prisma.subject.findMany({ where: subjectWhereClause, orderBy: { code: 'asc' } })
    
    const selectedSubjectsFromMaster = subjects.filter(s => curriculumSubjects.some((cs: any) => cs.subjectId === s.id))
    
    const mappedPlosToDropdown = plos.map((p: any) => ({ id: p.id, code: p.code }))
    const mappedVisionMissionsToDropdown = visionMissions.map((vm: any) => ({ id: vm.id, code: vm.code }))
    const mappedGraduateProfilesToDropdown = graduateProfiles.map((gp: any) => ({ id: gp.id, code: gp.code, title: gp.title }))

    const steps = [
        {
            id: 'vision',
            title: '1. Vision & Mission',
            content: (
                <VisionMissionTab 
                    visionMissions={visionMissions} 
                    department={department}
                    departmentId={departmentId}
                    selectedYearId={selectedYearId}
                    isLocked={isLocked}
                />
            )
        },
        {
            id: 'gp',
            title: '2. Graduate Profiles',
            content: (
                <GraduateProfileTab
                    graduateProfiles={graduateProfiles}
                    mappedVisionMissionsToDropdown={mappedVisionMissionsToDropdown}
                    departments={departments}
                    departmentId={departmentId}
                    selectedYearId={selectedYearId}
                    isLocked={isLocked}
                />
            )
        },
        {
            id: 'plo',
            title: '3. PLO (Program)',
            content: (
                <PLOTab
                    plos={plos}
                    mappedGraduateProfilesToDropdown={mappedGraduateProfilesToDropdown}
                    departmentId={departmentId}
                    selectedYearId={selectedYearId}
                    isLocked={isLocked}
                />
            )
        },
        {
            id: 'clo',
            title: '4. CLO (Bank)',
            content: (
                <CLOTab
                    clos={clos}
                    mappedPlosToDropdown={mappedPlosToDropdown}
                    departmentId={departmentId}
                    selectedYearId={selectedYearId}
                    isLocked={isLocked}
                />
            )
        },
        {
            id: 'subjects',
            title: '5. Daftar Mata Kuliah',
            content: (
                <div className="space-y-8">
                    <CurriculumSubjectTab
                        departmentId={departmentId as string}
                        curriculumYearId={selectedYearId as string}
                        allSubjects={subjects.map(s => ({ id: s.id, code: s.code, title: s.title, type: s.type, scope: s.scope, credits: s.credits }))}
                        initialSelected={curriculumSubjects}
                        isLocked={isLocked}
                    />
                </div>
            )
        },
        {
            id: 'mapping',
            title: '6. Pemetaan (Mapping)',
            content: (
                <div className="space-y-8">
                    <SubjectCLOMappingTab
                        subjects={selectedSubjectsFromMaster.map(s => ({ id: s.id, code: s.code, title: s.title }))}
                        allCLOs={clos.map((c: any) => ({ id: c.id, code: c.code, description: c.description, plos: c.plos }))}
                        initialMappings={initialMappings as any[]}
                        isLocked={isLocked}
                    />
                </div>
            )
        },
        {
            id: 'design',
            title: '7. Desain Asesmen',
            content: (
                <div className="space-y-8">
                    <AssessmentDesignTab
                        subjects={selectedSubjectsFromMaster.map(s => ({ id: s.id, code: s.code, title: s.title }))}
                        initialMappings={initialMappings as any[]}
                        isLocked={isLocked}
                    />
                </div>
            )
        },
        {
            id: 'weighting',
            title: '8. Pembobotan (Weighting)',
            content: (
                <div className="space-y-8">
                    <AssessmentWeightingTab
                        subjects={selectedSubjectsFromMaster.map(s => ({ id: s.id, code: s.code, title: s.title }))}
                        initialMappings={initialMappings as any[]}
                        isLocked={isLocked}
                    />
                </div>
            )
        },
        {
            id: 'report',
            title: '9. Laporan Kurikulum',
            content: (
                <div className="space-y-8">
                    <CurriculumReportTab
                        visionMissions={visionMissions}
                        graduateProfiles={graduateProfiles}
                        plos={plos}
                        clos={clos}
                        subjects={selectedSubjectsFromMaster}
                        mappings={initialMappings}
                    />
                </div>
            )
        },
        {
            id: 'submit',
            title: '10. Submit & Approval',
            content: (
                <div className="space-y-8">
                    <CurriculumApprovalBanner
                        departmentId={departmentId}
                        curriculumYearId={selectedYearId}
                        status={currStatus?.status || 'DRAFT'}
                        activeRole={user?.activeRole || ''}
                        activeHeadId={department?.activeHeadId || undefined}
                        userId={user?.id}
                    />
                </div>
            )
        }
    ]

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/qa/curriculum">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Curriculum Builder</h1>
                    <div className="flex items-center gap-3 mt-1">
                        <p className="text-muted-foreground">Menyusun kurikulum: </p>
                        <Badge variant="outline" className="text-sm">
                            {curriculumYears.find(y => y.id === selectedYearId)?.name || 'Unknown Year'}
                        </Badge>
                    </div>
                </div>
            </div>

            <CurriculumStepper steps={steps} />
        </div>
    )
}
