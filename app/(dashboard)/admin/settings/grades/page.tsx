import { getGradeScales } from '@/app/actions/gradeScaleActions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GradeScaleClient } from './GradeScaleClient'
import { getSessionUser } from '@/app/actions/userActions'
import { redirect } from 'next/navigation'
import { ShieldAlert } from 'lucide-react'

export default async function GradeSettingsPage() {
    // Only admin role can access this page
    const sessionUser = await getSessionUser()
    const userRole = sessionUser?.activeRole || sessionUser?.role

    if (!sessionUser || !['admin', 'super_admin'].includes(userRole || '')) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center p-8">
                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                    <ShieldAlert className="w-8 h-8 text-destructive" />
                </div>
                <h2 className="text-xl font-semibold">Akses Ditolak</h2>
                <p className="text-muted-foreground max-w-sm">
                    Halaman ini hanya dapat diakses oleh Admin Universitas. Rentang nilai dikelola secara terpusat
                    untuk menjaga konsistensi skala penilaian di seluruh program studi.
                </p>
            </div>
        )
    }

    const res = await getGradeScales()
    const scales = res.success ? res.data : []

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Pengaturan Rentang Nilai</h2>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Rentang Nilai Global (Grade Scale)</CardTitle>
                    <CardDescription>Atur batas konversi skor numerik menjadi nilai huruf (A, B, C, dll) serta bobot point (GPA). Pengaturan ini berlaku untuk seluruh program studi di universitas.</CardDescription>
                </CardHeader>
                <CardContent>
                    <GradeScaleClient initialScales={scales} />
                </CardContent>
            </Card>
        </div>
    )
}
