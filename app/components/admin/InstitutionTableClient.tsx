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
import { assignDepartmentHead, getDepartmentHeadHistory, assignFacultyDean, getFacultyDeanHistory, assignUniversityRector, getUniversityRectorHistory } from '@/app/actions/adminActions'
import { useToast } from '@/hooks/use-toast'
import { useUserStore } from '@/lib/store/useUserStore'

export function UniversityTableClient({ universities, candidatesMap = {} }: { universities: any[], candidatesMap?: Record<string, any[]> }) {
    const { toast } = useToast()
    const { activeRole, role } = useUserStore()
    const currentRole = activeRole || role
    const [saving, setSaving] = useState<Record<string, boolean>>({})

    const [assignDialogOpen, setAssignDialogOpen] = useState(false)
    const [selectedUni, setSelectedUni] = useState<any | null>(null)
    const [selectedUserId, setSelectedUserId] = useState<string>('')
    const [startYear, setStartYear] = useState(new Date().getFullYear().toString())
    const [endYear, setEndYear] = useState((new Date().getFullYear() + 4).toString())
    const [appointmentDate, setAppointmentDate] = useState(new Date().toISOString().split('T')[0])

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
    } = useClientTable(universities, (u: any) => `${u.code} ${u.name} ${u.activeRector?.name || ''}`)

    function initiateAssign(uni: any, userId: string) {
        if (userId === 'none') {
            handleConfirmAssign(uni, null)
        } else {
            setSelectedUni(uni)
            setSelectedUserId(userId)
            setAssignDialogOpen(true)
        }
    }

    async function handleConfirmAssign(uni: any | null, userIdOverride?: string | null) {
        const uniId = uni ? uni.id : selectedUni?.id
        const userId = userIdOverride !== undefined ? userIdOverride : selectedUserId
        if (!uniId) return

        setSaving(prev => ({ ...prev, [uniId]: true }))
        setAssignDialogOpen(false)

        try {
            const res = await assignUniversityRector(uniId, userId, parseInt(startYear), parseInt(endYear), appointmentDate)
            if (res.success) {
                toast({ title: "Berhasil", description: "Rektor telah diperbarui." })
                window.location.reload()
            } else {
                toast({ title: "Gagal", description: res.error, variant: "destructive" })
            }
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" })
        } finally {
            setSaving(prev => ({ ...prev, [uniId]: false }))
        }
    }

    async function handleViewHistory(uni: any) {
        setSelectedUni(uni)
        setHistoryDialogOpen(true)
        setHistoryLoading(true)
        setHistoryPage(1)
        try {
            const h = await getUniversityRectorHistory(uni.id)
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
                                <TableHead>Rektor Aktif</TableHead>
                                <TableHead>Penetapan Rektor</TableHead>
                                <TableHead>Jumlah Fakultas</TableHead>
                                <TableHead className="w-[120px] text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        Data universitas tidak ditemukan.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedData.map((u: any, i: number) => (
                                    <TableRow key={u.id}>
                                        <TableCell className="font-medium">{(pageIndex * pageSize) + i + 1}</TableCell>
                                        <TableCell className="font-medium">{u.code}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3 min-w-[250px]">
                                                <img src={u.logo || '/university-logo.svg'} alt={u.name} className="w-8 h-8 flex-shrink-0 object-contain rounded border bg-white" />
                                                <span className="font-medium whitespace-normal break-words">{u.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {u.activeRector ? (
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{u.activeRector.name}</span>
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
                                                value={u.activeRectorId || 'none'} 
                                                onValueChange={(val) => initiateAssign(u, val)}
                                                disabled={saving[u.id] || (currentRole !== 'super_admin' && currentRole !== 'admin')}
                                            >
                                                <SelectTrigger className="w-[200px]">
                                                    <SelectValue placeholder="Pilih Rektor..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">-- Kosongkan --</SelectItem>
                                                    {candidatesMap[u.id]?.map((cand: any) => (
                                                        <SelectItem key={cand.id} value={cand.id}>
                                                            {cand.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{u.faculties?.length || 0} Fakultas</Badge>
                                        </TableCell>
                                        <TableCell className="text-right flex justify-end gap-2">
                                            <Button variant="outline" size="icon" title="Riwayat Jabatan" onClick={() => handleViewHistory(u)}>
                                                <History className="w-4 h-4" />
                                            </Button>
                                            <EditUniversityDialog university={u} />
                                            {currentRole === 'super_admin' && (
                                                <DeleteUniversityDialog id={u.id} name={u.name} />
                                            )}
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
                        <DialogTitle>Masa Jabatan Rektor</DialogTitle>
                        <DialogDescription>
                            Tentukan tahun mulai dan selesai. Riwayat rektor sebelumnya akan ditandai tidak aktif.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Tahun Mulai</Label>
                            <Input type="number" value={startYear} onChange={e => setStartYear(e.target.value)} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Tahun Selesai</Label>
                            <Input type="number" value={endYear} onChange={e => setEndYear(e.target.value)} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Tanggal SK</Label>
                            <Input type="date" value={appointmentDate} onChange={e => setAppointmentDate(e.target.value)} className="col-span-3" />
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
                <DialogContent className="sm:max-w-4xl w-[95vw] sm:w-[90vw]">
                    <DialogHeader>
                        <DialogTitle className="pr-16 leading-normal text-left break-words whitespace-normal min-w-0">Riwayat Rektor: {selectedUni?.name}</DialogTitle>
                        <DialogDescription>Daftar historis dosen yang pernah menjabat sebagai rektor.</DialogDescription>
                    </DialogHeader>
                    {historyLoading ? (
                        <p className="py-8 text-center text-muted-foreground">Memuat riwayat...</p>
                    ) : histories.length === 0 ? (
                        <p className="py-8 text-center text-muted-foreground">Belum ada riwayat penetapan.</p>
                    ) : (
                        <div className="flex flex-col gap-4 min-w-0 w-full">
                            <div className="max-h-[50vh] overflow-auto border rounded-md min-w-0 w-full">
                                <Table>
                                    <TableHeader className="sticky top-0 bg-slate-50 dark:bg-slate-900 z-10">
                                        <TableRow>
                                            <TableHead>Nama</TableHead>
                                            <TableHead>Masa Jabatan</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Ditetapkan Pada</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedHistories.map(h => (
                                            <TableRow key={h.id} className={h.isActive ? "bg-primary/5" : ""}>
                                                <TableCell>
                                                    <div className="font-medium min-w-[200px] whitespace-normal break-words">
                                                        {h.user?.name}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{h.startYear} - {h.endYear}</TableCell>
                                                <TableCell>
                                                    {h.isActive ? (
                                                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">Aktif</span>
                                                    ) : (
                                                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">Selesai</span>
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
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </Card>
    )
}

export function FacultyTableClient({ faculties, universities, candidatesMap = {} }: { faculties: any[], universities: any[], candidatesMap?: Record<string, any[]> }) {
    const { toast } = useToast()
    const [saving, setSaving] = useState<Record<string, boolean>>({})

    const [assignDialogOpen, setAssignDialogOpen] = useState(false)
    const [selectedFac, setSelectedFac] = useState<any | null>(null)
    const [selectedUserId, setSelectedUserId] = useState<string>('')
    const [startYear, setStartYear] = useState(new Date().getFullYear().toString())
    const [endYear, setEndYear] = useState((new Date().getFullYear() + 4).toString())
    const [appointmentDate, setAppointmentDate] = useState(new Date().toISOString().split('T')[0])

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
    } = useClientTable(faculties, (f: any) => `${f.code} ${f.name} ${f.university?.name || ''} ${f.activeDean?.name || ''}`)

    function initiateAssign(fac: any, userId: string) {
        if (userId === 'none') {
            handleConfirmAssign(fac, null)
        } else {
            setSelectedFac(fac)
            setSelectedUserId(userId)
            setAssignDialogOpen(true)
        }
    }

    async function handleConfirmAssign(fac: any | null, userIdOverride?: string | null) {
        const facId = fac ? fac.id : selectedFac?.id
        const userId = userIdOverride !== undefined ? userIdOverride : selectedUserId
        if (!facId) return

        setSaving(prev => ({ ...prev, [facId]: true }))
        setAssignDialogOpen(false)

        try {
            const res = await assignFacultyDean(facId, userId, parseInt(startYear), parseInt(endYear), appointmentDate)
            if (res.success) {
                toast({ title: "Berhasil", description: "Dekan telah diperbarui." })
                window.location.reload()
            } else {
                toast({ title: "Gagal", description: res.error, variant: "destructive" })
            }
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" })
        } finally {
            setSaving(prev => ({ ...prev, [facId]: false }))
        }
    }

    async function handleViewHistory(fac: any) {
        setSelectedFac(fac)
        setHistoryDialogOpen(true)
        setHistoryLoading(true)
        setHistoryPage(1)
        try {
            const h = await getFacultyDeanHistory(fac.id)
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
                                <TableHead>Dekan Aktif</TableHead>
                                <TableHead>Penetapan Dekan</TableHead>
                                <TableHead>Jumlah Program Studi</TableHead>
                                <TableHead className="w-[120px] text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                        Data fakultas tidak ditemukan.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedData.map((f: any, i: number) => (
                                    <TableRow key={f.id}>
                                        <TableCell className="font-medium">{(pageIndex * pageSize) + i + 1}</TableCell>
                                        <TableCell className="font-medium">{f.code}</TableCell>
                                        <TableCell>
                                            <div className="min-w-[200px] whitespace-normal break-words">
                                                {f.name}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {f.university ? (
                                                <div className="min-w-[250px] whitespace-normal break-words text-sm">
                                                    {f.university.code} - {f.university.name}
                                                </div>
                                            ) : (
                                                <span className="text-sm text-muted-foreground italic">Tidak ada</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {f.activeDean ? (
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{f.activeDean.name}</span>
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
                                                value={f.activeDeanId || 'none'} 
                                                onValueChange={(val) => initiateAssign(f, val)}
                                                disabled={saving[f.id]}
                                            >
                                                <SelectTrigger className="w-[200px]">
                                                    <SelectValue placeholder="Pilih Dekan..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">-- Kosongkan --</SelectItem>
                                                    {candidatesMap[f.id]?.map((cand: any) => (
                                                        <SelectItem key={cand.id} value={cand.id}>
                                                            {cand.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{f.departments?.length || 0} Program Studi</Badge>
                                        </TableCell>
                                        <TableCell className="text-right flex justify-end gap-2">
                                            <Button variant="outline" size="icon" title="Riwayat Jabatan" onClick={() => handleViewHistory(f)}>
                                                <History className="w-4 h-4" />
                                            </Button>
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

            {/* Assign Dialog */}
            <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Masa Jabatan Dekan</DialogTitle>
                        <DialogDescription>
                            Tentukan tahun mulai dan selesai. Riwayat dekan sebelumnya akan ditandai tidak aktif.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Tahun Mulai</Label>
                            <Input type="number" value={startYear} onChange={e => setStartYear(e.target.value)} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Tahun Selesai</Label>
                            <Input type="number" value={endYear} onChange={e => setEndYear(e.target.value)} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Tanggal SK</Label>
                            <Input type="date" value={appointmentDate} onChange={e => setAppointmentDate(e.target.value)} className="col-span-3" />
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
                <DialogContent className="sm:max-w-4xl w-[95vw] sm:w-[90vw]">
                    <DialogHeader>
                        <DialogTitle className="pr-16 leading-normal text-left break-words whitespace-normal min-w-0">Riwayat Dekan: {selectedFac?.name}</DialogTitle>
                        <DialogDescription>Daftar historis dosen yang pernah menjabat sebagai dekan.</DialogDescription>
                    </DialogHeader>
                    {historyLoading ? (
                        <p className="py-8 text-center text-muted-foreground">Memuat riwayat...</p>
                    ) : histories.length === 0 ? (
                        <p className="py-8 text-center text-muted-foreground">Belum ada riwayat penetapan.</p>
                    ) : (
                        <div className="flex flex-col gap-4 min-w-0 w-full">
                            <div className="max-h-[50vh] overflow-auto border rounded-md min-w-0 w-full">
                                <Table>
                                    <TableHeader className="sticky top-0 bg-slate-50 dark:bg-slate-900 z-10">
                                        <TableRow>
                                            <TableHead>Nama</TableHead>
                                            <TableHead>Masa Jabatan</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Ditetapkan Pada</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedHistories.map(h => (
                                            <TableRow key={h.id} className={h.isActive ? "bg-primary/5" : ""}>
                                                <TableCell>
                                                    <div className="font-medium min-w-[200px] whitespace-normal break-words">
                                                        {h.user?.name}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{h.startYear} - {h.endYear}</TableCell>
                                                <TableCell>
                                                    {h.isActive ? (
                                                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">Aktif</span>
                                                    ) : (
                                                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">Selesai</span>
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
                        </div>
                    )}
                </DialogContent>
            </Dialog>
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
                toast({ title: "Berhasil", description: "Ketua program studi telah diperbarui beserta riwayat masa jabatannya." })
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
                    <CardTitle>Program Studi</CardTitle>
                    <CardDescription>Kelola data program studi, relasi fakultas, dan penetapan ketua aktif.</CardDescription>
                </div>
                <CreateDepartmentDialog faculties={faculties} />
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <Input 
                        placeholder="Cari program studi..." 
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
                                <SortableTableHead label="Nama Program Studi" sortKey="name" currentSort={sortConfig} onSort={handleSort} />
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
                                        Data program studi tidak ditemukan.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedData.map((d: any, i: number) => (
                                    <TableRow key={d.id}>
                                        <TableCell className="font-medium">{d.code}</TableCell>
                                        <TableCell>
                                            <div className="min-w-[200px] whitespace-normal break-words">
                                                {d.name}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {d.faculty ? (
                                                <div className="min-w-[200px] whitespace-normal break-words text-sm" title={d.faculty.name}>
                                                    <span className="font-semibold mr-1">{d.faculty.code}</span>
                                                    <span className="text-muted-foreground">- {d.faculty.name}</span>
                                                </div>
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
                        <DialogTitle>Masa Jabatan Ketua Program Studi</DialogTitle>
                        <DialogDescription>
                            Tentukan tahun mulai dan tahun selesai untuk ketua program studi yang baru dipilih. Riwayat ketua sebelumnya akan ditandai sebagai tidak aktif.
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
                <DialogContent className="sm:max-w-4xl w-[95vw] sm:w-[90vw]">
                    <DialogHeader>
                        <DialogTitle className="pr-16 leading-normal text-left break-words whitespace-normal min-w-0">Riwayat Ketua Program Studi: {selectedDep?.name}</DialogTitle>
                        <DialogDescription>Daftar historis dosen yang pernah menjabat sebagai ketua di program studi ini.</DialogDescription>
                    </DialogHeader>
                    
                    {historyLoading ? (
                        <p className="py-8 text-center text-muted-foreground">Memuat riwayat...</p>
                    ) : histories.length === 0 ? (
                        <p className="py-8 text-center text-muted-foreground">Belum ada riwayat penetapan untuk program studi ini.</p>
                    ) : (
                        <div className="flex flex-col gap-4 min-w-0 w-full">
                            <div className="max-h-[50vh] overflow-auto border rounded-md min-w-0 w-full">
                                <Table>
                                    <TableHeader className="sticky top-0 bg-slate-50 dark:bg-slate-900 z-10 shadow-sm">
                                        <TableRow>
                                            <TableHead>Nama</TableHead>
                                            <TableHead>Masa Jabatan</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Ditetapkan Pada</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedHistories.map(h => (
                                            <TableRow key={h.id} className={h.isActive ? "bg-primary/5" : ""}>
                                                <TableCell>
                                                    <div className="font-medium min-w-[200px] whitespace-normal break-words">
                                                        {h.user?.name}
                                                    </div>
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
