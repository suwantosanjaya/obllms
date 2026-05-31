'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Search, History, UserCheck } from 'lucide-react'
import { useClientTable } from '@/app/hooks/useClientTable'
import { DataTablePagination } from '../ui/data-table-pagination'
import {
    CreateUniversityDialog, EditUniversityDialog, DeleteUniversityDialog,
    CreateFacultyDialog, EditFacultyDialog, DeleteFacultyDialog,
    CreateDepartmentDialog, EditDepartmentDialog, DeleteDepartmentDialog
} from '@/app/components/admin/InstitutionDialogs'
import { SortableTableHead } from '@/app/components/ui/sortable-table-head'
import { assignDepartmentHead, getDepartmentHeadHistory } from '@/app/actions/adminActions'
import { useToast } from '@/hooks/use-toast'

export function UniversityTableClient({ universities }: { universities: any[] }) {
    const {
        searchQuery, setSearchQuery, pageIndex, setPageIndex,
        pageSize, setPageSize, paginatedData, totalItems,
        sortConfig, handleSort
    } = useClientTable(universities, (u: any) => `${u.code} ${u.name}`)

    return (
        <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <CardTitle>Universitas</CardTitle>
                    <CardDescription>Daftar semua universitas di dalam sistem.</CardDescription>
                </div>
                <CreateUniversityDialog />
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <Input 
                        placeholder="Cari universitas..." 
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
                                <SortableTableHead className="w-[100px]" label="Kode" sortKey="code" currentSort={sortConfig} onSort={handleSort} />
                                <SortableTableHead label="Nama" sortKey="name" currentSort={sortConfig} onSort={handleSort} />
                                <TableHead>Jumlah Fakultas</TableHead>
                                <TableHead className="w-[100px] text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        Data universitas tidak ditemukan.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedData.map((u: any, i: number) => (
                                    <TableRow key={u.id}>
                                        <TableCell className="font-medium">{(pageIndex * pageSize) + i + 1}</TableCell>
                                        <TableCell className="font-medium">{u.code}</TableCell>
                                        <TableCell>{u.name}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{u.faculties?.length || 0} Fakultas</Badge>
                                        </TableCell>
                                        <TableCell className="text-right flex justify-end gap-2">
                                            <EditUniversityDialog university={u} />
                                            <DeleteUniversityDialog id={u.id} name={u.name} />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
                <DataTablePagination 
                    pageIndex={pageIndex} pageSize={pageSize} totalItems={totalItems}
                    onPageChange={setPageIndex} onPageSizeChange={setPageSize}
                />
            </CardContent>
        </Card>
    )
}

export function FacultyTableClient({ faculties, universities }: { faculties: any[], universities: any[] }) {
    const {
        searchQuery, setSearchQuery, pageIndex, setPageIndex,
        pageSize, setPageSize, paginatedData, totalItems,
        sortConfig, handleSort
    } = useClientTable(faculties, (f: any) => `${f.code} ${f.name} ${f.university?.name || ''}`)

    return (
        <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <CardTitle>Fakultas</CardTitle>
                    <CardDescription>Kelola data fakultas dan relasinya dengan universitas.</CardDescription>
                </div>
                <CreateFacultyDialog universities={universities} />
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <Input 
                        placeholder="Cari fakultas..." 
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
                                <SortableTableHead className="w-[100px]" label="Kode" sortKey="code" currentSort={sortConfig} onSort={handleSort} />
                                <SortableTableHead label="Nama Fakultas" sortKey="name" currentSort={sortConfig} onSort={handleSort} />
                                <SortableTableHead label="Universitas" sortKey="university.name" currentSort={sortConfig} onSort={handleSort} />
                                <TableHead>Jumlah Departemen</TableHead>
                                <TableHead className="w-[100px] text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        Data fakultas tidak ditemukan.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedData.map((f: any, i: number) => (
                                    <TableRow key={f.id}>
                                        <TableCell className="font-medium">{(pageIndex * pageSize) + i + 1}</TableCell>
                                        <TableCell className="font-medium">{f.code}</TableCell>
                                        <TableCell>{f.name}</TableCell>
                                        <TableCell>
                                            {f.university ? (
                                                <span className="text-sm">{f.university.code} - {f.university.name}</span>
                                            ) : (
                                                <span className="text-sm text-muted-foreground italic">Tidak ada</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{f.departments?.length || 0} Departemen</Badge>
                                        </TableCell>
                                        <TableCell className="text-right flex justify-end gap-2">
                                            <EditFacultyDialog faculty={f} universities={universities} />
                                            <DeleteFacultyDialog id={f.id} name={f.name} />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
                <DataTablePagination 
                    pageIndex={pageIndex} pageSize={pageSize} totalItems={totalItems}
                    onPageChange={setPageIndex} onPageSizeChange={setPageSize}
                />
            </CardContent>
        </Card>
    )
}

export function DepartmentTableClient({ departments, faculties, candidatesMap = {} }: { departments: any[], faculties: any[], candidatesMap?: Record<string, any[]> }) {
    const { toast } = useToast()
    const [saving, setSaving] = useState<Record<string, boolean>>({})

    // Dialog state for assigning head
    const [assignDialogOpen, setAssignDialogOpen] = useState(false)
    const [selectedDep, setSelectedDep] = useState<any | null>(null)
    const [selectedUserId, setSelectedUserId] = useState<string>('')
    const [startYear, setStartYear] = useState(new Date().getFullYear().toString())
    const [endYear, setEndYear] = useState((new Date().getFullYear() + 4).toString())
    const [appointmentDate, setAppointmentDate] = useState(new Date().toISOString().split('T')[0])

    // Dialog state for history
    const [historyDialogOpen, setHistoryDialogOpen] = useState(false)
    const [histories, setHistories] = useState<any[]>([])
    const [historyLoading, setHistoryLoading] = useState(false)
    const [historyPage, setHistoryPage] = useState(1)
    const historyPageSize = 5
    const totalHistoryPages = Math.ceil(histories.length / historyPageSize)
    const paginatedHistories = histories.slice((historyPage - 1) * historyPageSize, historyPage * historyPageSize)

    const {
        searchQuery, setSearchQuery, pageIndex, setPageIndex,
        pageSize, setPageSize, paginatedData, totalItems,
        sortConfig, handleSort
    } = useClientTable(departments, (d: any) => `${d.code} ${d.name} ${d.faculty?.name || ''} ${d.activeHead?.name || ''}`)

    function initiateAssign(dep: any, userId: string) {
        if (userId === 'none') {
            handleConfirmAssign(dep, null)
        } else {
            setSelectedDep(dep)
            setSelectedUserId(userId)
            setAssignDialogOpen(true)
        }
    }

    async function handleConfirmAssign(dep: any | null, userIdOverride?: string | null) {
        const depId = dep ? dep.id : selectedDep?.id
        const userId = userIdOverride !== undefined ? userIdOverride : selectedUserId
        if (!depId) return

        setSaving(prev => ({ ...prev, [depId]: true }))
        setAssignDialogOpen(false)

        try {
            const sy = parseInt(startYear)
            const ey = parseInt(endYear)
            const res = await assignDepartmentHead(depId, userId, sy, ey, appointmentDate)
            
            if (res.success) {
                toast({ title: "Berhasil", description: "Ketua departemen telah diperbarui beserta riwayat masa jabatannya." })
                // The server component will be revalidated by the action (if it calls revalidatePath), 
                // but assignDepartmentHead revalidates '/admin/department-heads'. 
                // We should make sure it revalidates '/admin/institutions' or we can refresh the router.
                // It's a server action, so we can just reload or rely on router.refresh if we import useRouter
                window.location.reload()
            } else {
                toast({ title: "Gagal", description: res.error, variant: "destructive" })
            }
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" })
        } finally {
            setSaving(prev => ({ ...prev, [depId]: false }))
        }
    }

    async function handleViewHistory(dep: any) {
        setSelectedDep(dep)
        setHistoryDialogOpen(true)
        setHistoryLoading(true)
        setHistoryPage(1)
        try {
            const h = await getDepartmentHeadHistory(dep.id)
            setHistories(h as any)
        } catch (err: any) {
            toast({ title: "Error", description: "Gagal memuat riwayat", variant: "destructive" })
        } finally {
            setHistoryLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <CardTitle>Departemen</CardTitle>
                    <CardDescription>Kelola data departemen, relasi fakultas, dan penetapan ketua aktif.</CardDescription>
                </div>
                <CreateDepartmentDialog faculties={faculties} />
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <Input 
                        placeholder="Cari departemen..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="max-w-sm h-8"
                    />
                </div>
                <div className="border rounded-md overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <SortableTableHead className="w-[80px]" label="Kode" sortKey="code" currentSort={sortConfig} onSort={handleSort} />
                                <SortableTableHead label="Nama Departemen" sortKey="name" currentSort={sortConfig} onSort={handleSort} />
                                <SortableTableHead label="Fakultas" sortKey="faculty.code" currentSort={sortConfig} onSort={handleSort} />
                                <SortableTableHead label="Ketua Aktif" sortKey="activeHead.name" currentSort={sortConfig} onSort={handleSort} />
                                <TableHead>Penetapan Ketua</TableHead>
                                <TableHead className="w-[120px] text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        Data departemen tidak ditemukan.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedData.map((d: any, i: number) => (
                                    <TableRow key={d.id}>
                                        <TableCell className="font-medium">{d.code}</TableCell>
                                        <TableCell>{d.name}</TableCell>
                                        <TableCell>
                                            {d.faculty ? (
                                                <Badge variant="outline">{d.faculty.code}</Badge>
                                            ) : (
                                                <span className="text-muted-foreground italic">Tidak ada</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {d.activeHead ? (
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{d.activeHead.name}</span>
                                                    <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                                        <UserCheck className="w-3 h-3 text-green-600" /> Aktif
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground italic text-sm">Belum ditetapkan</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Select 
                                                value={d.activeHeadId || 'none'} 
                                                onValueChange={(val) => initiateAssign(d, val)}
                                                disabled={saving[d.id]}
                                            >
                                                <SelectTrigger className="w-[200px]">
                                                    <SelectValue placeholder="Pilih Ketua..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">-- Kosongkan --</SelectItem>
                                                    {(candidatesMap[d.id] || []).map((cand: any) => (
                                                        <SelectItem key={cand.id} value={cand.id}>
                                                            {cand.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell className="text-right flex justify-end gap-2">
                                            <Button variant="outline" size="icon" title="Riwayat Jabatan" onClick={() => handleViewHistory(d)}>
                                                <History className="w-4 h-4" />
                                            </Button>
                                            <EditDepartmentDialog department={d} faculties={faculties} />
                                            <DeleteDepartmentDialog id={d.id} name={d.name} />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
                <DataTablePagination 
                    pageIndex={pageIndex} pageSize={pageSize} totalItems={totalItems}
                    onPageChange={setPageIndex} onPageSizeChange={setPageSize}
                />
            </CardContent>

            {/* Assign Dialog */}
            <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Masa Jabatan Ketua Departemen</DialogTitle>
                        <DialogDescription>
                            Tentukan tahun mulai dan tahun selesai untuk ketua departemen yang baru dipilih. Riwayat ketua sebelumnya akan ditandai sebagai tidak aktif.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="startYear" className="text-right">Tahun Mulai</Label>
                            <Input id="startYear" type="number" value={startYear} onChange={e => setStartYear(e.target.value)} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="endYear" className="text-right">Tahun Selesai</Label>
                            <Input id="endYear" type="number" value={endYear} onChange={e => setEndYear(e.target.value)} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="appDate" className="text-right">Tanggal SK</Label>
                            <Input id="appDate" type="date" value={appointmentDate} onChange={e => setAppointmentDate(e.target.value)} className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>Batal</Button>
                        <Button onClick={() => handleConfirmAssign(null)}>Simpan Penetapan</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* History Dialog */}
            <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Riwayat Ketua Departemen: {selectedDep?.name}</DialogTitle>
                        <DialogDescription>Daftar historis dosen yang pernah menjabat sebagai ketua di departemen ini.</DialogDescription>
                    </DialogHeader>
                    
                    {historyLoading ? (
                        <p className="py-8 text-center text-muted-foreground">Memuat riwayat...</p>
                    ) : histories.length === 0 ? (
                        <p className="py-8 text-center text-muted-foreground">Belum ada riwayat penetapan untuk departemen ini.</p>
                    ) : (
                        <div className="flex flex-col gap-4">
                            <div className="max-h-[50vh] overflow-y-auto border rounded-md">
                                <Table>
                                    <TableHeader className="sticky top-0 bg-slate-50 dark:bg-slate-900 z-10 shadow-sm">
                                        <TableRow>
                                            <TableHead>Nama Dosen</TableHead>
                                            <TableHead>Masa Jabatan</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Ditetapkan Pada</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedHistories.map(h => (
                                            <TableRow key={h.id} className={h.isActive ? "bg-primary/5" : ""}>
                                                <TableCell className="font-medium">
                                                    {h.user?.name}
                                                </TableCell>
                                                <TableCell>{h.startYear} - {h.endYear}</TableCell>
                                                <TableCell>
                                                    {h.isActive ? (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                                            Aktif
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                                                            Selesai
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground text-sm">
                                                    {h.appointmentDate ? new Date(h.appointmentDate).toLocaleDateString('id-ID') : new Date(h.createdAt).toLocaleDateString('id-ID')}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            
                            {totalHistoryPages > 1 && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Halaman {historyPage} dari {totalHistoryPages}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                                            disabled={historyPage === 1}
                                        >
                                            Sebelumnya
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={() => setHistoryPage(p => Math.min(totalHistoryPages, p + 1))}
                                            disabled={historyPage === totalHistoryPages}
                                        >
                                            Selanjutnya
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </Card>
    )
}
