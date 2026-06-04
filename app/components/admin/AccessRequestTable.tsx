'use client'

import { useState } from 'react'
import { processAccessRequest } from '@/app/actions/accessRequestActions'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Check, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { useClientTable } from '@/app/hooks/useClientTable'
import { DataTablePagination } from '@/app/components/ui/data-table-pagination'
import { Search } from 'lucide-react'
import { SortableTableHead } from '@/app/components/ui/sortable-table-head'

export default function AccessRequestTable({ initialRequests }: { initialRequests: any[] }) {
    const [requests, setRequests] = useState(initialRequests)
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const { toast } = useToast()

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
    } = useClientTable(requests, (r: any) => `${r.user?.name} ${r.user?.email} ${r.user?.homebaseDepartment?.name || ''}`)

    const handleAction = async (id: string, action: 'APPROVED' | 'REJECTED') => {
        setLoadingId(id)
        const res = await processAccessRequest(id, action)
        setLoadingId(null)

        if (res.success) {
            toast({ title: 'Berhasil', description: `Pengajuan berhasil di-${action.toLowerCase()}` })
            setRequests(requests.filter(r => r.id !== id))
        } else {
            toast({ title: 'Gagal', description: res.error, variant: 'destructive' })
        }
    }

    if (requests.length === 0) return null

    return (
        <Card className="mt-8 shadow-md">
            <CardHeader className="bg-blue-50/30 dark:bg-transparent border-b">
                <CardTitle className="text-xl text-blue-800 dark:text-foreground">Permintaan Akses Lintas Program Studi</CardTitle>
                <CardDescription>
                    Daftar dosen dari luar program studi atau Dosen Luar Biasa yang meminta akses untuk mengajar di program studi Anda.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
                <div className="flex items-center space-x-2">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <Input 
                        placeholder="Cari dosen..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="max-w-sm h-8"
                    />
                </div>
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <SortableTableHead label="Dosen" sortKey="user.name" currentSort={sortConfig} onSort={handleSort} />
                                <SortableTableHead label="Homebase Asli" sortKey="user.homebaseDepartment.name" currentSort={sortConfig} onSort={handleSort} />
                                <SortableTableHead label="Tanggal Pengajuan" sortKey="createdAt" currentSort={sortConfig} onSort={handleSort} />
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                        Data tidak ditemukan.
                                    </TableCell>
                                </TableRow>
                            ) : (
                            paginatedData.map((req: any) => (
                                <TableRow key={req.id}>
                                    <TableCell>
                                        <div className="font-medium">{req.user.name}</div>
                                        <div className="text-xs text-muted-foreground">{req.user.email}</div>
                                        {req.user.teacherProfile?.isDlb && (
                                            <Badge variant="outline" className="mt-1 text-[10px] bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800">DLB</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {req.user.homebaseDepartment?.name || '-'}
                                    </TableCell>
                                    <TableCell>
                                        {new Date(req.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 dark:text-emerald-400 dark:border-emerald-800"
                                                onClick={() => handleAction(req.id, 'APPROVED')}
                                                disabled={loadingId === req.id}
                                            >
                                                {loadingId === req.id ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Check className="w-4 h-4 mr-1" />}
                                                Setujui
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 dark:border-red-800"
                                                onClick={() => handleAction(req.id, 'REJECTED')}
                                                disabled={loadingId === req.id}
                                            >
                                                {loadingId === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4 mr-1" />}
                                                Tolak
                                            </Button>
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
            </CardContent>
        </Card>
    )
}
