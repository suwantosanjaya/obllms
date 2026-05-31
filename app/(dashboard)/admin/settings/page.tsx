import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getGradeScales } from '@/app/actions/gradeScaleActions'
import { getSystemSetting } from '@/app/actions/systemSettingActions'
import { GradeScaleClient } from '@/app/components/admin/GradeScaleClient'
import { AchievementThresholdClient } from '@/app/components/admin/SystemSettingClient'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

export default async function AdminSettingsPage() {
    const res = await getGradeScales()
    const scales = res.success ? (res.data ?? []) : []

    const passThreshold = await getSystemSetting('PASS_THRESHOLD', '70')
    const moderateThreshold = await getSystemSetting('MODERATE_THRESHOLD', '50')

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Pengaturan Sistem</h1>
                    <p className="text-muted-foreground mt-1">Konfigurasi global LMS.</p>
                </div>
            </div>

            <Tabs defaultValue="grades" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="grades">Rentang Nilai</TabsTrigger>
                    <TabsTrigger value="features">Fitur Global</TabsTrigger>
                </TabsList>
                
                <TabsContent value="grades" className="space-y-4">
                    <AchievementThresholdClient 
                        initialPass={passThreshold} 
                        initialModerate={moderateThreshold} 
                    />
                    <Card>
                        <CardHeader>
                            <CardTitle>Rentang Nilai Global (Grade Scale)</CardTitle>
                            <CardDescription>Atur batas konversi skor numerik menjadi nilai huruf (A, B, C, dll) serta bobot point (GPA). Pengaturan ini berlaku untuk seluruh program studi di universitas.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <GradeScaleClient initialScales={scales} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="features" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Konfigurasi Fitur Global</CardTitle>
                            <CardDescription>Mengaktifkan atau menonaktifkan elemen LMS secara global berdasarkan 30 elemen OBL.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Modul Self-Regulated Learning (SRL)</Label>
                                    <p className="text-sm text-muted-foreground">Aktifkan fitur penetapan tujuan & refleksi mandiri.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Gamifikasi & Progress Analytics</Label>
                                    <p className="text-sm text-muted-foreground">Tampilkan lencana dan leaderboard.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Sistem Peringatan Dini (Intervensi)</Label>
                                    <p className="text-sm text-muted-foreground">Analitik untuk mahasiswa berisiko (At-Risk).</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
