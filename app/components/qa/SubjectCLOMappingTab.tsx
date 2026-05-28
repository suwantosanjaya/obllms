'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { saveSubjectCLOMapping, deleteSubjectCLOMapping } from '@/app/actions/obeActions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Search, Plus, X, Check, Loader2 } from 'lucide-react'
import { useClientTable } from '@/app/hooks/useClientTable'
import { DataTablePagination } from '../ui/data-table-pagination'
import { SortableTableHead } from '@/app/components/ui/sortable-table-head'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { cn } from '@/lib/utils'

type PLO = { id: string, code: string, description: string }
type CLO = { id: string, code: string, description: string, plos?: PLO[] }
type SubjectCLOMapping = { id: string, cloId: string, ploId: string, subjectId: string, weight: number, clo: CLO, plo: PLO }
type Subject = { id: string, code: string, title: string }

type PLOCLOOption = {
    cloId: string
    ploId: string
    label: string
    ploCode: string
    cloCode: string
    description: string
}

function MappingCell({
    subject,
    mappings,
    options,
    isLocked,
    onToggle
}: {
    subject: Subject,
    mappings: SubjectCLOMapping[],
    options: PLOCLOOption[],
    isLocked: boolean,
    onToggle: (subjectId: string, cloId: string, ploId: string, checked: boolean) => Promise<boolean>
}) {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')
    const [loadingMap, setLoadingMap] = useState<string | null>(null)

    const handleSelect = async (opt: PLOCLOOption) => {
        if (isLocked || loadingMap) return
        setLoadingMap(`${opt.ploId}-${opt.cloId}`)
        const isCurrentlyMapped = mappings.some(m => m.subjectId === subject.id && m.cloId === opt.cloId && m.ploId === opt.ploId)
        await onToggle(subject.id, opt.cloId, opt.ploId, !isCurrentlyMapped)
        setLoadingMap(null)
        setSearch('')
    }

    const handleRemove = async (e: React.MouseEvent, m: SubjectCLOMapping) => {
        e.stopPropagation()
        if (isLocked || loadingMap) return
        setLoadingMap(`${m.ploId}-${m.cloId}`)
        await onToggle(m.subjectId, m.cloId, m.ploId, false)
        setLoadingMap(null)
    }

    const currentMappings = [...mappings.filter(m => m.subjectId === subject.id)]
    
    // Sort mappings for display
    currentMappings.sort((a, b) => {
        if (a.plo?.code === b.plo?.code) {
           return (a.clo?.code || '').localeCompare(b.clo?.code || '')
        }
        return (a.plo?.code || '').localeCompare(b.plo?.code || '')
    })

    const searchLower = search.trim().toLowerCase()

    return (
        <div className="flex flex-col items-start gap-2 py-2">
            <div className="flex flex-wrap gap-2">
                {currentMappings.map(m => {
                    const idKey = `${m.ploId}-${m.cloId}`
                    return (
                        <Badge key={idKey} variant="secondary" className="pl-3 pr-1 py-1 flex items-center gap-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200" title={m.clo?.description}>
                            <span className="font-bold">{m.plo?.code || 'PLO'}</span> - <span>{m.clo?.code || 'CLO'}</span>
                            {!isLocked && (
                                <button 
                                    onClick={(e) => handleRemove(e, m)}
                                    disabled={loadingMap === idKey}
                                    className="ml-1 hover:bg-blue-200 rounded-full p-0.5 text-blue-700 transition-colors"
                                >
                                    {loadingMap === idKey ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
                                </button>
                            )}
                        </Badge>
                    )
                })}
            </div>
            
            {!isLocked && (
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="h-7 text-xs border-dashed text-muted-foreground hover:text-foreground">
                            <Plus className="mr-1 h-3 w-3" /> Tambah Pemetaan
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[320px] p-0" align="start">
                        <Command shouldFilter={false}>
                            <CommandInput 
                                placeholder="Cari PLO atau CLO..." 
                                value={search}
                                onValueChange={setSearch}
                            />
                            <CommandList>
                                <CommandEmpty>Tidak ada hasil ditemukan.</CommandEmpty>
                                <CommandGroup className="max-h-[250px] overflow-auto">
                                    {options
                                        .filter(opt => opt.label.toLowerCase().includes(searchLower) || opt.description.toLowerCase().includes(searchLower))
                                        .map(opt => {
                                        const isChecked = currentMappings.some(m => m.cloId === opt.cloId && m.ploId === opt.ploId)
                                        const idKey = `${opt.ploId}-${opt.cloId}`
                                        return (
                                            <CommandItem 
                                                key={idKey} 
                                                value={idKey}
                                                onSelect={() => handleSelect(opt)}
                                                className="cursor-pointer"
                                                disabled={loadingMap !== null}
                                            >
                                                <div className="flex items-start flex-1">
                                                    <div className={cn(
                                                        "mr-3 mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border",
                                                        isChecked ? "bg-primary text-primary-foreground border-primary" : "opacity-50 border-muted-foreground [&_svg]:invisible"
                                                    )}>
                                                        <Check className="h-3 w-3" />
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <span className="font-semibold text-sm leading-none">{opt.label}</span>
                                                        <span className="text-xs text-muted-foreground line-clamp-2 leading-tight">{opt.description}</span>
                                                    </div>
                                                    {loadingMap === idKey && <Loader2 className="ml-auto h-3 w-3 animate-spin text-muted-foreground mt-0.5 shrink-0" />}
                                                </div>
                                            </CommandItem>
                                        )
                                    })}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            )}
        </div>
    )
}

export function SubjectCLOMappingTab({
    subjects,
    allCLOs,
    initialMappings,
    isLocked = false
}: {
    subjects: Subject[],
    allCLOs: CLO[],
    initialMappings: any[],
    isLocked?: boolean
}) {
    const { toast } = useToast()
    const [mappings, setMappings] = useState<any[]>(initialMappings)

    useEffect(() => {
        setMappings(initialMappings)
    }, [initialMappings])

    const options: PLOCLOOption[] = allCLOs
        .filter(clo => clo.plos && clo.plos.length > 0)
        .flatMap(clo =>
            clo.plos!.map(plo => ({
                cloId: clo.id,
                ploId: plo.id,
                label: `${plo.code} - ${clo.code}`,
                ploCode: plo.code,
                cloCode: clo.code,
                description: clo.description
            }))
        )

    const handleToggleMapping = async (subjectId: string, cloId: string, ploId: string, checked: boolean) => {
        if (checked) {
            const res = await saveSubjectCLOMapping(subjectId, cloId, ploId, 0)
            if (res.success) {
                setMappings(prev => [...prev, res.mapping])
                return true
            } else {
                toast({ title: 'Error', description: res.error, variant: 'destructive' })
                return false
            }
        } else {
            const res = await deleteSubjectCLOMapping(subjectId, cloId, ploId)
            if (res.success) {
                setMappings(prev => prev.filter(m => !(m.subjectId === subjectId && m.cloId === cloId && m.ploId === ploId)))
                return true
            } else {
                toast({ title: 'Error', description: res.error, variant: 'destructive' })
                return false
            }
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
    } = useClientTable(subjects, (subject: any) => `${subject.code} ${subject.title}`)

    return (
        <Card className="border-none shadow-none">
            <CardHeader className="px-0">
                <CardTitle>Pemetaan CLO ke Mata Kuliah</CardTitle>
                <CardDescription>
                    Pilih kombinasi PLO dan CLO yang diajarkan pada masing-masing mata kuliah. Sistem akan menyimpan secara otomatis (Auto-Save).
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
                    <Table className="min-w-[800px]">
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="w-[50px] text-center border-r">No</TableHead>
                                <SortableTableHead 
                                    className="w-[300px] font-bold border-r"
                                    sortKey="code"
                                    sortConfig={sortConfig}
                                    onSort={handleSort}
                                    label="Mata Kuliah"
                                />
                                <TableHead className="flex-1">Pemetaan PLO - CLO</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center text-muted-foreground h-24">
                                        Tidak ada mata kuliah ditemukan.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedData.map((subject: any, index: number) => (
                                    <TableRow key={subject.id} className={index % 2 === 0 ? "!bg-background hover:!bg-muted/10" : "!bg-muted/50 hover:!bg-muted/70"}>
                                        <TableCell className="align-top text-center border-r border-b font-medium text-muted-foreground pt-4">
                                            {(pageIndex * pageSize) + index + 1}
                                        </TableCell>
                                        <TableCell className="align-top border-r border-b pt-4">
                                            <div className="font-bold text-sm">{subject.code}</div>
                                            <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{subject.title}</div>
                                        </TableCell>
                                        <TableCell className="align-top border-b">
                                            <MappingCell 
                                                subject={subject}
                                                mappings={mappings}
                                                options={options}
                                                isLocked={isLocked}
                                                onToggle={handleToggleMapping}
                                            />
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
