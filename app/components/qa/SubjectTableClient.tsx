'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, BookOpen, GraduationCap, Building2, University } from 'lucide-react'
import { useClientTable } from '@/app/hooks/useClientTable'
import { DataTablePagination } from '../ui/data-table-pagination'
import { EditSubjectDialog } from '@/app/components/qa/EditSubjectDialog'
import { DeleteSubjectButton } from '@/app/components/qa/DeleteSubjectButton'
import { SortableTableHead } from '@/app/components/ui/sortable-table-head'

const SCOPE_LABELS: Record<string, { label: string; icon: React.ElementType; className: string }> = {
    universitas: { label: 'Universitas', icon: University, className: 'bg-purple-100 text-purple-800 border-purple-300' },
    faculty: { label: 'Fakultas', icon: Building2, className: 'bg-blue-100 text-blue-800 border-blue-300' },
    department: { label: 'Departemen', icon: GraduationCap, className: 'bg-green-100 text-green-800 border-green-300' },
}

export function SubjectTableClient({ subjects, isLocked, defaultFacultyId, defaultDepartmentId }: { subjects: any[], isLocked?: boolean, defaultFacultyId?: string, defaultDepartmentId?: string }) {
    const [selectedScope, setSelectedScope] = useState('ALL')

    const scopeFilteredSubjects = subjects.filter(s => {
        if (selectedScope === 'ALL') return true
        return s.scope === selectedScope
    })

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
    } = useClientTable(scopeFilteredSubjects, (s: any) => `${s.code} ${s.title} ${s.type} ${s.scope}`)

    return (
        <Card>
            <CardHeader>
                <CardTitle>Daftar Mata Kuliah</CardTitle>
                <CardDescription>
                    Data ini digunakan sebagai referensi saat dosen membuat kelas baru.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari mata kuliah..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Select value={selectedScope} onValueChange={(val) => { setSelectedScope(val); setPageIndex(0); }}>
                        <SelectTrigger className="w-full sm:w-[250px]">
                            <SelectValue placeholder="Semua Cakupan" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Semua Cakupan</SelectItem>
                            <SelectItem value="universitas">Universitas</SelectItem>
                            <SelectItem value="faculty">Fakultas</SelectItem>
                            <SelectItem value="department">Departemen</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="border rounded-md overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <SortableTableHead className="w-[130px]" label="Kode" sortKey="code" currentSort={sortConfig} onSort={handleSort} />
                                <SortableTableHead label="Nama Mata Kuliah" sortKey="title" currentSort={sortConfig} onSort={handleSort} />
                                <SortableTableHead className="w-[100px]" label="Tipe" sortKey="type" currentSort={sortConfig} onSort={handleSort} />
                                <SortableTableHead className="w-[80px]" label="SKS" sortKey="credits" currentSort={sortConfig} onSort={handleSort} />
                                <SortableTableHead className="w-[130px]" label="Cakupan" sortKey="scope" currentSort={sortConfig} onSort={handleSort} />
                                <TableHead className="hidden md:table-cell">Departemen / Fakultas</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        <div className="flex flex-col items-center gap-2">
                                            <BookOpen className="h-8 w-8 opacity-40" />
                                            <span>Data mata kuliah tidak ditemukan.</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedData.map((subject: any) => {
                                    const scopeInfo = SCOPE_LABELS[subject.scope] ?? SCOPE_LABELS.department
                                    const ScopeIcon = scopeInfo.icon

                                    // Determine the unit label
                                    let unitLabel = '-'
                                    if (subject.scope === 'department' && subject.department) {
                                        unitLabel = `${subject.department.name} (${subject.department.faculty.code})`
                                    } else if (subject.scope === 'faculty' && subject.faculty) {
                                        unitLabel = subject.faculty.name
                                    } else if (subject.scope === 'universitas') {
                                        unitLabel = 'Semua Departemen'
                                    }

                                    return (
                                        <TableRow key={subject.id}>
                                            <TableCell>
                                                <Badge variant="outline" className="font-medium">
                                                    {subject.code}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-semibold">
                                                {subject.title}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={subject.type === 'wajib'
                                                        ? 'bg-red-50 text-red-700 border-red-200'
                                                        : 'bg-amber-50 text-amber-700 border-amber-200'
                                                    }
                                                >
                                                    {subject.type === 'wajib' ? 'Wajib' : 'Pilihan'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {subject.credits} SKS
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={`flex items-center gap-1 w-fit ${scopeInfo.className}`}>
                                                    <ScopeIcon className="h-3 w-3" />
                                                    {scopeInfo.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                                                {unitLabel}
                                            </TableCell>
                                            <TableCell className="text-right flex items-center justify-end gap-2">
                                                <EditSubjectDialog 
                                                    subject={subject} 
                                                    isLocked={isLocked}
                                                    defaultFacultyId={defaultFacultyId}
                                                    defaultDepartmentId={defaultDepartmentId}
                                                />
                                                <DeleteSubjectButton id={subject.id} title={subject.title} />
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
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
