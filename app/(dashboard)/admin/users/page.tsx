import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { getAllUsers } from '@/app/actions/adminActions'
import { CreateUserDialog } from '@/app/components/admin/CreateUserDialog'
import { DeleteUserButton } from '@/app/components/admin/DeleteUserButton'

export default async function AdminUsersPage() {
    const users = await getAllUsers()

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manajemen Pengguna</h1>
                    <p className="text-muted-foreground mt-1">Kelola data pengguna, role, dan hak akses sistem.</p>
                </div>
                <CreateUserDialog />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Daftar Pengguna Sistem</CardTitle>
                    <CardDescription>Menampilkan daftar Mahasiswa, Dosen, Admin, dan QA/Prodi.</CardDescription>
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
                                        Belum ada pengguna terdaftar di sistem.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user: { id: string, name: string, email: string, role: string, createdAt: Date }) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="capitalize">
                                                {user.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{new Date(user.createdAt).toLocaleDateString('id-ID')}</TableCell>
                                        <TableCell className="text-right">
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
