import { getGradeScales } from '@/app/actions/gradeScaleActions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GradeScaleClient } from './GradeScaleClient'

export default async function GradeSettingsPage() {
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
                    <CardDescription>Atur batas konversi skor numerik menjadi nilai huruf (A, B, C, dll) serta bobot point (GPA).</CardDescription>
                </CardHeader>
                <CardContent>
                    <GradeScaleClient initialScales={scales} />
                </CardContent>
            </Card>
        </div>
    )
}
