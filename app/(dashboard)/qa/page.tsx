import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileSearch, CheckSquare, LineChart, BookOpen, Search, CalendarClock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { getQADashboardMetrics, getCurriculumYears } from '@/app/actions/obeActions'
import { QAAlignmentTableClient } from '@/app/components/qa/QAAlignmentTableClient'
import { getSessionUser } from '@/app/actions/userActions'
import { redirect } from 'next/navigation'
import Link from 'next/link'
export default async function QADashboard() {
    const qaUser = await getSessionUser()
    if (!qaUser || !qaUser.roles?.includes('qa')) {
        redirect('/')
    }

    const metricsRes = await getQADashboardMetrics(qaUser.activeDepartmentId)
    const metrics = metricsRes.success ? metricsRes.metrics : {
        alignmentRate: 0,
        reviewNeededCount: 0,
        totalPlosMeasured: 0,
        totalPlos: 0,
        avgGradingTimeHours: 0,
        reviewTableData: []
    }

    const cyRes = await getCurriculumYears(qaUser.activeDepartmentId || undefined, true)
    const curriculumYears = cyRes || []

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard Quality Assurance (Program Studi)</h1>
                    <p className="text-muted-foreground mt-1">Pemantauan keselarasan kurikulum (PLO-CLO) dan metrik kualitas.</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Keselarasan Kurikulum</CardTitle>
                        <CheckSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics?.alignmentRate ?? 0}%</div>
                        <p className="text-xs text-muted-foreground">Mata Kuliah tersinkronisasi PLO-CLO</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">PLO Terukur</CardTitle>
                        <LineChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics?.totalPlosMeasured ?? 0} / {metrics?.totalPlos ?? 0}</div>
                        <p className="text-xs text-muted-foreground">PLO diukur dalam mata kuliah aktif</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Responsivitas Dosen</CardTitle>
                        <CalendarClock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics?.avgGradingTimeHours ?? 0} Jam</div>
                        <p className="text-xs text-muted-foreground">Rata-rata waktu penilaian tugas (SLA)</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Perlu Tinjauan</CardTitle>
                        <FileSearch className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics?.reviewNeededCount ?? 0}</div>
                        <p className="text-xs text-muted-foreground">Mata kuliah tanpa asesmen/CLO valid</p>
                    </CardContent>
                </Card>
            </div>

            {/* Alignment Review Table */}
            <QAAlignmentTableClient metrics={metrics!} curriculumYears={curriculumYears} />
        </div>
    )
}
