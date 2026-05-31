import { getAllUsers } from '@/app/actions/adminActions'
import prisma from '@/lib/db'
import { CreateUserDialog } from '@/app/components/admin/CreateUserDialog'
import { UserTableClient } from '@/app/components/admin/UserTableClient'
import { getSessionUser } from '@/app/actions/userActions'
import { redirect } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ApprovalTableClient from '@/app/components/admin/ApprovalTableClient'
import { getPendingApprovals } from '@/app/actions/authActions'
import { Badge } from '@/components/ui/badge'

export default async function SuperAdminUsersPage() {
    const sessionUser = await getSessionUser()
    if (!sessionUser || sessionUser.activeRole !== 'super_admin') {
        redirect('/')
    }

    const allUsers = await getAllUsers()
    // Super admin only sees and manages "admin"
    const users = allUsers.filter((u: any) => u.role === 'admin')
    const departments = await prisma.department.findMany({ include: { faculty: true }, orderBy: { code: 'asc' } })

    const res = await getPendingApprovals('super_admin')
    const pendingUsers = res.success ? (res.pendingUsers || []) : []

    return (
        <div className="flex flex-col gap-6 w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manajemen Administrator Global</h1>
                    <p className="text-muted-foreground mt-1">Kelola data Administrator Global tingkat universitas dan persetujuan akun.</p>
                </div>
                <CreateUserDialog departments={departments} allowedRoles={['admin']} />
            </div>

            <Tabs defaultValue="users" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="users">Semua Admin</TabsTrigger>
                    <TabsTrigger value="approvals" className="flex items-center gap-2">
                        Persetujuan Registrasi
                        {pendingUsers.length > 0 && (
                            <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center rounded-full text-xs">
                                {pendingUsers.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="users" className="mt-0">
                    <UserTableClient 
                        users={users} 
                        departments={departments} 
                        allowedRoles={['admin']}
                        title="Daftar Administrator Global"
                        description="Menampilkan daftar Administrator Global yang aktif di sistem."
                    />
                </TabsContent>

                <TabsContent value="approvals" className="mt-0">
                    <ApprovalTableClient initialUsers={pendingUsers} currentUserId={sessionUser.id} activeRole="super_admin" />
                </TabsContent>
            </Tabs>
        </div>
    )
}
