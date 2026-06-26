'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, CheckSquare, FileSearch, CalendarClock, BookOpen } from 'lucide-react'
import { useClientTable } from '@/app/hooks/useClientTable'
import Link from 'next/link'
import { DataTablePagination } from '../ui/data-table-pagination'
import { SortableTableHead } from '@/app/components/ui/sortable-table-head'
import { QAAlignmentDetailDialog } from './QAAlignmentDetailDialog'
import { Switch } from '@/components/ui/switch'
import { toggleSubjectAnalytics } from '@/app/actions/obeActions'
import { useToast } from '@/hooks/use-toast'

export function QAAlignmentTableClient({ metrics, curriculumYears, hasAnyCurriculum = false }: { metrics: any, curriculumYears: any[], hasAnyCurriculum?: boolean }) {
    const { toast } = useToast()
    const activeCy = curriculumYears.find((cy: any) => cy.isActive) || curriculumYears[0]
    const [selectedCurriculumId, setSelectedCurriculumId] = useState(activeCy ? activeCy.id : '')

    // If no curriculum is selected (or no curriculum exists), don't show any data
    const hasCurriculum = curriculumYears.length > 0 && selectedCurriculumId

    const curriculumFilteredData = !hasCurriculum ? [] : (metrics?.reviewTableData || []).filter((row: any) => {
        return row.curriculumYearIds && row.curriculumYearIds.includes(selectedCurriculumId)
    }).map((row: any) => {
        if (!selectedCurriculumId) return row;

        // Recalculate metrics for the specifically selected curriculum
        const filteredMappings = (row.mappingDetails || []).filter((m: any) => m.curriculumYearId === selectedCurriculumId);
        const uniqueCloCodes = new Set(filteredMappings.map((m: any) => m.cloCode).filter((code: string) => code !== '-'));
        const cloCount = uniqueCloCodes.size;
        const mappedCloCount = cloCount; // Since they are in mappingDetails, they are mapped
        const alignmentPercentage = cloCount > 0 ? 100 : 0;
        const status = cloCount > 0 ? 'Approved' : 'Review';

        const isIncluded = (row.curriculumSubjects || []).find((cs: any) => cs.curriculumYearId === selectedCurriculumId)?.includeInAnalytics ?? true;

        return {
            ...row,
            cloCount,
            mappedCloCount,
            alignmentPercentage,
            status,
            mappingDetails: filteredMappings,
            isIncluded
        };
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
    } = useClientTable(curriculumFilteredData, (row: any) => `${row.code} ${row.title} ${row.instructors}`)

    const activeFilteredData = curriculumFilteredData.filter((r: any) => r.isIncluded);

    const dynamicAlignedCount = activeFilteredData.filter((r: any) => r.status === 'Approved').length;
    const dynamicReviewNeeded = activeFilteredData.filter((r: any) => r.status === 'Review').length;
    const dynamicTotal = activeFilteredData.length;
    const dynamicAlignmentRate = dynamicTotal > 0 ? Math.round((dynamicAlignedCount / dynamicTotal) * 100) : 0;

    const dynamicAllPlos = (metrics?.allPlos || []).filter((p: any) => !selectedCurriculumId || p.curriculumYearId === selectedCurriculumId);
    const dynamicTotalPlos = dynamicAllPlos.length;

    const dynamicMeasuredPloCodes = new Set();
    activeFilteredData.forEach((row: any) => {
        (row.mappingDetails || []).forEach((m: any) => {
            if (m.ploCode && m.ploCode !== '-') dynamicMeasuredPloCodes.add(m.ploCode);
        });
    });
    const dynamicTotalPlosMeasured = dynamicMeasuredPloCodes.size;

    const handleToggleAnalytics = async (subjectId: string, checked: boolean) => {
        if (!selectedCurriculumId) return;
        
        try {
            const res = await toggleSubjectAnalytics(selectedCurriculumId, subjectId, checked);
            if (!res.success) {
                toast({ title: 'Gagal', description: res.error, variant: 'destructive' });
            }
        } catch (error) {
            toast({ title: 'Error', description: 'Gagal mengubah status analitik', variant: 'destructive' });
        }
    };

    // Show empty state when no approved curriculum exists
    if (curriculumYears.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <BookOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                        {hasAnyCurriculum ? 'Belum Ada Kurikulum yang Disetujui' : 'Belum Ada Kurikulum'}
                    </h3>
                    <p className="text-muted-foreground max-w-md mb-4">
                        {hasAnyCurriculum 
                            ? 'Kurikulum telah dibuat tetapi belum disetujui (Approved) oleh Ketua Program Studi. Data pemetaan CLO vs PLO hanya ditampilkan untuk kurikulum yang sudah berstatus Approved.'
                            : 'Anda belum membuat kurikulum untuk program studi ini. Silakan buat kurikulum terlebih dahulu di menu Tinjauan Kurikulum agar data pemetaan CLO vs PLO dapat ditampilkan.'
                        }
                    </p>
                    <Link href="/qa/curriculum">
                        <Button>
                            <BookOpen className="h-4 w-4 mr-2" />
                            {hasAnyCurriculum ? 'Lihat Kurikulum' : 'Buat Kurikulum'}
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="flex flex-col gap-6">
            {/* QA Quick Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Mata Kuliah Terpetakan</CardTitle>
                        <CheckSquare className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dynamicAlignmentRate}%</div>
                        <p className="text-xs text-muted-foreground mt-1">Pemetaan CLO-PLO mencapai 100%</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Usulan Perubahan</CardTitle>
                        <FileSearch className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dynamicReviewNeeded}</div>
                        <p className="text-xs text-muted-foreground mt-1">Mata kuliah butuh review</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Monitoring PLO</CardTitle>
                        <BookOpen className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dynamicTotalPlosMeasured}/{dynamicTotalPlos}</div>
                        <p className="text-xs text-muted-foreground mt-1">PLO diukur semester ini</p>
                    </CardContent>
                </Card>
            </div>

        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <CardTitle>Tinjauan Keselarasan Kurikulum (CLO vs PLO)</CardTitle>
                        <CardDescription>
                            Review pemetaan mata kuliah terhadap Program Learning Outcomes (PLO).
                        </CardDescription>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari mata kuliah..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Select value={selectedCurriculumId} onValueChange={(val) => { setSelectedCurriculumId(val); setPageIndex(0); }}>
                        <SelectTrigger className="w-full sm:w-[250px]">
                            <SelectValue placeholder="Pilih Kurikulum" />
                        </SelectTrigger>
                        <SelectContent>
                            {curriculumYears.map(cy => {
                                const deptCurriculum = cy.departmentCurriculums?.find((dc: any) => dc.departmentId === cy.departmentId || !cy.departmentId)
                                const status = deptCurriculum?.status || 'DRAFT'
                                const isActive = cy.isActive
                                
                                let label = cy.name
                                if (isActive) label += ' (Aktif)'
                                else if (status === 'APPROVED') label += ' (Approved)'
                                else if (status === 'SUBMITTED') label += ' (Menunggu Review)'
                                else label += ' (Draft)'

                                return <SelectItem key={cy.id} value={cy.id}>{label}</SelectItem>
                            })}
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <SortableTableHead label="Kode MK" sortKey="code" currentSort={sortConfig} onSort={handleSort} />
                                <SortableTableHead label="Mata Kuliah" sortKey="title" currentSort={sortConfig} onSort={handleSort} />
                                <TableHead>Dosen Pengampu</TableHead>
                                <TableHead>Pemetaan CLO</TableHead>
                                <SortableTableHead label="Status QA" sortKey="status" currentSort={sortConfig} onSort={handleSort} />
                                <TableHead className="text-center">Ikut Analitik</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        Belum ada data mata kuliah yang sesuai filter.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedData.map((row: any) => (
                                    <TableRow key={row.id} className={!row.isIncluded ? "opacity-50 bg-muted/20" : ""}>
                                        <TableCell className="font-medium">{row.code}</TableCell>
                                        <TableCell>{row.title}</TableCell>
                                        <TableCell>{row.instructors}</TableCell>
                                        <TableCell>{row.alignmentPercentage}% ({row.mappedCloCount} dari {row.cloCount} CLO dipetakan)</TableCell>
                                        <TableCell>
                                            {row.status === 'Approved' ? (
                                                <Badge className="bg-green-500">Approved</Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-orange-500 border-orange-500">Review</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Switch 
                                                checked={row.isIncluded} 
                                                onCheckedChange={(checked) => handleToggleAnalytics(row.id, checked)}
                                                disabled={!selectedCurriculumId}
                                            />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <QAAlignmentDetailDialog row={row} />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div className="mt-4">
                    <DataTablePagination 
                        pageIndex={pageIndex}
                        pageSize={pageSize}
                        totalItems={totalItems}
                        onPageChange={setPageIndex}
                        onPageSizeChange={setPageSize}
                    />
                </div>
            </CardContent>
        </Card>
        </div>
    )
}
