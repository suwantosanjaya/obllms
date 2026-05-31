'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { CreatePLODialog } from './CreatePLODialog'
import { EditPLODialog } from './EditPLODialog'
import { DeletePLOButton } from './DeletePLOButton'
import { useClientTable } from '@/app/hooks/useClientTable'
import { DataTablePagination } from '../ui/data-table-pagination'
import { SortableTableHead } from '@/app/components/ui/sortable-table-head'

export function PLOTab({ plos, mappedGraduateProfilesToDropdown, departmentId, selectedYearId, isLocked }: any) {
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
    } = useClientTable(plos, (plo: any) => `${plo.code} ${plo.description} ${(plo.graduateProfiles || []).map((gp: any) => gp.code).join(' ')}`)

    return (
        <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <CardTitle>Program Learning Outcomes (PLO)</CardTitle>
                    <CardDescription>Capaian pembelajaran spesifik untuk program, diselaraskan dengan Profil Lulusan.</CardDescription>
                </div>
                {!isLocked && <CreatePLODialog graduateProfiles={mappedGraduateProfilesToDropdown} selectedYearId={selectedYearId} departmentId={departmentId} />}
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <Input 
                        placeholder="Cari PLO..." 
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
                                <TableHead>Penyelarasan (Profil Lulusan)</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedData.length === 0 ? (
                                <TableRow><TableCell colSpan={5} className="text-center py-4">Data PLO tidak ditemukan.</TableCell></TableRow>
                            ) : (
                                paginatedData.map((plo: any, index: number) => (
                                    <TableRow key={plo.id}>
                                        <TableCell className="text-center font-medium text-muted-foreground">
                                            {(pageIndex * pageSize) + index + 1}
                                        </TableCell>
                                        <TableCell className="font-semibold text-primary">{plo.code}</TableCell>
                                        <TableCell className="max-w-[400px]">{plo.description}</TableCell>
                                        <TableCell>
                                            {plo.graduateProfiles && plo.graduateProfiles.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {plo.graduateProfiles.map((gp: any) => (
                                                        <Badge key={gp.id} variant="secondary">{gp.code}</Badge>
                                                    ))}
                                                </div>
                                            ) : '-'}
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            {!isLocked && (
                                                <>
                                                    <EditPLODialog plo={plo} graduateProfiles={mappedGraduateProfilesToDropdown} />
                                                    <DeletePLOButton id={plo.id} code={plo.code} />
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
