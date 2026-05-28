'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { CreateCLODialog } from './CreateCLODialog'
import { EditCLODialog } from './EditCLODialog'
import { DeleteCLOButton } from './DeleteCLOButton'
import { useClientTable } from '@/app/hooks/useClientTable'
import { DataTablePagination } from '../ui/data-table-pagination'
import { SortableTableHead } from '@/app/components/ui/sortable-table-head'

export function CLOTab({ clos, mappedPlosToDropdown, departmentId, selectedYearId, isLocked }: any) {
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
    } = useClientTable(clos, (clo: any) => `${clo.code} ${clo.description} ${(clo.plos || []).map((plo: any) => plo.code).join(' ')} ${(clo.subjectClos || []).map((sc: any) => sc.subject?.code).join(' ')}`)

    return (
        <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <CardTitle>Bank CLO (Course Learning Outcomes)</CardTitle>
                    <CardDescription>Bank CLO Department — setiap CLO bisa dipetakan ke banyak mata kuliah dengan bobot berbeda.</CardDescription>
                </div>
                {!isLocked && <CreateCLODialog plos={mappedPlosToDropdown} departmentId={departmentId} selectedYearId={selectedYearId} />}
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <Input 
                        placeholder="Cari CLO..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="max-w-sm h-8"
                    />
                </div>
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px] text-center">No</TableHead>
                                <SortableTableHead className="w-[100px]" label="Kode" sortKey="code" currentSort={sortConfig} onSort={handleSort} />
                                <SortableTableHead label="Deskripsi" sortKey="description" currentSort={sortConfig} onSort={handleSort} />
                                <TableHead>Relasi PLO</TableHead>
                                <TableHead>Dipakai di</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedData.length === 0 ? (
                                <TableRow><TableCell colSpan={6} className="text-center py-4">Belum ada CLO ditemukan.</TableCell></TableRow>
                            ) : (
                                paginatedData.map((clo: any, index: number) => (
                                    <TableRow key={clo.id}>
                                        <TableCell className="text-center font-medium text-muted-foreground">
                                            {(pageIndex * pageSize) + index + 1}
                                        </TableCell>
                                        <TableCell className="font-semibold">{clo.code}</TableCell>
                                        <TableCell className="max-w-[300px]">{clo.description}</TableCell>
                                        <TableCell>
                                            {clo.plos && clo.plos.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {clo.plos.map((plo: any) => (
                                                        <Badge key={plo.id} className="bg-blue-100 text-blue-700">{plo.code}</Badge>
                                                    ))}
                                                </div>
                                            ) : '-'}
                                        </TableCell>
                                        <TableCell>
                                            {clo.subjectClos && clo.subjectClos.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {clo.subjectClos.map((sc: any) => (
                                                        <Badge key={sc.id} variant="outline">{sc.subject?.code}</Badge>
                                                    ))}
                                                </div>
                                            ) : <span className="text-muted-foreground text-xs">Belum dipetakan</span>}
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            {!isLocked && (
                                                <>
                                                    <EditCLODialog clo={clo} plos={mappedPlosToDropdown} />
                                                    <DeleteCLOButton id={clo.id} code={clo.code} />
                                                </>
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
