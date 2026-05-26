import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users } from 'lucide-react'
import { Button } from "@/components/ui/button"
import Link from 'next/link'

export default function SuperAdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Super Administrator Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Manage Admin Departemenistrator accounts. Add, edit, delete or deactivate admin users.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Admin Users
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Kelola Admin</div>
            <p className="text-xs text-muted-foreground mt-1">
              Manajemen hak akses Admin Departemen
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader>
             <CardTitle>Aksi Cepat</CardTitle>
             <CardDescription>Jalan pintas untuk manajemen admin.</CardDescription>
          </CardHeader>
          <CardContent>
             <Link href="/super_admin/users">
                 <Button className="w-full">Kelola User Admin</Button>
             </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
