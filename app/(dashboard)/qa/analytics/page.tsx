import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getDepartmentCloAnalytics, getAvailableAngkatan } from '@/app/actions/qaAnalyticsActions'
import prisma from '@/lib/db'
import { BarChart, Users, TrendingUp, TrendingDown, Download } from 'lucide-react'

import { getSessionUser } from '@/app/actions/userActions'
import { getCurriculumYears } from '@/app/actions/obeActions'
import { QAAnalyticsFilter } from '@/app/components/qa/QAAnalyticsFilter'
import { AngkatanProfileClient } from '@/app/components/qa/AngkatanProfileClient'

export default async function QaAnalyticsPage({
    searchParams,
}: {
    searchParams: Promise<{ angkatan?: string, curriculumId?: string }>
}) {
    const params = await searchParams
    const sessionUser = await getSessionUser()
    const departmentId = sessionUser?.activeDepartmentId

    if (!departmentId) {
        return <div className="p-8 text-center text-muted-foreground">Pilih Departemen terlebih dahulu.</div>
    }

    const angkatanRes = await getAvailableAngkatan(departmentId)
    const angkatanList = angkatanRes.success ? (angkatanRes.angkatan || []) : []
    const angkatanFilter = params.angkatan ? parseInt(params.angkatan) : (angkatanList.length > 0 ? angkatanList[0] : undefined)

    const curriculumYears = await getCurriculumYears(departmentId, true) || []
    
    // Default to active curriculum, or most recent if none active
    const activeCurriculum = curriculumYears.find((c: any) => c.isActive) || curriculumYears[0]
    const activeCurriculumId = params.curriculumId || (activeCurriculum ? activeCurriculum.id : undefined)

    const { success, clos, angkatanProfiles, studentCount } = await getDepartmentCloAnalytics(departmentId, angkatanFilter, activeCurriculumId)

    if (!success) {
        return <div className="p-8 text-center text-red-500">Gagal memuat analitik.</div>
    }

    // Sort CLOs by code for display
    const sortedClos = (clos || []).sort((a: any, b: any) => a.code.localeCompare(b.code))

    // Find the most critical CLO (lowest average)
    let criticalClo: any = null
    sortedClos.forEach((c: any) => {
        if (c.average !== null) {
            if (!criticalClo || c.average < criticalClo.average) {
                criticalClo = c
            }
        }
    })

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Analitik Capaian Pembelajaran</h1>
                    <p className="text-muted-foreground mt-1">Pantau performa penguasaan CLO mahasiswa di seluruh program studi.</p>
                </div>
                <QAAnalyticsFilter curriculumYears={curriculumYears} angkatanList={angkatanList} activeCurriculumId={activeCurriculumId} activeAngkatan={angkatanFilter} />
            </div>

            {/* Top Metrics */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">CLO Paling Kritis</CardTitle>
                        <TrendingDown className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        {criticalClo ? (
                            <>
                                <div className="text-2xl font-bold text-orange-600">{criticalClo.code}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Rata-rata: {parseFloat(criticalClo.average).toFixed(1)} (Perlu Evaluasi)
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="text-2xl font-bold text-muted-foreground">-</div>
                                <p className="text-xs text-muted-foreground mt-1">Belum ada data evaluasi</p>
                            </>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Mahasiswa Diukur</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{studentCount}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {angkatanFilter ? `Di angkatan ${angkatanFilter}` : 'Total mahasiswa aktif'}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total CLO Diukur</CardTitle>
                        <BarChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{sortedClos.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">Capaian Pembelajaran Mata Kuliah</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6">
                {/* Angkatan Trend */}
                <Card>
                    <CardHeader>
                        <CardTitle>Rata-rata CLO per angkatan</CardTitle>
                        <CardDescription>Perbandingan rincian nilai seluruh CLO per angkatan.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AngkatanProfileClient angkatanProfiles={angkatanProfiles || []} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
