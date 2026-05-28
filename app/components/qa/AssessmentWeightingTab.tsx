'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useClientTable } from '@/app/hooks/useClientTable'
import { DataTablePagination } from '../ui/data-table-pagination'
import { SortableTableHead } from '@/app/components/ui/sortable-table-head'
import { updateSubjectCLOTechniqueWeight } from '@/app/actions/obeActions'
import { Search } from 'lucide-react'

type PLO = { id: string, code: string, description: string }
type CLO = { id: string, code: string, description: string }
type SubjectCLOTechnique = { id: string, technique: string, weight: number }
type SubjectCLO = { id: string, cloId: string, ploId: string, subjectId: string, clo: CLO, plo: PLO, techniques: SubjectCLOTechnique[] }
type Subject = { id: string, code: string, title: string }

export function AssessmentWeightingTab({
    subjects,
    initialMappings,
    isLocked = false
}: {
    subjects: Subject[],
    initialMappings: any[],
    isLocked?: boolean
}) {
    const { toast } = useToast()
    const [mappings, setMappings] = useState<SubjectCLO[]>(initialMappings)

    useEffect(() => {
        setMappings(initialMappings)
    }, [initialMappings])

    // Only show subjects that have at least one mapping AND at least one technique
    const displaySubjects = subjects.filter(subject => 
        mappings.some(m => m.subjectId === subject.id && m.techniques && m.techniques.length > 0)
    )

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
    } = useClientTable(displaySubjects, (subject: any) => `${subject.code} ${subject.title}`)

    const handleUpdateWeight = async (subjectCloId: string, techniqueName: string, weightValue: string) => {
        if (isLocked) return

        const weight = parseFloat(weightValue)
        if (isNaN(weight) || weight < 0) return

        const res = await updateSubjectCLOTechniqueWeight(subjectCloId, techniqueName, weight)
        if (res.success && res.technique) {
            setMappings(prev => {
                const newMappings = [...prev]
                const mappingIndex = newMappings.findIndex(m => m.id === subjectCloId)
                if (mappingIndex >= 0) {
                    const mapping = { ...newMappings[mappingIndex] }
                    const techIndex = (mapping.techniques || []).findIndex(t => t.technique === techniqueName)
                    if (techIndex >= 0) {
                        mapping.techniques = [...mapping.techniques]
                        mapping.techniques[techIndex] = res.technique
                    }
                    newMappings[mappingIndex] = mapping
                }
                return newMappings
            })
            // Silent success to avoid toast spam
        } else {
            toast({ title: 'Error', description: res.error, variant: 'destructive' })
        }
    }

    return (
        <Card className="border-none shadow-none">
            <CardHeader className="px-0">
                <CardTitle>Pembobotan Teknik Penilaian</CardTitle>
                <CardDescription>
                    Isi bobot (dalam persentase) untuk setiap teknik penilaian. Pastikan total bobot seluruh teknik dalam satu Mata Kuliah adalah 100%.
                </CardDescription>
            </CardHeader>
            <CardContent className="px-0 space-y-4">
                <div className="flex items-center space-x-2 px-2">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <Input 
                        placeholder="Cari Mata Kuliah..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="max-w-sm h-8"
                    />
                </div>
                <div className="overflow-x-auto">
                    <Table className="border">
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="w-[50px] text-center border-r">No</TableHead>
                                <SortableTableHead className="w-[250px] font-bold border-r" label="Mata Kuliah" sortKey="code" currentSort={sortConfig} onSort={handleSort} />
                                <TableHead className="w-[100px] text-center font-bold border-r">Total MK %</TableHead>
                                <TableHead className="w-[80px] text-center border-r">PLO</TableHead>
                                <TableHead className="w-[80px] text-center border-r">CLO</TableHead>
                                <TableHead className="border-r min-w-[200px]">Teknik Penilaian</TableHead>
                                <TableHead className="w-[120px] text-center">Bobot (%)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedData.map((subject, index) => {
                                const subjectMappings = mappings.filter(m => m.subjectId === subject.id && m.techniques && m.techniques.length > 0)
                                
                                // Sort subjectMappings by PLO code, then CLO code to group them properly
                                subjectMappings.sort((a, b) => {
                                    if (a.plo?.code === b.plo?.code) {
                                        return (a.clo?.code || '').localeCompare(b.clo?.code || '')
                                    }
                                    return (a.plo?.code || '').localeCompare(b.plo?.code || '')
                                })

                                // Calculate total weight of ALL techniques for this Subject
                                let subjectTotalWeight = 0
                                const ploTotals: Record<string, number> = {}
                                const ploRowSpans: Record<string, number> = {}
                                
                                subjectMappings.forEach(m => {
                                    if (ploTotals[m.ploId] === undefined) {
                                        ploTotals[m.ploId] = 0
                                        ploRowSpans[m.ploId] = 0
                                    }
                                    const techCount = m.techniques?.length || 1
                                    ploRowSpans[m.ploId] += techCount

                                    m.techniques?.forEach(t => {
                                        subjectTotalWeight += t.weight || 0
                                        ploTotals[m.ploId] += t.weight || 0
                                    })
                                })

                                // Calculate total rows needed for this subject
                                const rowSpan = subjectMappings.reduce((sum, m) => sum + (m.techniques?.length || 1), 0)
                                
                                let currentGlobalRowIndex = 0

                                return subjectMappings.map((mapping, mappingIndex) => {
                                    const techniques = mapping.techniques || []
                                    const cloRowSpan = techniques.length > 0 ? techniques.length : 1
                                    
                                    const cloTotalWeight = techniques.reduce((sum, t) => sum + (t.weight || 0), 0)
                                    const ploTotalWeight = ploTotals[mapping.ploId] || 0
                                    
                                    const isFirstMappingForPLO = mappingIndex === 0 || subjectMappings[mappingIndex - 1].ploId !== mapping.ploId

                                    return techniques.map((tech, techIndex) => {
                                        const isFirstRowForSubject = currentGlobalRowIndex === 0
                                        const isFirstRowForCLO = techIndex === 0
                                        const isFirstRowForPLO = isFirstMappingForPLO && techIndex === 0
                                        currentGlobalRowIndex++

                                        return (
                                            <TableRow key={`${mapping.id}-${tech.technique}`} className={index % 2 === 0 ? "!bg-background hover:!bg-muted/10" : "!bg-muted/50 hover:!bg-muted/70"}>
                                                {isFirstRowForSubject && (
                                                    <>
                                                        <TableCell rowSpan={rowSpan} className="align-middle text-center border-r border-b font-medium text-muted-foreground">
                                                            {(pageIndex * pageSize) + index + 1}
                                                        </TableCell>
                                                        <TableCell rowSpan={rowSpan} className="font-medium border-r border-b align-top">
                                                            <div className="text-sm font-bold">{subject.code}</div>
                                                            <div className="text-xs text-muted-foreground">{subject.title}</div>
                                                        </TableCell>
                                                        <TableCell rowSpan={rowSpan} className="text-center border-r border-b align-top">
                                                            <span className={Math.abs(subjectTotalWeight - 100) > 0.01 ? 'text-red-500 font-bold' : 'text-green-600 font-bold'}>
                                                                {subjectTotalWeight.toFixed(1)}%
                                                            </span>
                                                            {Math.abs(subjectTotalWeight - 100) > 0.01 && (
                                                                <div className="text-[10px] text-red-500 mt-1 leading-tight">Harus 100%</div>
                                                            )}
                                                        </TableCell>
                                                    </>
                                                )}
                                                
                                                {isFirstRowForPLO && (
                                                    <TableCell rowSpan={ploRowSpans[mapping.ploId]} className="text-center border-r border-b align-top pt-3">
                                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200" title={mapping.plo?.description}>
                                                            {mapping.plo?.code || '-'}
                                                        </Badge>
                                                        <div className="text-[11px] font-semibold mt-1.5 text-muted-foreground">Total PLO:</div>
                                                        <div className="text-sm font-bold text-blue-700">{ploTotalWeight.toFixed(1)}%</div>
                                                    </TableCell>
                                                )}

                                                {isFirstRowForCLO && (
                                                    <TableCell rowSpan={cloRowSpan} className="text-center border-r border-b align-top pt-3">
                                                        <div className="font-semibold text-sm" title={mapping.clo?.description}>{mapping.clo?.code || '-'}</div>
                                                        <div className="text-[11px] font-semibold mt-1.5 text-muted-foreground">Total CLO:</div>
                                                        <div className="text-sm font-bold text-purple-700">{cloTotalWeight.toFixed(1)}%</div>
                                                    </TableCell>
                                                )}

                                                <TableCell className="border-r border-b text-sm font-medium">
                                                    {tech.technique}
                                                </TableCell>
                                                <TableCell className="text-center align-middle border-b">
                                                    <MatrixInput 
                                                        initialValue={tech.weight?.toString() || '0'} 
                                                        onSave={(val) => handleUpdateWeight(mapping.id, tech.technique, val)}
                                                        isLocked={isLocked}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })
                                })
                            })}
                            {paginatedData.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        Tidak ada data yang ditemukan. Pastikan Anda telah melakukan Pemetaan dan Desain Asesmen.
                                    </TableCell>
                                </TableRow>
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

function MatrixInput({ initialValue, onSave, isLocked }: { initialValue: string, onSave: (val: string) => void, isLocked: boolean }) {
    const [value, setValue] = useState(initialValue)

    useEffect(() => {
        setValue(initialValue)
    }, [initialValue])

    const handleBlur = () => {
        if (value !== initialValue) {
            onSave(value)
        }
    }

    if (isLocked) {
        return <div className="text-sm text-center font-medium">{initialValue && initialValue !== '0' ? `${initialValue}%` : '-'}</div>
    }

    return (
        <Input
            type="number"
            step="0.01"
            min="0"
            max="100"
            className={`w-20 h-8 text-center mx-auto ${parseFloat(value) > 0 ? 'bg-green-50 border-green-200 text-green-700 font-medium' : ''}`}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={handleBlur}
        />
    )
}
