'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { CreateGraduateProfileDialog } from './CreateGraduateProfileDialog'
import { EditGraduateProfileDialog } from './EditGraduateProfileDialog'
import { DeleteGraduateProfileButton } from './DeleteGraduateProfileButton'
import { useClientTable } from '@/app/hooks/useClientTable'
import { DataTablePagination } from '../ui/data-table-pagination'
import { SortableTableHead } from '@/app/components/ui/sortable-table-head'

export function GraduateProfileTab({ graduateProfiles, mappedVisionMissionsToDropdown, departments, departmentId, selectedYearId, isLocked }: any) {
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
    } = useClientTable(graduateProfiles, (gp: any) => `${gp.code} ${gp.title} ${gp.department?.name || ''} ${gp.visionMission?.code || ''}`)

    return (
        <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <CardTitle>Profil Lulusan Program</CardTitle>
                    <CardDescription>Peran dan kemampuan yang diharapkan dari lulusan, diselaraskan dengan Visi/Misi.</CardDescription>
                </div>
                {!isLocked && <CreateGraduateProfileDialog visionMissions={mappedVisionMissionsToDropdown} departments={departments} selectedYearId={selectedYearId} departmentId={departmentId} />}
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <Input 
                        placeholder="Cari Profil Lulusan..." 
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
                                <SortableTableHead label="Peran / Nama" sortKey="title" currentSort={sortConfig} onSort={handleSort} />
                                <SortableTableHead label="Program Studi" sortKey="department.name" currentSort={sortConfig} onSort={handleSort} />
                                <SortableTableHead label="Penyelarasan (Visi/Misi)" sortKey="visionMission.code" currentSort={sortConfig} onSort={handleSort} />
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedData.length === 0 ? (
                                <TableRow><TableCell colSpan={6} className="text-center py-4">Data Profil Lulusan tidak ditemukan.</TableCell></TableRow>
                            ) : (
                                paginatedData.map((gp: any, index: number) => (
                                    <TableRow key={gp.id}>
                                        <TableCell className="text-center font-medium text-muted-foreground">
                                            {(pageIndex * pageSize) + index + 1}
                                        </TableCell>
                                        <TableCell className="font-semibold">{gp.code}</TableCell>
                                        <TableCell>{gp.title}</TableCell>
                                        <TableCell>{gp.department?.name || '-'}</TableCell>
                                        <TableCell>{gp.visionMission?.code || '-'}</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            {!isLocked && (
                                                <>
                                                    <EditGraduateProfileDialog profile={gp} visionMissions={mappedVisionMissionsToDropdown} departments={departments} departmentId={departmentId} />
                                                    <DeleteGraduateProfileButton id={gp.id} code={gp.code} />
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
