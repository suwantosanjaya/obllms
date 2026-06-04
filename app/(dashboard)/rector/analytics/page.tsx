import { getSessionUser } from '@/app/actions/userActions'
import { getRectorAnalytics } from '@/app/actions/qaAnalyticsActions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, TrendingUp, TrendingDown } from 'lucide-react'

export default async function RectorAnalyticsPage() {
    const sessionUser = await getSessionUser()
    if (!sessionUser) return <div>Unauthorized</div>

    const { success, universityName, faculties, error } = await getRectorAnalytics(sessionUser.id)

    if (!success) {
        return <div className="p-8 text-center text-red-500">{error || 'Gagal memuat analitik.'}</div>
    }

    // Sort faculties by average (lowest first to identify critical)
    const sortedFaculties = [...(faculties || [])].sort((a, b) => {
        if (a.average === null) return 1
        if (b.average === null) return -1
        return a.average - b.average
    })

    const criticalFac = sortedFaculties[0] && sortedFaculties[0].average !== null ? sortedFaculties[0] : null
    const topFac = [...sortedFaculties].reverse()[0] && [...sortedFaculties].reverse()[0].average !== null ? [...sortedFaculties].reverse()[0] : null

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Analitik Tingkat Universitas</h1>
                <p className="text-muted-foreground mt-1">Pemantauan capaian pembelajaran fakultas di {universityName}.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Fakultas Paling Kritis</CardTitle>
                        <TrendingDown className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        {criticalFac ? (
                            <>
                                <div className="text-xl font-bold text-orange-600 truncate" title={criticalFac.name}>{criticalFac.name}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Rata-rata Capaian: {(criticalFac.average as number).toFixed(2)}
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
                        <CardTitle className="text-sm font-medium">Fakultas Terbaik</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        {topFac ? (
                            <>
                                <div className="text-xl font-bold text-green-600 truncate" title={topFac.name}>{topFac.name}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Rata-rata Capaian: {(topFac.average as number).toFixed(2)}
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
                        <CardTitle className="text-sm font-medium">Total Fakultas</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{faculties?.length || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Di bawah {universityName}</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Capaian per Fakultas</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {faculties?.map((fac: any) => (
                            <div key={fac.id} className="p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
                                <h3 className="font-semibold text-lg truncate" title={fac.name}>{fac.name}</h3>
                                <div className="mt-2 flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Rata-rata:</span>
                                    <span className={`font-bold ${fac.average !== null && fac.average < 50 ? 'text-orange-600' : 'text-primary'}`}>
                                        {fac.average !== null ? (fac.average as number).toFixed(2) : 'N/A'}
                                    </span>
                                </div>
                                <div className="mt-1 flex justify-between items-center text-xs text-muted-foreground">
                                    <span>Total Penilaian:</span>
                                    <span>{fac.scoreCount}</span>
                                </div>
                            </div>
                        ))}
                        {(!faculties || faculties.length === 0) && (
                            <p className="text-muted-foreground">Tidak ada data fakultas.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
