import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getSessionUser } from '@/app/actions/userActions'
import { getCurriculumYears } from '@/app/actions/obeActions'
import prisma from '@/lib/db'
import Link from 'next/link'
import { CreateCurriculumYearDialog } from '@/app/components/qa/CreateCurriculumYearDialog'
import { ArrowRight, FileEdit, Eye, PlusCircle, Clock, CheckCheck } from 'lucide-react'
import { CurriculumApprovalCardActions } from '@/app/components/qa/CurriculumApprovalCardActions'
import { CurriculumRevisionRequestButton } from '@/app/components/qa/CurriculumRevisionRequestButton'
import { SetDefaultCurriculumButton } from '@/app/components/qa/SetDefaultCurriculumButton'
export default async function QaCurriculumDashboard() {
    const user = await getSessionUser()
    const departmentId = user?.activeDepartmentId
    const activeRole = user?.activeRole || ''

    // Get all curriculum years for this department
    const curriculumYears = departmentId ? await getCurriculumYears(departmentId) : []
    
    // Get statuses for this department (with full history fields)
    const deptCurriculums = departmentId 
        ? await prisma.departmentCurriculum.findMany({ 
            where: { departmentId },
          })
        : []

    // Collect all unique actor userIds from history fields
    const actorIds = [
        ...deptCurriculums.map(d => d.submittedBy),
        ...deptCurriculums.map(d => d.approvedBy),
        ...deptCurriculums.map(d => d.rejectedBy),
        ...deptCurriculums.map(d => d.revisionRequestedBy),
        ...deptCurriculums.map(d => d.revisionResultBy),
    ].filter((id): id is string => !!id)
    const uniqueActorIds = [...new Set(actorIds)]

    const actorUsers = uniqueActorIds.length > 0
        ? await prisma.user.findMany({ where: { id: { in: uniqueActorIds } }, select: { id: true, name: true } })
        : []
    const actorMap = Object.fromEntries(actorUsers.map(u => [u.id, u.name]))

    // Get department's activeHeadId
    const department = departmentId
        ? await prisma.department.findUnique({ where: { id: departmentId }, select: { activeHeadId: true } })
        : null

    const isHod = activeRole === 'head_of_department'
    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard Kurikulum</h1>
                    <p className="text-muted-foreground mt-1">
                        {isHod
                            ? 'Tinjau dan setujui kurikulum yang telah diajukan oleh tim QA.'
                            : 'Pilih tahun kurikulum untuk mulai menyusun atau meninjau kurikulum program studi Anda.'}
                    </p>
                </div>
                {departmentId && !isHod && <CreateCurriculumYearDialog departmentId={departmentId} />}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {curriculumYears.map(year => {
                    const statusRecord = deptCurriculums.find(dc => dc.curriculumYearId === year.id)
                    const status = statusRecord?.status || 'BELUM DIMULAI'
                    
                    // Status badge — shared by both roles
                    let statusBadge = <Badge variant="outline">Belum Dimulai</Badge>
                    if (status === 'DRAFT')
                        statusBadge = <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Draft</Badge>
                    else if (status === 'REVISION')
                        statusBadge = <Badge variant="destructive">Perlu Revisi</Badge>
                    else if (status === 'SUBMITTED')
                        statusBadge = <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Menunggu Persetujuan</Badge>
                    else if (status === 'REVISION_REQUESTED')
                        statusBadge = <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Permintaan Revisi ✎</Badge>
                    else if (status === 'APPROVED')
                        statusBadge = <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Disetujui ✓</Badge>

                    // QA action button
                    let qaActionIcon = <PlusCircle className="w-4 h-4 mr-2" />
                    let qaActionText = "Mulai Buat Kurikulum"
                    let qaButtonVariant: "default" | "outline" | "secondary" = "default"
                    const qaIsDisabled = status === 'SUBMITTED' || status === 'REVISION_REQUESTED'
                    if (status === 'DRAFT') {
                        qaActionIcon = <FileEdit className="w-4 h-4 mr-2" />
                        qaActionText = "Lanjutkan Editing"
                        qaButtonVariant = "secondary"
                    } else if (status === 'REVISION') {
                        qaActionIcon = <FileEdit className="w-4 h-4 mr-2" />
                        qaActionText = "Perbaiki Kurikulum"
                        qaButtonVariant = "default"
                    } else if (status === 'SUBMITTED') {
                        qaActionIcon = <Clock className="w-4 h-4 mr-2" />
                        qaActionText = "Menunggu Persetujuan..."
                        qaButtonVariant = "outline"
                    } else if (status === 'REVISION_REQUESTED') {
                        qaActionIcon = <Clock className="w-4 h-4 mr-2" />
                        qaActionText = "Menunggu Keputusan Ketua..."
                        qaButtonVariant = "outline"
                    } else if (status === 'APPROVED') {
                        qaActionIcon = <CheckCheck className="w-4 h-4 mr-2" />
                        qaActionText = "Lihat Kurikulum"
                        qaButtonVariant = "outline"
                    }

                    const needsHodAction = (status === 'SUBMITTED' || status === 'REVISION_REQUESTED') && isHod

                    const historyEvents = []
                    if (statusRecord?.submittedAt) {
                        historyEvents.push({
                            id: 'submitted',
                            type: 'SUBMITTED',
                            date: new Date(statusRecord.submittedAt),
                            by: statusRecord.submittedBy,
                        })
                    }
                    if (statusRecord?.rejectedAt) {
                        historyEvents.push({
                            id: 'rejected',
                            type: 'REJECTED',
                            date: new Date(statusRecord.rejectedAt),
                            by: statusRecord.rejectedBy,
                        })
                    }
                    if (statusRecord?.approvedAt) {
                        historyEvents.push({
                            id: 'approved',
                            type: 'APPROVED',
                            date: new Date(statusRecord.approvedAt),
                            by: statusRecord.approvedBy,
                        })
                    }
                    if (statusRecord?.revisionRequestedAt) {
                        historyEvents.push({
                            id: 'revision_requested',
                            type: 'REVISION_REQUESTED',
                            date: new Date(statusRecord.revisionRequestedAt),
                            by: statusRecord.revisionRequestedBy,
                            note: statusRecord.revisionRequestNote,
                            result: statusRecord.revisionRequestResult,
                            resultAt: statusRecord.revisionResultAt,
                        })
                    }
                    // Sort history events by date (newest first)
                    historyEvents.sort((a, b) => b.date.getTime() - a.date.getTime())

                    return (
                        <Card key={year.id} className={`relative overflow-hidden transition-shadow hover:shadow-md ${
                            needsHodAction ? 'border-blue-300 shadow-blue-100 shadow-md' : ''
                        }`}>
                            {/* Highlight stripe for HoD when action is needed */}
                            {needsHodAction && (
                                <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-lg ${
                                    status === 'REVISION_REQUESTED' ? 'bg-amber-500' : 'bg-blue-500'
                                }`} />
                            )}
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle>{year.name}</CardTitle>
                                    {year.isActive && <Badge variant="secondary" className="bg-blue-100 text-blue-800">Default</Badge>}
                                </div>
                                <CardDescription className="line-clamp-2 mt-1 min-h-10">
                                    {year.startYear && year.endYear ? `Masa Berlaku: ${year.startYear}-${year.endYear}` : 'Periode penyusunan kurikulum'}
                                    {year.description && <span className="block mt-1 text-xs text-muted-foreground">{year.description}</span>}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Status:</span>
                                    {statusBadge}
                                </div>
                                {/* History Timeline */}
                                {historyEvents.length > 0 && (
                                    <div className="border-t pt-3 space-y-2">
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Riwayat</p>
                                        <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                                            {historyEvents.map((event) => (
                                                <div key={event.id} className="flex items-start gap-2">
                                                    {event.type === 'SUBMITTED' && <div className="mt-0.5 w-2 h-2 rounded-full bg-blue-400 shrink-0" />}
                                                    {event.type === 'REJECTED' && <div className="mt-0.5 w-2 h-2 rounded-full bg-red-400 shrink-0" />}
                                                    {event.type === 'APPROVED' && <div className="mt-0.5 w-2 h-2 rounded-full bg-green-500 shrink-0" />}
                                                    {event.type === 'REVISION_REQUESTED' && <div className="mt-0.5 w-2 h-2 rounded-full bg-amber-400 shrink-0" />}
                                                    
                                                    <div>
                                                        <p className={`text-xs font-medium ${
                                                            event.type === 'SUBMITTED' ? 'text-blue-700' : 
                                                            event.type === 'REJECTED' ? 'text-red-700' : 
                                                            event.type === 'APPROVED' ? 'text-green-700' : 
                                                            'text-amber-700'
                                                        }`}>
                                                            {event.type === 'SUBMITTED' ? 'Diajukan' : 
                                                             event.type === 'REJECTED' ? 'Dikembalikan (Revisi)' : 
                                                             event.type === 'APPROVED' ? 'Disetujui' : 
                                                             'Permintaan Revisi'}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">{event.date.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                                        {event.by && <p className="text-xs text-muted-foreground">oleh: <span className="font-medium text-foreground">{actorMap[event.by] || event.by}</span></p>}
                                                        
                                                        {event.type === 'REVISION_REQUESTED' && event.note && (
                                                            <p className="text-xs italic text-muted-foreground mt-0.5 border-l-2 border-amber-300 pl-1.5">&ldquo;{event.note}&rdquo;</p>
                                                        )}
                                                        {event.type === 'REVISION_REQUESTED' && event.resultAt && (
                                                            <p className={`text-xs font-medium mt-0.5 ${event.result === 'APPROVED' ? 'text-green-700' : 'text-red-600'}`}>
                                                                → {event.result === 'APPROVED' ? 'Revisi Diizinkan' : 'Permintaan Ditolak'}
                                                                {' '}({new Date(event.resultAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })})
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter>
                                {isHod ? (
                                    /* === KETUA DEPARTEMEN: Approval/Revision Actions === */
                                    <CurriculumApprovalCardActions
                                        departmentId={departmentId!}
                                        yearId={year.id}
                                        status={status}
                                        activeRole={activeRole}
                                        activeHeadId={department?.activeHeadId || undefined}
                                        userId={user?.id}
                                    />
                                ) : (
                                    /* === QA: Edit/Build Actions === */
                                    <div className="flex flex-col gap-2 w-full">
                                        {status === 'APPROVED' && user?.id ? (
                                            /* APPROVED: side-by-side layout */
                                            <div className="flex gap-2 w-full">
                                                <Button
                                                    variant="outline"
                                                    className="flex-1"
                                                    asChild
                                                >
                                                    <Link href={`/qa/curriculum/builder?yearId=${year.id}`}>
                                                        <CheckCheck className="w-4 h-4 mr-2" />
                                                        Lihat
                                                    </Link>
                                                </Button>
                                                <CurriculumRevisionRequestButton
                                                    departmentId={departmentId!}
                                                    yearId={year.id}
                                                    userId={user.id}
                                                />
                                            </div>
                                        ) : (
                                            /* Other statuses: full-width button */
                                            <Button
                                                variant={qaButtonVariant}
                                                className="w-full"
                                                disabled={qaIsDisabled}
                                                asChild={!qaIsDisabled}
                                            >
                                                {qaIsDisabled ? (
                                                    <span className="flex items-center justify-center w-full">
                                                        {qaActionIcon}{qaActionText}
                                                    </span>
                                                ) : (
                                                    <Link href={`/qa/curriculum/builder?yearId=${year.id}`}>
                                                        {qaActionIcon}{qaActionText}
                                                        <ArrowRight className="w-4 h-4 ml-auto" />
                                                    </Link>
                                                )}
                                            </Button>
                                        )}
                                        {status === 'APPROVED' && departmentId && (
                                            <SetDefaultCurriculumButton yearId={year.id} departmentId={departmentId} isActive={year.isActive} />
                                        )}
                                    </div>
                                )}
                            </CardFooter>
                        </Card>
                    )
                })}

                {curriculumYears.length === 0 && (
                    <div className="col-span-3 text-center py-16 text-muted-foreground">
                        <p className="text-lg font-medium">Belum ada Tahun Kurikulum</p>
                        <p className="text-sm mt-1">
                            {isHod ? 'Minta tim QA untuk membuat tahun kurikulum terlebih dahulu.' : 'Klik tombol "Tambah Tahun Kurikulum" untuk memulai.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
