'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search, BookOpen, GraduationCap, Building2, University } from 'lucide-react'
import { useClientTable } from '@/app/hooks/useClientTable'
import { DataTablePagination } from '../ui/data-table-pagination'
import { EditSubjectDialog } from '@/app/components/qa/EditSubjectDialog'
import { DeleteSubjectButton } from '@/app/components/qa/DeleteSubjectButton'
import { SortableTableHead } from '@/app/components/ui/sortable-table-head'

const SCOPE_LABELS: Record<string, { label: string; icon: React.ElementType; className: string }> = {
    universitas: { label: 'Universitas', icon: University, className: 'bg-purple-100 text-purple-800 border-purple-300' },
    faculty: { label: 'Faculty', icon: Building2, className: 'bg-blue-100 text-blue-800 border-blue-300' },
    department: { label: 'Department', icon: GraduationCap, className: 'bg-green-100 text-green-800 border-green-300' },
}

export function SubjectTableClient({ subjects }: { subjects: any[] }) {
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
    } = useClientTable(subjects, (s: any) => `${s.code} ${s.title} ${s.type} ${s.scope}`)

    return (
        <Card>
            <CardHeader>
                <CardTitle>Subject List</CardTitle>
                <CardDescription>
                    This data is used as a reference when instructors create new classes.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <Input 
                        placeholder="Cari mata kuliah..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="max-w-sm h-8"
                    />
                </div>
                <div className="border rounded-md overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <SortableTableHead className="w-[130px]" label="Code" sortKey="code" currentSort={sortConfig} onSort={handleSort} />
                                <SortableTableHead label="Subject Name" sortKey="title" currentSort={sortConfig} onSort={handleSort} />
                                <SortableTableHead className="w-[100px]" label="Type" sortKey="type" currentSort={sortConfig} onSort={handleSort} />
                                <SortableTableHead className="w-[80px]" label="Credits" sortKey="credits" currentSort={sortConfig} onSort={handleSort} />
                                <SortableTableHead className="w-[130px]" label="Scope" sortKey="scope" currentSort={sortConfig} onSort={handleSort} />
                                <TableHead className="hidden md:table-cell">Program Study / Faculty</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
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
                                        unitLabel = 'Semua Department'
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
                                                {subject.credits} Credits
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
                                                <EditSubjectDialog subject={subject} />
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
