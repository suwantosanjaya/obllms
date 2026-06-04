import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Server, Users, Shield, Settings, GraduationCap, Building2, UserCog, Database } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { getAdminDashboardStats } from '@/app/actions/adminActions'
import Link from 'next/link'

export default async function AdminDashboard() {
    const stats = await getAdminDashboardStats()
    const activeRolesCount = Object.values(stats.breakdown).filter(count => count > 0).length

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard Admin Sistem</h1>
                    <p className="text-muted-foreground mt-1">Manajemen infrastruktur, pengguna, dan konfigurasi OBL LMS.</p>
                </div>
            </div>

            {/* Admin Quick Stats */}
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Pengguna</CardTitle>
                        <Users className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString('id-ID')}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {stats.breakdown.student} Mhs, {stats.breakdown.teacher} Dsn, {stats.breakdown.qa} QA, {stats.breakdown.admin} Adm
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Institusi</CardTitle>
                        <Building2 className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.institutions.universities.toLocaleString('id-ID')}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {stats.institutions.faculties} Fakultas, {stats.institutions.departments} Program Studi
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Status Server</CardTitle>
                        <Server className={`h-4 w-4 ${stats.serverStats.status === 'Normal' ? 'text-green-500' : 'text-red-500'}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.serverStats.status}</div>
                        <p className="text-xs text-muted-foreground mt-1">Uptime: {stats.serverStats.uptime} • RAM: {stats.serverStats.memoryUsagePercent}%</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 grid-cols-1">
                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Aksi Cepat</CardTitle>
                        <CardDescription>Akses cepat ke fitur-fitur administrasi utama.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Button className="w-full" asChild>
                                <Link href="/admin/users"><Users className="w-4 h-4 mr-2" /> Kelola Pengguna</Link>
                            </Button>
                            <Button className="w-full" variant="secondary" asChild>
                                <Link href="/admin/institutions"><Building2 className="w-4 h-4 mr-2" /> Kelola Institusi</Link>
                            </Button>
                            <Button className="w-full" variant="outline" asChild>
                                <Link href="/admin/settings"><Settings className="w-4 h-4 mr-2" /> Pengaturan Sistem</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
