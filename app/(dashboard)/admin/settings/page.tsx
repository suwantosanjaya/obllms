import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function AdminSettingsPage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Pengaturan Sistem</h1>
                    <p className="text-muted-foreground mt-1">Konfigurasi global LMS.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Pengaturan Universitas</CardTitle>
                    <CardDescription>Manajemen pengaturan level universitas akan ditambahkan di sini.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Pilih menu di sidebar untuk mengelola pengguna, program studi, dan fakultas.</p>
                </CardContent>
            </Card>
        </div>
    )
}
