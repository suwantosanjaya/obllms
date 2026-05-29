import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getDepartmentCloAnalytics } from '@/app/actions/qaAnalyticsActions'
import prisma from '@/lib/db'
import { BarChart, Users, TrendingUp } from 'lucide-react'

export default async function QaAnalyticsPage({
    searchParams,
}: {
    searchParams: Promise<{ angkatan?: string }>
}) {
    const params = await searchParams
    const angkatanFilter = params.angkatan ? parseInt(params.angkatan) : undefined

    // For now, get the first department (in a real app, this would be the QA's active department)
    const qaUser = await prisma.user.findFirst({ where: { role: 'qa' }, include: { departments: true } })
    const departmentId = qaUser?.departments[0]?.id

    if (!departmentId) {
        return <div className="p-8 text-center text-muted-foreground">Departemen tidak ditemukan.</div>
    }

    const { success, clos, angkatanAverages, studentCount } = await getDepartmentCloAnalytics(departmentId, angkatanFilter)

    if (!success) {
        return <div className="p-8 text-center text-red-500">Gagal memuat analitik.</div>
    }

    // Sort CLOs by code for display
    const sortedClos = (clos || []).sort((a: any, b: any) => a.code.localeCompare(b.code))

    // Calculate department overall average
    let totalAvg = 0
    let validCount = 0
    sortedClos.forEach((c: any) => {
        if (c.average !== null) {
            totalAvg += c.average
            validCount++
        }
    })
    const deptAverage = validCount > 0 ? (totalAvg / validCount).toFixed(1) : '-'

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Analitik Capaian Pembelajaran (OBE)</h1>
                <p className="text-muted-foreground mt-1">Pantau performa penguasaan CLO mahasiswa di seluruh program studi.</p>
            </div>

            {/* Top Metrics */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Rata-Rata Fakultas/Prodi</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">{deptAverage}</div>
                        <p className="text-xs text-muted-foreground mt-1">Dari semua CLO yang dievaluasi</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Mahasiswa Terlibat</CardTitle>
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

            <div className="grid gap-6 md:grid-cols-3">
                {/* CLO Breakdown */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Performa per CLO</CardTitle>
                        <CardDescription>Rata-rata nilai penguasaan setiap Capaian Pembelajaran secara agregat.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {sortedClos.length === 0 ? (
                                <p className="text-muted-foreground italic text-center py-4">Belum ada data CLO.</p>
                            ) : (
                                sortedClos.map((clo: any) => {
                                    let barColor = "bg-slate-200"
                                    let textColor = "text-muted-foreground"
                                    const val = clo.average !== null ? parseFloat(clo.average) : 0
                                    
                                    if (clo.average !== null) {
                                        if (val >= 80) {
                                            barColor = "bg-green-500"
                                            textColor = "text-green-700"
                                        } else if (val >= 60) {
                                            barColor = "bg-orange-500"
                                            textColor = "text-orange-700"
                                        } else {
                                            barColor = "bg-red-500"
                                            textColor = "text-red-700"
                                        }
                                    }

                                    return (
                                        <div key={clo.id} className="flex flex-col gap-2">
                                            <div className="flex justify-between items-end">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="font-mono bg-muted/50">{clo.code}</Badge>
                                                    <span className="text-sm font-medium line-clamp-1 flex-1">{clo.description}</span>
                                                </div>
                                                <div className="flex flex-col items-end shrink-0 ml-4">
                                                    <span className={`text-xl font-bold ${textColor}`}>
                                                        {clo.average !== null ? parseFloat(clo.average).toFixed(1) : '-'}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            {/* Progress Bar */}
                                            <div className="w-full bg-slate-100 rounded-full h-2">
                                                <div 
                                                    className={`${barColor} h-2 rounded-full transition-all`} 
                                                    style={{ width: `${val}%` }}
                                                ></div>
                                            </div>
                                            <div className="flex justify-between text-[10px] text-muted-foreground">
                                                <span>Diukur pada {clo.studentCount} mahasiswa</span>
                                                <span>{clo.submissionCount} data nilai</span>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Angkatan Trend */}
                <Card>
                    <CardHeader>
                        <CardTitle>Tren Angkatan</CardTitle>
                        <CardDescription>Perbandingan agregat nilai CLO antar angkatan.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {(!angkatanAverages || angkatanAverages.length === 0) ? (
                                <p className="text-muted-foreground italic text-center py-4 text-sm">Data angkatan belum tersedia.</p>
                            ) : (
                                angkatanAverages.map((a: any) => (
                                    <div key={a.angkatan} className="flex justify-between items-center p-3 border rounded-lg bg-card hover:bg-muted/30 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-primary/10 text-primary font-bold px-2 py-1 rounded text-sm">
                                                {a.angkatan}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-xs text-muted-foreground mb-0.5">Rata-Rata</span>
                                            <span className="font-bold text-lg">{a.average.toFixed(1)}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
