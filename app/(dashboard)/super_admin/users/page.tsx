import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { getAllUsers } from '@/app/actions/adminActions'
import prisma from '@/lib/db'
import { CreateUserDialog } from '@/app/components/admin/CreateUserDialog'
import { DeleteUserButton } from '@/app/components/admin/DeleteUserButton'
import { ToggleUserStatusButton } from '@/app/components/admin/ToggleUserStatusButton'

export default async function SuperAdminUsersPage() {
    const allUsers = await getAllUsers()
    // Super admin only sees and manages "admin"
    const users = allUsers.filter((u: any) => u.role === 'admin')
    const departments = await prisma.department.findMany({ include: { faculty: true }, orderBy: { code: 'asc' } })

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manajemen Admin Department</h1>
                    <p className="text-muted-foreground mt-1">Kelola data administrator tingkat department.</p>
                </div>
                <CreateUserDialog departments={departments} allowedRoles={['admin']} />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Daftar Admin Department</CardTitle>
                    <CardDescription>Menampilkan daftar Administrator Department yang aktif di sistem.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nama</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Peran</TableHead>
                                <TableHead>Dibuat Pada</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        Belum ada admin department terdaftar.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user: { id: string, name: string, email: string, role: string, createdAt: Date, isActive: boolean }) => (
                                    <TableRow key={user.id} className={!user.isActive ? 'opacity-50 grayscale' : ''}>
                                        <TableCell className="font-medium">
                                            {user.name}
                                            {!user.isActive && <span className="ml-2 text-xs text-destructive">(Nonaktif)</span>}
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="capitalize">
                                                {user.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{new Date(user.createdAt).toLocaleDateString('id-ID')}</TableCell>
                                        <TableCell className="text-right flex items-center justify-end gap-2">
                                            <ToggleUserStatusButton id={user.id} isActive={user.isActive} userName={user.name} />
                                            <DeleteUserButton id={user.id} userName={user.name} />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
