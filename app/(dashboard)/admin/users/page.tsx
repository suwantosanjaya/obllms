import { getAllUsers } from '@/app/actions/adminActions'
import prisma from '@/lib/db'
import { CreateUserDialog } from '@/app/components/admin/CreateUserDialog'
import { UserTableClient } from '@/app/components/admin/UserTableClient'
import { getSessionUser } from '@/app/actions/userActions'
import { redirect } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ApprovalTableClient from '@/app/components/admin/ApprovalTableClient'
import AccessRequestTable from '@/app/components/admin/AccessRequestTable'
import { getPendingApprovals } from '@/app/actions/authActions'
import { getPendingAccessRequests } from '@/app/actions/accessRequestActions'
import { Badge } from '@/components/ui/badge'

export default async function AdminUsersPage() {
    const sessionUser = await getSessionUser()
    if (!sessionUser || !['admin', 'qa'].includes(sessionUser.activeRole)) {
        redirect('/')
    }
    const { activeRole, activeDepartmentId } = sessionUser

    const allUsers = await getAllUsers()
    
    // Filter users list based on role
    const users = allUsers.filter((u: any) => {
        const roles = u.role.split(',').map((r: string) => r.trim())
        
        if (activeRole === 'qa') {
            // QA can only see teacher and student.
            // QAs cannot see other QA accounts.
            if (roles.includes('qa') || roles.includes('admin') || roles.includes('super_admin')) return false
            
            const hasAllowedRole = roles.some((r: string) => ['student', 'teacher'].includes(r))
            const inDept = u.homebaseDepartmentId === activeDepartmentId || 
                           u.departmentRoles?.some((dr: any) => dr.departmentId === activeDepartmentId)
            return hasAllowedRole && inDept
        }

        // Admin can see student, teacher, and qa
        return roles.some((r: string) => ['student', 'teacher', 'qa'].includes(r))
    })

    const departments = await prisma.department.findMany({ include: { faculty: true }, orderBy: { code: 'asc' } })

    const inactiveUsersCount = users.filter((u: any) => !u.isActive).length

    // Fetch Approval Data
    const res = await getPendingApprovals(activeRole, activeDepartmentId)
    const pendingUsers = res.success ? (res.pendingUsers || []) : []

    let pendingAccessRequests: any[] = []
    if (activeRole === 'qa' && activeDepartmentId) {
        const reqRes = await getPendingAccessRequests(activeDepartmentId)
        if (reqRes.success) pendingAccessRequests = reqRes.requests || []
    }

    return (
        <div className="flex flex-col gap-6 w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manajemen Pengguna</h1>
                    <p className="text-muted-foreground mt-1">Kelola data pengguna, persetujuan akun, dan hak akses sistem.</p>
                </div>
                {activeRole === 'admin' && (
                    <CreateUserDialog departments={departments} allowedRoles={['student', 'teacher', 'qa']} />
                )}
            </div>

            <Tabs defaultValue="users" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="users" className="flex items-center gap-2">
                        Semua Pengguna
                        {inactiveUsersCount > 0 && (
                            <Badge variant="secondary" className="h-5 min-w-5 px-1 flex items-center justify-center rounded-full text-xs">
                                {inactiveUsersCount}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="approvals" className="flex items-center gap-2">
                        Persetujuan Registrasi
                        {pendingUsers.length > 0 && (
                            <Badge variant="destructive" className="h-5 min-w-5 px-1 flex items-center justify-center rounded-full text-xs">
                                {pendingUsers.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                    {activeRole === 'qa' && (
                        <TabsTrigger value="access" className="flex items-center gap-2">
                            Permintaan Akses
                            {pendingAccessRequests.length > 0 && (
                                <Badge variant="destructive" className="h-5 min-w-5 px-1 flex items-center justify-center rounded-full text-xs">
                                    {pendingAccessRequests.length}
                                </Badge>
                            )}
                        </TabsTrigger>
                    )}
                </TabsList>

                <TabsContent value="users" className="mt-0">
                    <UserTableClient 
                        users={users} 
                        departments={departments} 
                        allowedRoles={['student', 'teacher', 'qa']}
                        title="Daftar Pengguna Sistem"
                        description={activeRole === 'qa' ? "Menampilkan daftar pengguna di departemen Anda." : "Menampilkan daftar Student, Teacher, dan QA/Department."}
                        hideEditRole={activeRole === 'qa'}
                    />
                </TabsContent>

                <TabsContent value="approvals" className="mt-0">
                    <ApprovalTableClient initialUsers={pendingUsers} currentUserId={sessionUser.id} activeRole={activeRole} />
                </TabsContent>

                {activeRole === 'qa' && (
                    <TabsContent value="access" className="mt-0">
                        <AccessRequestTable initialRequests={pendingAccessRequests} />
                    </TabsContent>
                )}
            </Tabs>
        </div>
    )
}
