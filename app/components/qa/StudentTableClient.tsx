'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search, BarChart } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useClientTable } from '@/app/hooks/useClientTable'
import { DataTablePagination } from '../ui/data-table-pagination'
import { SortableTableHead } from '@/app/components/ui/sortable-table-head'
import { EditQAStudentDialog } from './EditQAStudentDialog'

export function StudentTableClient({ students }: { students: any[] }) {
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
    } = useClientTable(students, (s: any) => `${s.name} ${s.email} ${s.studentProfile?.nim || ''} ${s.studentProfile?.angkatan || ''}`)

    return (
        <Card>
            <CardHeader>
                <CardTitle>Daftar Mahasiswa</CardTitle>
                <CardDescription>Menampilkan daftar seluruh mahasiswa yang terdaftar di departemen ini.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <Input 
                        placeholder="Cari mahasiswa (nama, email, nim, angkatan)..." 
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
                                <SortableTableHead label="NIM" sortKey="studentProfile.nim" currentSort={sortConfig} onSort={handleSort} />
                                <SortableTableHead label="Nama" sortKey="name" currentSort={sortConfig} onSort={handleSort} />
                                <SortableTableHead label="Email" sortKey="email" currentSort={sortConfig} onSort={handleSort} />
                                <SortableTableHead label="Angkatan" sortKey="studentProfile.angkatan" currentSort={sortConfig} onSort={handleSort} />
                                <TableHead>Jenis Kelamin</TableHead>
                                <TableHead>Alamat</TableHead>
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
                                        <TableCell>{student.email}</TableCell>
                                        <TableCell>{student.studentProfile?.angkatan || '-'}</TableCell>
                                        <TableCell>{student.studentProfile?.jenisKelamin === 'L' ? 'Laki-laki' : (student.studentProfile?.jenisKelamin === 'P' ? 'Perempuan' : '-')}</TableCell>
                                        <TableCell className="truncate max-w-[200px]" title={student.studentProfile?.alamat || ''}>
                                            {student.studentProfile?.alamat || '-'}
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button variant="ghost" size="icon" asChild title="Analitik Capaian">
                                                <Link href={`/qa/students/${student.id}`}>
                                                    <BarChart className="w-4 h-4 text-blue-500" />
                                                </Link>
                                            </Button>
                                            <EditQAStudentDialog student={student} />
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
