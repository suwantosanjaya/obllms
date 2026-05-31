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
        reviewTableData: []
    }

    const cyRes = await getCurriculumYears(qaUser.activeDepartmentId || undefined)
    const curriculumYears = cyRes || []

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard Quality Assurance (Departemen)</h1>
                    <p className="text-muted-foreground mt-1">Pemantauan keselarasan kurikulum (PLO-CLO) dan metrik kualitas.</p>
                </div>
            </div>



            {/* Alignment Review Table */}
            <QAAlignmentTableClient metrics={metrics} curriculumYears={curriculumYears} />
        </div>
    )
}
