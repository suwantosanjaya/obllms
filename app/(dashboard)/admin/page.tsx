import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Server, Users, Shield, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

export default function AdminDashboard() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard Admin Sistem</h1>
                    <p className="text-muted-foreground mt-1">Manajemen infrastruktur, pengguna, dan konfigurasi OBL LMS.</p>
                </div>
            </div>

            {/* Admin Quick Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Pengguna</CardTitle>
                        <Users className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12,450</div>
                        <p className="text-xs text-muted-foreground mt-1">Mahasiswa & Dosen</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Status Server</CardTitle>
                        <Server className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Normal</div>
                        <p className="text-xs text-muted-foreground mt-1">Uptime 99.98%</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Peran Aktif</CardTitle>
                        <Shield className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">4</div>
                        <p className="text-xs text-muted-foreground mt-1">Mahasiswa, Dosen, QA, Admin</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Konfigurasi Modul</CardTitle>
                        <Settings className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">30/30</div>
                        <p className="text-xs text-muted-foreground mt-1">Elemen OBL aktif</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Aksi Cepat Manajemen Pengguna</CardTitle>
                        <CardDescription>Tambah, edit, atau atur hak akses.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-4">
                            <Button className="w-full">Tambah Mahasiswa Baru</Button>
                            <Button className="w-full" variant="secondary">Tambah Dosen</Button>
                        </div>
                        <div className="flex gap-4">
                            <Button className="w-full" variant="outline">Import Data SIAKAD (CSV)</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Feature Flags / Configuration */}
                <Card>
                    <CardHeader>
                        <CardTitle>Konfigurasi Fitur Global (Feature Flags)</CardTitle>
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
            </div>
        </div>
    )
}
