'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search, BarChart, Printer } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useClientTable } from '@/app/hooks/useClientTable'
import { DataTablePagination } from '../ui/data-table-pagination'
import { SortableTableHead } from '@/app/components/ui/sortable-table-head'
import { EditQAStudentDialog } from './EditQAStudentDialog'
import { useUserStore } from '@/lib/store/useUserStore'
import { useState, useMemo } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function StudentTableClient({ students, facultyDepartments = [] }: { students: any[], facultyDepartments?: any[] }) {
    const { activeRole, role } = useUserStore()
    const currentRole = activeRole || role
    const [selectedDeptId, setSelectedDeptId] = useState<string>('all')

    const uniqueDepartments = useMemo(() => {
        if (currentRole === 'dean' && facultyDepartments.length > 0) {
            return [...facultyDepartments].sort((a, b) => a.name.localeCompare(b.name))
        }
        
        const deptMap = new Map<string, string>()
        students.forEach(s => {
            if (s.homebaseDepartment?.id) {
                deptMap.set(s.homebaseDepartment.id, s.homebaseDepartment.name)
            }
        })
        return Array.from(deptMap.entries()).map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name))
    }, [students, currentRole, facultyDepartments])

    const filteredStudents = useMemo(() => {
        if (selectedDeptId === 'all') return students;
        return students.filter(s => s.homebaseDepartment?.id === selectedDeptId);
    }, [students, selectedDeptId])

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
    } = useClientTable(filteredStudents, (s: any) => `${s.name} ${s.email} ${s.studentProfile?.nim || ''} ${s.studentProfile?.angkatan || ''}`)

    return (
        <Card>
            <CardHeader>
                <CardTitle>Daftar Mahasiswa</CardTitle>
                <CardDescription>Menampilkan daftar seluruh mahasiswa yang terdaftar di program studi ini.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex items-center space-x-2 flex-1">
                        <Search className="w-4 h-4 text-muted-foreground" />
                        <Input 
                            placeholder="Cari mahasiswa (nama, email, nim, angkatan)..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="max-w-sm h-8"
                        />
                    </div>
                    {currentRole === 'dean' && uniqueDepartments.length > 0 && (
                        <Select value={selectedDeptId} onValueChange={setSelectedDeptId}>
                            <SelectTrigger className="w-[200px] h-8">
                                <SelectValue placeholder="Semua Program Studi" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Program Studi</SelectItem>
                                {uniqueDepartments.map(d => (
                                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>
                <div className="border rounded-md overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">No</TableHead>
                                <SortableTableHead label="NIM" sortKey="studentProfile.nim" currentSort={sortConfig} onSort={handleSort} />
                                <SortableTableHead label="Nama" sortKey="name" currentSort={sortConfig} onSort={handleSort} />
                                {currentRole === 'dean' && <TableHead>Program Studi</TableHead>}
                                <SortableTableHead label="Email" sortKey="email" currentSort={sortConfig} onSort={handleSort} />
                                <SortableTableHead label="Angkatan" sortKey="studentProfile.angkatan" currentSort={sortConfig} onSort={handleSort} />
                                <TableHead>Jenis Kelamin</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                                        Tidak ada data mahasiswa ditemukan.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedData.map((student, idx) => (
                                    <TableRow key={student.id}>
                                        <TableCell>{pageIndex * pageSize + idx + 1}</TableCell>
                                        <TableCell className="font-mono text-sm">{student.studentProfile?.nim || '-'}</TableCell>
                                        <TableCell className="font-medium">{student.name}</TableCell>
                                        {currentRole === 'dean' && (
                                            <TableCell className="text-sm truncate max-w-[150px]" title={student.homebaseDepartment?.name || '-'}>
                                                {student.homebaseDepartment?.name || '-'}
                                            </TableCell>
                                        )}
                                        <TableCell>{student.email}</TableCell>
                                        <TableCell>{student.studentProfile?.angkatan || '-'}</TableCell>
                                        <TableCell>{student.studentProfile?.jenisKelamin === 'L' ? 'Laki-laki' : (student.studentProfile?.jenisKelamin === 'P' ? 'Perempuan' : '-')}</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button variant="ghost" size="icon" asChild title="Analitik Capaian">
                                                <Link href={`/qa/students/${student.id}`}>
                                                    <BarChart className="w-4 h-4 text-blue-500" />
                                                </Link>
                                            </Button>
                                            <Button variant="ghost" size="icon" asChild title="Cetak Transkrip OBE">
                                                <a href={`/print/transcript/${student.id}`} target="_blank" rel="noopener noreferrer">
                                                    <Printer className="w-4 h-4 text-purple-500" />
                                                </a>
                                            </Button>
                                            {currentRole === 'qa' && (
                                                <EditQAStudentDialog student={student} />
                                            )}
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
