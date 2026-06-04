'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { processApproval } from '@/app/actions/authActions'
import { CheckCircle2, XCircle, Loader2, Search } from 'lucide-react'
import { ResetPasswordButton } from '@/app/components/admin/ResetPasswordButton'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useClientTable } from '@/app/hooks/useClientTable'
import { DataTablePagination } from '@/app/components/ui/data-table-pagination'
import { SortableTableHead } from '@/app/components/ui/sortable-table-head'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

export default function ApprovalTableClient({ initialUsers, currentUserId, activeRole }: { initialUsers: any[], currentUserId: string, activeRole: string }) {
    const { toast } = useToast()
    const [users, setUsers] = useState(initialUsers)
    const [loadingId, setLoadingId] = useState<string | null>(null)

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

    async function handleApproveReject(targetId: string, action: 'APPROVED' | 'REJECTED') {
        setLoadingId(targetId)
        const res = await processApproval(targetId, action, currentUserId)
        if (res.success) {
            toast({
                title: action === 'APPROVED' ? '✅ Akun Disetujui' : '❌ Akun Ditolak/Dinonaktifkan',
                description: action === 'APPROVED' ? 'Pengguna kini dapat login ke sistem.' : 'Akun pengguna telah dinonaktifkan.'
            })
            // Update user in list instead of removing
            setUsers(prev => prev.map(u => u.id === targetId ? { ...u, approvalStatus: action } : u))
        } else {
            toast({
                title: 'Gagal memproses',
                description: res.error,
                variant: 'destructive'
            })
        }
        setLoadingId(null)
    }

    if (users.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                    <CheckCircle2 className="w-10 h-10 mb-2 opacity-20" />
                    <p>Tidak ada permintaan registrasi yang menunggu persetujuan Anda.</p>
                </CardContent>
            </Card>
        )
    }

    const roleNameMap: Record<string, string> = {
        student: 'Mahasiswa',
        teacher: 'Dosen (Teacher)',
        qa: 'Tim QA',
        admin: 'Admin Program Studi',
        super_admin: 'Super Admin'
    }

    return (
        <Card className="p-4 space-y-4">
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
                            <SortableTableHead label="Nama Pengguna" sortKey="name" currentSort={sortConfig} onSort={handleSort} />
                            <SortableTableHead label="Email" sortKey="email" currentSort={sortConfig} onSort={handleSort} />
                            <SortableTableHead label="Role Diajukan" sortKey="role" currentSort={sortConfig} onSort={handleSort} />
                            <SortableTableHead label="Homebase" sortKey="homebaseDepartment.name" currentSort={sortConfig} onSort={handleSort} />
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    Data tidak ditemukan.
                                </TableCell>
                            </TableRow>
                        ) : (
                        paginatedData.map((u: any, i: number) => (
                            <TableRow key={u.id}>
                                <TableCell className="font-medium">{(pageIndex * pageSize) + i + 1}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">
                                            {u.teacherProfile?.gelarDepan ? `${u.teacherProfile.gelarDepan} ` : ''}
                                            {u.name}
                                            {u.teacherProfile?.gelarBelakang ? `, ${u.teacherProfile.gelarBelakang}` : ''}
                                        </span>
                                        {u.teacherProfile && (
                                            <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                                                {u.teacherProfile.nidn && <span>NIDN: {u.teacherProfile.nidn}</span>}
                                                {u.teacherProfile.nip && <span>NIP: {u.teacherProfile.nip}</span>}
                                            </div>
                                        )}
                                        {u.studentProfile && (
                                            <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                                                {u.studentProfile.nim && <span>NIM: {u.studentProfile.nim}</span>}
                                                {u.studentProfile.angkatan && <span>Angkatan: {u.studentProfile.angkatan}</span>}
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>{u.email}</TableCell>
                                <TableCell>
                                    <Badge variant="outline">{roleNameMap[u.role] || u.role}</Badge>
                                </TableCell>
                                <TableCell>
                                    {u.homebaseDepartment ? (
                                        <span className="text-sm">{u.homebaseDepartment.name}</span>
                                    ) : (
                                        <span className="text-sm text-muted-foreground italic">- (Tanpa Homebase) -</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end space-x-2">
                                        <ResetPasswordButton id={u.id} userName={u.name} />
                                        <Switch 
                                            id={`switch-${u.id}`} 
                                            checked={u.approvalStatus === 'APPROVED'}
                                            disabled={loadingId === u.id}
                                            onCheckedChange={(checked) => {
                                                handleApproveReject(u.id, checked ? 'APPROVED' : 'REJECTED')
                                            }}
                                        />
                                        <Label htmlFor={`switch-${u.id}`} className={`min-w-[70px] text-left ${u.approvalStatus === 'APPROVED' ? 'text-green-600' : 'text-muted-foreground'}`}>
                                            {loadingId === u.id ? <Loader2 className="w-4 h-4 animate-spin inline" /> : (u.approvalStatus === 'APPROVED' ? 'Aktif' : 'Nonaktif')}
                                        </Label>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )))}
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
        </Card>
    )
}
