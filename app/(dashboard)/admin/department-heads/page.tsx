'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { History, UserCheck } from 'lucide-react'
import { getDepartmentsWithHeads, getHeadOfDepartmentCandidates, assignDepartmentHead, getDepartmentHeadHistory } from '@/app/actions/adminActions'

type UserInfo = { id: string, name: string, email: string }
type DepartmentInfo = { id: string, code: string, name: string, activeHeadId: string | null, activeHead: UserInfo | null }
type HistoryRecord = { id: string, startYear: number, endYear: number, isActive: boolean, createdAt: Date, appointmentDate: Date | null, user: UserInfo }

export default function DepartmentHeadsPage() {
    const { toast } = useToast()
    const [departments, setDepartments] = useState<DepartmentInfo[]>([])
    const [candidates, setCandidates] = useState<Record<string, UserInfo[]>>({})
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState<Record<string, boolean>>({})

    // Dialog state for assigning head
    const [assignDialogOpen, setAssignDialogOpen] = useState(false)
    const [selectedDep, setSelectedDep] = useState<DepartmentInfo | null>(null)
    const [selectedUserId, setSelectedUserId] = useState<string>('')
    const [startYear, setStartYear] = useState(new Date().getFullYear().toString())
    const [endYear, setEndYear] = useState((new Date().getFullYear() + 4).toString())
    const [appointmentDate, setAppointmentDate] = useState(new Date().toISOString().split('T')[0])

    // Dialog state for history
    const [historyDialogOpen, setHistoryDialogOpen] = useState(false)
    const [histories, setHistories] = useState<HistoryRecord[]>([])
    const [historyLoading, setHistoryLoading] = useState(false)
    const [historyPage, setHistoryPage] = useState(1)
    const historyPageSize = 5
    const totalHistoryPages = Math.ceil(histories.length / historyPageSize)
    const paginatedHistories = histories.slice((historyPage - 1) * historyPageSize, historyPage * historyPageSize)

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        setLoading(true)
        try {
            const deps = await getDepartmentsWithHeads()
            setDepartments(deps as any)

            const candidatesMap: Record<string, UserInfo[]> = {}
            for (const dep of deps) {
                const cands = await getHeadOfDepartmentCandidates(dep.id)
                candidatesMap[dep.id] = cands
            }
            setCandidates(candidatesMap)
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    function initiateAssign(dep: DepartmentInfo, userId: string) {
        if (userId === 'none') {
            // Unassigning immediately without asking for years
            handleConfirmAssign(dep, null)
        } else {
            setSelectedDep(dep)
            setSelectedUserId(userId)
            setAssignDialogOpen(true)
        }
    }

    async function handleConfirmAssign(dep: DepartmentInfo | null, userIdOverride?: string | null) {
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
                // Refresh data to update candidate lists across all departments
                fetchData()
            } else {
                toast({ title: "Gagal", description: res.error, variant: "destructive" })
                // Reset select dropdown visually
                fetchData() 
            }
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" })
        } finally {
            setSaving(prev => ({ ...prev, [depId]: false }))
        }
    }

    async function handleViewHistory(dep: DepartmentInfo) {
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
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Penetapan Ketua Departemen</h1>
                <p className="text-muted-foreground mt-1">Kelola dan tetapkan siapa yang menjabat sebagai ketua aktif untuk setiap Program Studi beserta masa jabatannya.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Daftar Departemen & Ketua Aktif</CardTitle>
                    <CardDescription>Ketua yang ditetapkan di sini memiliki hak eksklusif untuk menyetujui (Approve) draf kurikulum di departemennya.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p className="text-sm text-muted-foreground">Memuat data...</p>
                    ) : departments.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Belum ada departemen yang terdaftar.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Kode</TableHead>
                                    <TableHead>Nama Departemen</TableHead>
                                    <TableHead>Ketua Aktif Saat Ini</TableHead>
                                    <TableHead>Ubah Penetapan</TableHead>
                                    <TableHead className="text-right">Riwayat</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {departments.map(dep => (
                                    <TableRow key={dep.id}>
                                        <TableCell className="font-medium">{dep.code}</TableCell>
                                        <TableCell>{dep.name}</TableCell>
                                        <TableCell>
                                            {dep.activeHead ? (
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{dep.activeHead.name}</span>
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <UserCheck className="w-3 h-3 text-green-600" /> Aktif Menjabat
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground italic text-sm">Belum ditetapkan</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Select 
                                                value={dep.activeHeadId || 'none'} 
                                                onValueChange={(val) => initiateAssign(dep, val)}
                                                disabled={saving[dep.id]}
                                            >
                                                <SelectTrigger className="w-[250px]">
                                                    <SelectValue placeholder="Pilih Ketua Baru..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">-- Kosongkan Jabatan --</SelectItem>
                                                    {(candidates[dep.id] || []).map(cand => (
                                                        <SelectItem key={cand.id} value={cand.id}>
                                                            {cand.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" onClick={() => handleViewHistory(dep)}>
                                                <History className="w-4 h-4 mr-2" />
                                                Lihat
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

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
        </div>
    )
}
