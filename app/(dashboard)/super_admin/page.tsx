import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users, Server } from 'lucide-react'
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { getAdminDashboardStats } from '@/app/actions/adminActions'

export default async function SuperAdminDashboard() {
  const stats = await getAdminDashboardStats()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Super Administrator</h1>
        <p className="text-muted-foreground mt-1">
          Kelola akun Administrator Global. Tambah, edit, hapus, atau nonaktifkan akun administrator tingkat universitas.
        </p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Administrator Global
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.breakdown.admin}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Akun aktif di dalam sistem
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
        <Card>
          <CardHeader>
             <CardTitle>Aksi Cepat</CardTitle>
             <CardDescription>Jalan pintas untuk manajemen Administrator Global.</CardDescription>
          </CardHeader>
          <CardContent>
             <Link href="/super_admin/users">
                 <Button className="w-full">Kelola Administrator Global</Button>
             </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
