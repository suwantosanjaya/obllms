import { getSessionUser } from '@/app/actions/userActions'
import { getDeanAnalytics } from '@/app/actions/qaAnalyticsActions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Building2, TrendingUp, TrendingDown } from 'lucide-react'

export default async function DeanAnalyticsPage() {
    const sessionUser = await getSessionUser()
    if (!sessionUser) return <div>Unauthorized</div>

    const { success, facultyName, departments, error } = await getDeanAnalytics(sessionUser.id)

    if (!success) {
        return <div className="p-8 text-center text-red-500">{error || 'Gagal memuat analitik.'}</div>
    }

    // Sort departments by average (lowest first to identify critical)
    const sortedDepts = [...(departments || [])].sort((a, b) => {
        if (a.average === null) return 1
        if (b.average === null) return -1
        return a.average - b.average
    })

    const criticalDept = sortedDepts[0] && sortedDepts[0].average !== null ? sortedDepts[0] : null
    const topDept = [...sortedDepts].reverse()[0] && [...sortedDepts].reverse()[0].average !== null ? [...sortedDepts].reverse()[0] : null

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Analitik Tingkat Fakultas</h1>
                <p className="text-muted-foreground mt-1">Pemantauan capaian pembelajaran program studi di bawah {facultyName}.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Program Studi Paling Kritis</CardTitle>
                        <TrendingDown className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        {criticalDept ? (
                            <>
                                <div className="text-xl font-bold text-orange-600 truncate" title={criticalDept.name}>{criticalDept.name}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Rata-rata Capaian: {(criticalDept.average as number).toFixed(2)}
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="text-xl font-bold text-muted-foreground">-</div>
                                <p className="text-xs text-muted-foreground mt-1">Belum ada data evaluasi</p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Program Studi Terbaik</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        {topDept ? (
                            <>
                                <div className="text-xl font-bold text-green-600 truncate" title={topDept.name}>{topDept.name}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Rata-rata Capaian: {(topDept.average as number).toFixed(2)}
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="text-xl font-bold text-muted-foreground">-</div>
                                <p className="text-xs text-muted-foreground mt-1">Belum ada data evaluasi</p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Program Studi</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{departments?.length || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Di bawah {facultyName}</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Capaian per Program Studi</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {departments?.map((dept: any) => (
                            <div key={dept.id} className="p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
                                <h3 className="font-semibold text-lg truncate" title={dept.name}>{dept.name}</h3>
                                <div className="mt-2 flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Rata-rata:</span>
                                    <span className={`font-bold ${dept.average !== null && dept.average < 50 ? 'text-orange-600' : 'text-primary'}`}>
                                        {dept.average !== null ? (dept.average as number).toFixed(2) : 'N/A'}
                                    </span>
                                </div>
                                <div className="mt-1 flex justify-between items-center text-xs text-muted-foreground">
                                    <span>Total Penilaian:</span>
                                    <span>{dept.scoreCount}</span>
                                </div>
                            </div>
                        ))}
                        {(!departments || departments.length === 0) && (
                            <p className="text-muted-foreground">Tidak ada data program studi.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
