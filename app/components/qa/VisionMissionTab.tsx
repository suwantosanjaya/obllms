'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { CreateVisionMissionDialog } from './CreateVisionMissionDialog'
import { EditVisionMissionDialog } from './EditVisionMissionDialog'
import { DeleteVisionMissionButton } from './DeleteVisionMissionButton'
import { useClientTable } from '@/app/hooks/useClientTable'
import { DataTablePagination } from '../ui/data-table-pagination'
import { SortableTableHead } from '@/app/components/ui/sortable-table-head'

export function VisionMissionTab({ visionMissions, department, departmentId, selectedYearId, isLocked }: any) {
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
    } = useClientTable(visionMissions, (vm: any) => `${vm.code} ${vm.description} ${vm.type}`)

    return (
        <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <CardTitle>Visi & Misi Institusi</CardTitle>
                    <CardDescription>
                        Visi dan misi program studi {department?.name || 'Anda'}.
                    </CardDescription>
                </div>
                {!isLocked && <CreateVisionMissionDialog isLocked={isLocked} departmentId={departmentId} curriculumYearId={selectedYearId} />}
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <Input 
                        placeholder="Cari Visi/Misi..." 
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
                                <SortableTableHead className="w-[100px]" label="Tipe" sortKey="type" currentSort={sortConfig} onSort={handleSort} />
                                <SortableTableHead className="min-w-[400px]" label="Deskripsi" sortKey="description" currentSort={sortConfig} onSort={handleSort} />
                                <TableHead className="w-[100px] text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedData.length === 0 ? (
                                <TableRow><TableCell colSpan={5} className="text-center py-4">Data Visi/Misi tidak ditemukan.</TableCell></TableRow>
                            ) : (
                                paginatedData.map((vm: any, index: number) => (
                                    <TableRow key={vm.id}>
                                        <TableCell className="text-center font-medium text-muted-foreground">
                                            {(pageIndex * pageSize) + index + 1}
                                        </TableCell>
                                        <TableCell className="font-semibold">{vm.code}</TableCell>
                                        <TableCell>
                                            <Badge variant={vm.type === 'vision' ? 'default' : 'secondary'}>{vm.type.toUpperCase()}</Badge>
                                        </TableCell>
                                        <TableCell className="whitespace-normal break-words">{vm.description}</TableCell>
                                        <TableCell className="text-right whitespace-nowrap space-x-2">
                                            {!isLocked && (
                                                <>
                                                    <EditVisionMissionDialog vm={vm} isLocked={isLocked} departmentId={departmentId} curriculumYearId={selectedYearId} />
                                                    <DeleteVisionMissionButton id={vm.id} code={vm.code} disabled={isLocked} />
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
