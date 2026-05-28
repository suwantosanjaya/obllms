'use client'

import { useState, useEffect, useMemo } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useClientTable } from '@/app/hooks/useClientTable'
import { DataTablePagination } from '../ui/data-table-pagination'
import { SortableTableHead } from '@/app/components/ui/sortable-table-head'
import { toggleSubjectCLOTechnique } from '@/app/actions/obeActions'
import { Search, Plus, X, Check, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { cn } from '@/lib/utils'

type PLO = { id: string, code: string, description: string }
type CLO = { id: string, code: string, description: string }
type SubjectCLOTechnique = { id: string, technique: string, weight: number }
type SubjectCLO = { id: string, cloId: string, ploId: string, subjectId: string, clo: CLO, plo: PLO, techniques: SubjectCLOTechnique[] }
type Subject = { id: string, code: string, title: string }

const DEFAULT_TECHNIQUES = [
    'Kuis', 'Tugas Individu', 'Tugas Kelompok', 'Praktek / Praktikum', 
    'Unjuk Kerja', 'Ujian Lisan', 'Ujian Tulis (UTS/UAS)', 'Proyek'
]

function TechniqueCell({ 
    mapping, 
    isLocked, 
    allTechniques, 
    onToggle 
}: { 
    mapping: SubjectCLO, 
    isLocked: boolean, 
    allTechniques: string[], 
    onToggle: (mappingId: string, technique: string, checked: boolean) => Promise<boolean> 
}) {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')
    const [loadingTech, setLoadingTech] = useState<string | null>(null)
    
    const currentTechniques = mapping.techniques || []
    const currentTechNames = currentTechniques.map(t => t.technique)

    const handleSelect = async (tech: string) => {
        if (isLocked || loadingTech) return
        setLoadingTech(tech)
        const isCurrentlyChecked = currentTechNames.includes(tech)
        await onToggle(mapping.id, tech, !isCurrentlyChecked)
        setLoadingTech(null)
        setSearch('') // reset search
    }

    const handleRemove = async (e: React.MouseEvent, tech: string) => {
        e.stopPropagation()
        if (isLocked || loadingTech) return
        setLoadingTech(tech)
        await onToggle(mapping.id, tech, false)
        setLoadingTech(null)
    }

    // Determine if we should show the "Create" option
    const searchLower = search.trim().toLowerCase()
    const isSearchExactMatch = allTechniques.some(t => t.toLowerCase() === searchLower)
    const showCreateOption = searchLower.length > 0 && !isSearchExactMatch

    return (
        <div className="flex flex-col items-start gap-2 py-2">
            <div className="flex flex-wrap gap-2">
                {currentTechniques.map(t => (
                    <Badge key={t.id} variant="secondary" className="pl-3 pr-1 py-1 flex items-center gap-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200">
                        {t.technique}
                        {!isLocked && (
                            <button 
                                onClick={(e) => handleRemove(e, t.technique)}
                                disabled={loadingTech === t.technique}
                                className="ml-1 hover:bg-emerald-200 rounded-full p-0.5 text-emerald-700 transition-colors"
                            >
                                {loadingTech === t.technique ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
                            </button>
                        )}
                    </Badge>
                ))}
            </div>
            
            {!isLocked && (
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="h-7 text-xs border-dashed text-muted-foreground hover:text-foreground">
                            <Plus className="mr-1 h-3 w-3" /> Tambah Teknik
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[280px] p-0" align="start">
                        <Command shouldFilter={false}>
                            <CommandInput 
                                placeholder="Ketik atau pilih teknik..." 
                                value={search}
                                onValueChange={setSearch}
                            />
                            <CommandList>
                                <CommandEmpty>
                                    {searchLower.length > 0 ? (
                                        <div className="p-2">
                                            <Button 
                                                variant="ghost" 
                                                size="sm"
                                                className="w-full justify-start text-sm"
                                                onClick={() => handleSelect(search.trim())}
                                                disabled={loadingTech !== null}
                                            >
                                                <Plus className="mr-2 h-4 w-4" />
                                                Gunakan "{search.trim()}"
                                            </Button>
                                        </div>
                                    ) : "Tidak ditemukan."}
                                </CommandEmpty>
                                <CommandGroup className="max-h-[200px] overflow-auto">
                                    {allTechniques
                                        .filter(t => t.toLowerCase().includes(searchLower))
                                        .map(tech => {
                                        const isChecked = currentTechNames.includes(tech)
                                        return (
                                            <CommandItem 
                                                key={tech} 
                                                value={tech}
                                                onSelect={() => handleSelect(tech)}
                                                className="cursor-pointer"
                                                disabled={loadingTech !== null}
                                            >
                                                <div className="flex items-center flex-1">
                                                    <div className={cn(
                                                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                                                        isChecked ? "bg-primary text-primary-foreground border-primary" : "opacity-50 border-muted-foreground [&_svg]:invisible"
                                                    )}>
                                                        <Check className="h-3 w-3" />
                                                    </div>
                                                    <span>{tech}</span>
                                                    {loadingTech === tech && <Loader2 className="ml-auto h-3 w-3 animate-spin text-muted-foreground" />}
                                                </div>
                                            </CommandItem>
                                        )
                                    })}
                                    {showCreateOption && (
                                        <CommandItem 
                                            value={search}
                                            onSelect={() => handleSelect(search.trim())}
                                            className="cursor-pointer font-medium text-primary"
                                        >
                                            <Plus className="mr-2 h-4 w-4" />
                                            Tambahkan "{search.trim()}"
                                        </CommandItem>
                                    )}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            )}
        </div>
    )
}

export function AssessmentDesignTab({
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

    // Only show subjects that have at least one mapping
    const displaySubjects = subjects.filter(subject => mappings.some(m => m.subjectId === subject.id))

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

    // Compute all unique techniques dynamically
    const allTechniques = useMemo(() => {
        const uniqueTechs = new Set(DEFAULT_TECHNIQUES)
        mappings.forEach(m => {
            if (m.techniques) {
                m.techniques.forEach(t => uniqueTechs.add(t.technique))
            }
        })
        return Array.from(uniqueTechs).sort()
    }, [mappings])

    const handleToggleTechnique = async (subjectCloId: string, technique: string, checked: boolean) => {
        if (isLocked) return false

        const res = await toggleSubjectCLOTechnique(subjectCloId, technique, checked)
        if (res.success) {
            setMappings(prev => {
                const newMappings = [...prev]
                const mappingIndex = newMappings.findIndex(m => m.id === subjectCloId)
                if (mappingIndex >= 0) {
                    const mapping = { ...newMappings[mappingIndex] }
                    if (checked && res.technique) {
                        mapping.techniques = [...(mapping.techniques || []), res.technique]
                    } else {
                        mapping.techniques = (mapping.techniques || []).filter(t => t.technique !== technique)
                    }
                    newMappings[mappingIndex] = mapping
                }
                return newMappings
            })
            return true
        } else {
            toast({ title: 'Error', description: res.error, variant: 'destructive' })
            return false
        }
    }

    return (
        <Card className="border-none shadow-none">
            <CardHeader className="px-0">
                <CardTitle>Desain Asesmen (Teknik Penilaian)</CardTitle>
                <CardDescription>
                    Pilih teknik penilaian yang digunakan untuk mengevaluasi setiap CLO pada mata kuliah yang telah dipetakan. Anda dapat memilih dari daftar atau menambahkan teknik penilaian baru.
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
                    <Table className="border min-w-[800px]">
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="w-[50px] text-center border-r">No</TableHead>
                                <SortableTableHead className="w-[250px] font-bold border-r" label="Mata Kuliah" sortKey="code" currentSort={sortConfig} onSort={handleSort} />
                                <TableHead className="w-[120px] text-center border-r">PLO</TableHead>
                                <TableHead className="w-[120px] text-center border-r">CLO</TableHead>
                                <TableHead className="flex-1">Teknik Penilaian</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedData.map((subject, index) => {
                                const subjectMappings = mappings.filter(m => m.subjectId === subject.id)
                                const rowSpan = subjectMappings.length
                                
                                return subjectMappings.map((mapping, mappingIndex) => {
                                    const isFirstRow = mappingIndex === 0

                                    return (
                                        <TableRow key={mapping.id} className={index % 2 === 0 ? "!bg-background hover:!bg-muted/10" : "!bg-muted/50 hover:!bg-muted/70"}>
                                            {isFirstRow && (
                                                <>
                                                    <TableCell rowSpan={rowSpan} className="align-middle text-center border-r border-b font-medium text-muted-foreground">
                                                        {(pageIndex * pageSize) + index + 1}
                                                    </TableCell>
                                                    <TableCell rowSpan={rowSpan} className="font-medium border-r border-b align-top">
                                                        <div className="text-sm font-bold">{subject.code}</div>
                                                        <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{subject.title}</div>
                                                    </TableCell>
                                                </>
                                            )}
                                            <TableCell className="text-center border-r border-b align-top pt-4">
                                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200" title={mapping.plo?.description}>
                                                    {mapping.plo?.code || '-'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center border-r border-b font-semibold bg-muted/10/50 align-top pt-4" title={mapping.clo?.description}>
                                                {mapping.clo?.code || '-'}
                                            </TableCell>
                                            <TableCell className="border-b align-top">
                                                <TechniqueCell 
                                                    mapping={mapping} 
                                                    isLocked={isLocked} 
                                                    allTechniques={allTechniques} 
                                                    onToggle={handleToggleTechnique} 
                                                />
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            })}
                            {paginatedData.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        Tidak ada data mata kuliah yang dipetakan ditemukan.
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
