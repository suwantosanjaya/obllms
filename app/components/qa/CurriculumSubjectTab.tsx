'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { useClientTable } from '@/app/hooks/useClientTable'
import { DataTablePagination } from '../ui/data-table-pagination'
import { SortableTableHead } from '@/app/components/ui/sortable-table-head'
import { toggleCurriculumSubject } from '@/app/actions/curriculumSubjectActions'

type Subject = { id: string, code: string, title: string, type: string, scope: string, credits: number }
type CurriculumSubject = { id: string, subjectId: string }

export function CurriculumSubjectTab({
    departmentId,
    curriculumYearId,
    allSubjects,
    initialSelected,
    isLocked = false
}: {
    departmentId: string,
    curriculumYearId: string,
    allSubjects: Subject[],
    initialSelected: CurriculumSubject[],
    isLocked?: boolean
}) {
    const { toast } = useToast()
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(initialSelected.map(s => s.subjectId)))

    useEffect(() => {
        setSelectedIds(new Set(initialSelected.map(s => s.subjectId)))
    }, [initialSelected])

    const handleToggle = async (subjectId: string, checked: boolean) => {
        const res = await toggleCurriculumSubject(curriculumYearId, subjectId, departmentId, checked)
        if (res.success) {
            setSelectedIds(prev => {
                const newSet = new Set(prev)
                if (checked) newSet.add(subjectId)
                else newSet.delete(subjectId)
                return newSet
            })
            toast({ title: checked ? 'Ditambahkan' : 'Dihapus', description: 'Mata kuliah berhasil diperbarui di kurikulum.' })
        } else {
            toast({ title: 'Error', description: res.error, variant: 'destructive' })
        }
    }

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
    } = useClientTable(allSubjects, (subject: any) => `${subject.code} ${subject.title}`)

    return (
        <Card className="border-none shadow-none">
            <CardHeader className="px-0">
                <CardTitle>Daftar Mata Kuliah Kurikulum</CardTitle>
                <CardDescription>
                    Pilih mata kuliah dari Master Catalog yang akan dimasukkan ke dalam kurikulum ini. 
                    Mata kuliah yang dipilih akan muncul di langkah Pemetaan selanjutnya.
                </CardDescription>
            </CardHeader>
            <CardContent className="px-0 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-2">
                    <div className="flex items-center space-x-2 w-full sm:w-auto">
                        <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                        <Input 
                            placeholder="Cari Mata Kuliah..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="max-w-sm h-8 w-full"
                        />
                    </div>
                    <div className="text-sm text-muted-foreground whitespace-nowrap">
                        Terpilih: <strong>{selectedIds.size}</strong> mata kuliah
                    </div>
                </div>
                
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px] text-center">Pilih</TableHead>
                                <SortableTableHead sortKey="code" currentSort={sortConfig} onSort={handleSort} label="Kode" />
                                <SortableTableHead sortKey="title" currentSort={sortConfig} onSort={handleSort} label="Nama Mata Kuliah" />
                                <SortableTableHead sortKey="credits" currentSort={sortConfig} onSort={handleSort} label="SKS" />
                                <SortableTableHead sortKey="type" currentSort={sortConfig} onSort={handleSort} label="Tipe" />
                                <SortableTableHead sortKey="scope" currentSort={sortConfig} onSort={handleSort} label="Cakupan" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground h-24">
                                        Tidak ada mata kuliah ditemukan.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedData.map((subject: any) => {
                                    const isSelected = selectedIds.has(subject.id)
                                    return (
                                        <TableRow key={subject.id} className={isSelected ? 'bg-primary/5' : ''}>
                                            <TableCell className="text-center">
                                                <Checkbox
                                                    checked={isSelected}
                                                    disabled={isLocked}
                                                    onCheckedChange={(checked) => handleToggle(subject.id, !!checked)}
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium">{subject.code}</TableCell>
                                            <TableCell>{subject.title}</TableCell>
                                            <TableCell>{subject.credits}</TableCell>
                                            <TableCell className="capitalize">{subject.type}</TableCell>
                                            <TableCell className="capitalize">{subject.scope}</TableCell>
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
