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
import { getQADashboardMetrics } from '@/app/actions/obeActions'
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

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard Quality Assurance (Departemen)</h1>
                    <p className="text-muted-foreground mt-1">Pemantauan keselarasan kurikulum (PLO-CLO) dan metrik kualitas.</p>
                </div>
            </div>

            {/* QA Quick Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Mata Kuliah Teralign</CardTitle>
                        <CheckSquare className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics?.alignmentRate}%</div>
                        <p className="text-xs text-muted-foreground mt-1">Sesuai standar OBL</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Usulan Perubahan</CardTitle>
                        <FileSearch className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics?.reviewNeededCount}</div>
                        <p className="text-xs text-muted-foreground mt-1">Mata kuliah butuh review</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Jadwal Mata Kuliah</CardTitle>
                        <CalendarClock className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold mt-1">
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/qa/schedules">Kelola Jadwal</Link>
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Pengaturan jadwal dosen</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Monitoring PLO</CardTitle>
                        <BookOpen className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics?.totalPlosMeasured}/{metrics?.totalPlos}</div>
                        <p className="text-xs text-muted-foreground mt-1">PLO diukur semester ini</p>
                    </CardContent>
                </Card>
            </div>

            {/* Alignment Review Table */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Tinjauan Keselarasan Kurikulum (CLO vs PLO)</CardTitle>
                            <CardDescription>
                                Review pemetaan mata kuliah terhadap Program Learning Outcomes (PLO).
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Kode MK</TableHead>
                                    <TableHead>Mata Kuliah</TableHead>
                                    <TableHead>Dosen Pengampu</TableHead>
                                    <TableHead>Pemetaan CLO</TableHead>
                                    <TableHead>Status QA</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {metrics?.reviewTableData.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            Belum ada data mata kuliah.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    metrics?.reviewTableData.map((row: any) => (
                                        <TableRow key={row.id}>
                                            <TableCell className="font-medium">{row.code}</TableCell>
                                            <TableCell>{row.title}</TableCell>
                                            <TableCell>{row.instructors}</TableCell>
                                            <TableCell>{row.alignmentPercentage}% ({row.mappedCloCount} dari {row.cloCount} CLO dipetakan)</TableCell>
                                            <TableCell>
                                                {row.status === 'Approved' ? (
                                                    <Badge className="bg-green-500">Approved</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-orange-500 border-orange-500">Review</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm">Detail</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
