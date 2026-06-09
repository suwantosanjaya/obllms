'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { useClientTable } from '@/app/hooks/useClientTable'
import { DataTablePagination } from '../ui/data-table-pagination'
import { DeleteUserButton } from '@/app/components/admin/DeleteUserButton'
import { ToggleUserStatusButton } from '@/app/components/admin/ToggleUserStatusButton'
import { EditUserRoleDialog } from '@/app/components/admin/EditUserRoleDialog'
import { ResetPasswordButton } from '@/app/components/admin/ResetPasswordButton'
import { SortableTableHead } from '@/app/components/ui/sortable-table-head'

const roleMap: Record<string, string> = {
    super_admin: 'Super Administrator',
    admin: 'Administrator (Universitas)',
    qa: 'Quality Assurance (Program Studi)',
    teacher: 'Dosen',
    student: 'Mahasiswa',
    dean: 'Dekan',
    rector: 'Rektor'
}

export function UserTableClient({ users, departments, universities = [], allowedRoles, title, description, hideEditRole }: { users: any[], departments: any[], universities?: any[], allowedRoles: string[], title: string, description: string, hideEditRole?: boolean }) {
    const {
        searchQuery,
        setSearchQuery,
        pageIndex,
        setPageIndex,
        pageSize,
        setPageSize,
        paginatedData,
        totalItems,
        sortConfig,
        handleSort
    } = useClientTable(users, (u: any) => `${u.name} ${u.email} ${u.role}`)

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <Input 
                        placeholder="Cari pengguna (nama, email, role)..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="max-w-sm h-8"
                    />
                </div>
                <div className="border rounded-md overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">No</TableHead>
                                <SortableTableHead label="Nama" sortKey="name" currentSort={sortConfig} onSort={handleSort} />
                                <SortableTableHead label="Email" sortKey="email" currentSort={sortConfig} onSort={handleSort} />
                                <SortableTableHead label="Peran" sortKey="role" currentSort={sortConfig} onSort={handleSort} />
                                <SortableTableHead label="Dibuat Pada" sortKey="createdAt" currentSort={sortConfig} onSort={handleSort} />
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        Data pengguna tidak ditemukan.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedData.map((user: any, index: number) => (
                                    <TableRow key={user.id} className={!user.isActive ? 'opacity-50 grayscale' : ''}>
                                        <TableCell className="font-medium">{(pageIndex * pageSize) + index + 1}</TableCell>
                                        <TableCell className="font-medium">
                                            <div className="flex flex-col">
                                                <span>
                                                    {user.name}
                                                    {!user.isActive && <span className="ml-2 text-xs text-destructive">(Nonaktif)</span>}
                                                </span>
                                                {( (user.departments && user.departments.length > 0) || (user.universityRoles && user.universityRoles.length > 0) ) && (
                                                    <span className="text-[10px] text-muted-foreground font-normal mt-1 leading-tight break-words whitespace-normal max-w-[250px] sm:max-w-xs">
                                                        {(() => {
                                                            const isAdmin = user.role.split(',').map((r: string) => r.trim()).includes('admin');
                                                            
                                                            if (isAdmin) {
                                                                const uniqueUnivs = (user.universityRoles || []).map((ur: any) => {
                                                                    const u = universities?.find((univ: any) => univ.id === ur.universityId);
                                                                    return u ? u.name : null;
                                                                }).filter(Boolean);
                                                                
                                                                return uniqueUnivs.length > 0 ? uniqueUnivs.join(', ') : 'Administrator Global';
                                                            } else {
                                                                const fullDepts = (user.departments || []).map((d: any) => departments.find((dept: any) => dept.id === d.id)).filter(Boolean);
                                                                const byUniv: Record<string, string[]> = {};
                                                                fullDepts.forEach((fd: any) => {
                                                                    const univName = fd.faculty?.university?.name || fd.faculty?.name || '';
                                                                    const key = univName || 'Lainnya';
                                                                    if (!byUniv[key]) byUniv[key] = [];
                                                                    byUniv[key].push(fd.name);
                                                                });
                                                                return Object.keys(byUniv).map(univ => {
                                                                    const depts = byUniv[univ].join(', ');
                                                                    return univ !== 'Lainnya' ? `${depts} (${univ})` : depts;
                                                                }).join(' • ');
                                                            }
                                                        })()}
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {user.role.split(',').map((r: string) => (
                                                    <Badge key={r} variant="outline" className="capitalize">
                                                        {roleMap[r.trim()] || r.trim()}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell>{new Date(user.createdAt).toLocaleDateString('id-ID')}</TableCell>
                                        <TableCell className="text-right flex items-center justify-end gap-2">
                                            <ResetPasswordButton id={user.id} userName={user.name} />
                                            {!hideEditRole && <EditUserRoleDialog user={user} allowedRoles={allowedRoles} departments={departments} universities={universities} />}
                                            <ToggleUserStatusButton id={user.id} isActive={user.isActive} userName={user.name} />
                                            <DeleteUserButton id={user.id} userName={user.name} />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
                <DataTablePagination 
                    pageIndex={pageIndex}
                    pageSize={pageSize}
                    totalItems={totalItems}
                    onPageChange={setPageIndex}
                    onPageSizeChange={setPageSize}
                />
            </CardContent>
        </Card>
    )
}
