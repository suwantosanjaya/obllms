'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { useClientTable } from '@/app/hooks/useClientTable'
import { DataTablePagination } from '../ui/data-table-pagination'
import {
    CreateUniversityDialog, EditUniversityDialog, DeleteUniversityDialog,
    CreateFacultyDialog, EditFacultyDialog, DeleteFacultyDialog,
    CreateDepartmentDialog, EditDepartmentDialog, DeleteDepartmentDialog
} from '@/app/components/admin/InstitutionDialogs'
import { SortableTableHead } from '@/app/components/ui/sortable-table-head'

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
                    <CardTitle>Universities</CardTitle>
                    <CardDescription>List of all universities in the system.</CardDescription>
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
                                <SortableTableHead className="w-[100px]" label="Code" sortKey="code" currentSort={sortConfig} onSort={handleSort} />
                                <SortableTableHead label="Name" sortKey="name" currentSort={sortConfig} onSort={handleSort} />
                                <TableHead>Faculties Count</TableHead>
                                <TableHead className="w-[100px] text-right">Actions</TableHead>
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
                                            <Badge variant="secondary">{u.faculties?.length || 0} Faculties</Badge>
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
                    <CardTitle>Faculties</CardTitle>
                    <CardDescription>Manage faculties and their university association.</CardDescription>
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
                                <SortableTableHead className="w-[100px]" label="Code" sortKey="code" currentSort={sortConfig} onSort={handleSort} />
                                <SortableTableHead label="Faculty Name" sortKey="name" currentSort={sortConfig} onSort={handleSort} />
                                <SortableTableHead label="University" sortKey="university.name" currentSort={sortConfig} onSort={handleSort} />
                                <TableHead>Departments Count</TableHead>
                                <TableHead className="w-[100px] text-right">Actions</TableHead>
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
                                                <span className="text-sm text-muted-foreground italic">None</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{f.departments?.length || 0} Departments</Badge>
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

export function DepartmentTableClient({ departments, faculties }: { departments: any[], faculties: any[] }) {
    const {
        searchQuery, setSearchQuery, pageIndex, setPageIndex,
        pageSize, setPageSize, paginatedData, totalItems,
        sortConfig, handleSort
    } = useClientTable(departments, (d: any) => `${d.code} ${d.name} ${d.faculty?.name || ''}`)

    return (
        <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <CardTitle>Departments (Departemen)</CardTitle>
                    <CardDescription>Manage departments and their faculty association.</CardDescription>
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
                                <TableHead className="w-[50px]">No</TableHead>
                                <SortableTableHead className="w-[100px]" label="Code" sortKey="code" currentSort={sortConfig} onSort={handleSort} />
                                <SortableTableHead label="Department Name" sortKey="name" currentSort={sortConfig} onSort={handleSort} />
                                <SortableTableHead label="Faculty" sortKey="faculty.code" currentSort={sortConfig} onSort={handleSort} />
                                <SortableTableHead label="University" sortKey="faculty.university.name" currentSort={sortConfig} onSort={handleSort} />
                                <TableHead className="w-[100px] text-right">Actions</TableHead>
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
                                        <TableCell className="font-medium">{(pageIndex * pageSize) + i + 1}</TableCell>
                                        <TableCell className="font-medium">{d.code}</TableCell>
                                        <TableCell>{d.name}</TableCell>
                                        <TableCell>
                                            {d.faculty ? (
                                                <Badge variant="outline">{d.faculty.code}</Badge>
                                            ) : (
                                                <span className="text-muted-foreground italic">None</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-muted-foreground">
                                                {d.faculty?.university?.name || '-'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right flex justify-end gap-2">
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
        </Card>
    )
}
