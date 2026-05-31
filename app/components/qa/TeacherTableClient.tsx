'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Search, Plus, BookOpen, Loader2, CheckCircle } from 'lucide-react'
import { useClientTable } from '@/app/hooks/useClientTable'
import { DataTablePagination } from '../ui/data-table-pagination'
import { SortableTableHead } from '@/app/components/ui/sortable-table-head'
import { createTeacherForDepartment } from '@/app/actions/qaTeacherActions'
import { EditQATeacherDialog } from './EditQATeacherDialog'
import { useRouter } from 'next/navigation'

function AddTeacherDialog({ departmentId }: { departmentId: string }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const router = useRouter()

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError('')
        const form = e.currentTarget
        const name = (form.elements.namedItem('name') as HTMLInputElement).value
        const email = (form.elements.namedItem('email') as HTMLInputElement).value

        const res = await createTeacherForDepartment({ name, email, departmentId })
        setLoading(false)

        if (res.success) {
            setSuccess(true)
            setTimeout(() => {
                setOpen(false)
                setSuccess(false)
                router.refresh()
            }, 1500)
        } else {
            setError(res.error || 'Gagal menambahkan dosen.')
        }
    }

    return (
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); setError(''); setSuccess(false) }}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Dosen
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                {success ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
                        <CheckCircle className="w-12 h-12 text-green-500" />
                        <p className="font-semibold text-lg">Akun Dosen Berhasil Dibuat!</p>
                        <p className="text-sm text-muted-foreground">
                            Password awal digenerate otomatis. Dosen wajib mengganti password saat login pertama.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>Tambah Dosen Baru</DialogTitle>
                            <DialogDescription>
                                Buat akun dosen baru untuk departemen Anda. Dosen akan menerima password awal dan wajib menggantinya saat login pertama.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">Nama</Label>
                                <Input id="name" name="name" placeholder="Dr. Budi Santoso" className="col-span-3" required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="email" className="text-right">Email</Label>
                                <Input id="email" name="email" type="email" placeholder="budi@campus.ac.id" className="col-span-3" required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Peran</Label>
                                <div className="col-span-3">
                                    <Badge variant="secondary" className="text-sm px-3 py-1">Dosen (Teacher)</Badge>
                                </div>
                            </div>
                            {error && <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-md">{error}</p>}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Menyimpan...</> : 'Simpan'}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    )
}

export function TeacherTableClient({ teachers, departmentId }: { teachers: any[], departmentId: string }) {
    const {
        searchQuery, setSearchQuery,
        pageIndex, setPageIndex,
        pageSize, setPageSize,
        paginatedData, totalItems,
        sortConfig, handleSort
    } = useClientTable(teachers, (t: any) => `${t.name} ${t.email} ${t.teacherProfile?.nidn || ''}`)

    return (
        <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <CardTitle>Daftar Dosen</CardTitle>
                    <CardDescription>Menampilkan daftar seluruh dosen yang terdaftar di departemen ini.</CardDescription>
                </div>
                <AddTeacherDialog departmentId={departmentId} />
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari dosen (nama, email, NIDN)..."
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
                                <TableHead>NIDN</TableHead>
                                <TableHead>Total Kelas</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                        <div className="flex flex-col items-center gap-2">
                                            <BookOpen className="w-8 h-8 text-muted-foreground/50" />
                                            <span>Tidak ada data dosen ditemukan.</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedData.map((teacher, idx) => (
                                    <TableRow key={teacher.id}>
                                        <TableCell>{pageIndex * pageSize + idx + 1}</TableCell>
                                        <TableCell className="font-medium">{teacher.name}</TableCell>
                                        <TableCell className="text-muted-foreground">{teacher.email}</TableCell>
                                        <TableCell className="font-mono text-sm">{teacher.teacherProfile?.nidn || '-'}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{teacher._count?.courses ?? 0} kelas</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={teacher.isActive ? 'default' : 'secondary'} className={teacher.isActive ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''}>
                                                {teacher.isActive ? 'Aktif' : 'Nonaktif'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <EditQATeacherDialog teacher={teacher} />
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
