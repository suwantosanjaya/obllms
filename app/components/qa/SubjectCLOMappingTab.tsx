'use client'

import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Trash2, Plus } from 'lucide-react'
import { getSubjectCLOMappings, saveSubjectCLOMapping, deleteSubjectCLOMapping } from '@/app/actions/obeActions'

type PLO = { id: string, code: string, description: string }
type CLO = { id: string, code: string, description: string, plos?: PLO[] }
type SubjectCLOMapping = { id: string, cloId: string, ploId: string, subjectId: string, weight: number, clo: CLO, plo: PLO }
type Subject = { id: string, code: string, title: string }

// Each option in the Add dropdown is one PLO-CLO combination
type PLOCLOOption = {
    cloId: string
    ploId: string
    label: string     // "PLO-1 - CLO-1"
}

export function SubjectCLOMappingTab({
    subjects,
    allCLOs,
    isLocked = false
}: {
    subjects: Subject[],
    allCLOs: CLO[],
    isLocked?: boolean,
}) {
    const { toast } = useToast()
    const [selectedSubjectId, setSelectedSubjectId] = useState('')
    const [mappings, setMappings] = useState<SubjectCLOMapping[]>([])
    const [loadingMappings, setLoadingMappings] = useState(false)
    const [selectedOptionKey, setSelectedOptionKey] = useState('')
    const [newWeight, setNewWeight] = useState('0')
    const [saving, setSaving] = useState(false)

    // ── Build dropdown options for "Add new mapping" ──────────────────────────
    // A mapping is unique by (ploId, cloId) in the context of this component.
    const mappedPLOCLOKeys = new Set(mappings.map(m => `${m.ploId}|${m.cloId}`))
    
    const dropdownOptions: PLOCLOOption[] = allCLOs
        .filter(clo => clo.plos && clo.plos.length > 0)
        .flatMap(clo =>
            clo.plos!.map(plo => ({
                cloId: clo.id,
                ploId: plo.id,
                label: `${plo.code} - ${clo.code}`,
            }))
        )
        .filter(opt => !mappedPLOCLOKeys.has(`${opt.ploId}|${opt.cloId}`))

    const optionKey = (opt: PLOCLOOption) => `${opt.ploId}|${opt.cloId}`

    const handleSubjectChange = async (subjectId: string) => {
        setSelectedSubjectId(subjectId)
        setSelectedOptionKey('')
        setNewWeight('0')
        setLoadingMappings(true)
        const result = await getSubjectCLOMappings(subjectId)
        if (result.success) {
            setMappings(result.mappings as SubjectCLOMapping[])
        } else {
            toast({ title: 'Error', description: result.error, variant: 'destructive' })
        }
        setLoadingMappings(false)
    }

    const handleAddMapping = async () => {
        if (!selectedSubjectId || !selectedOptionKey) {
            toast({ title: 'Error', description: 'Pilih kombinasi PLO - CLO terlebih dahulu.', variant: 'destructive' })
            return
        }
        
        const [ploId, cloId] = selectedOptionKey.split('|')
        const weight = parseFloat(newWeight) || 0
        
        setSaving(true)
        const result = await saveSubjectCLOMapping(selectedSubjectId, cloId, ploId, weight)
        if (result.success) {
            toast({ title: 'Berhasil', description: 'Pemetaan PLO-CLO berhasil disimpan.' })
            const refresh = await getSubjectCLOMappings(selectedSubjectId)
            if (refresh.success) setMappings(refresh.mappings as SubjectCLOMapping[])
            setSelectedOptionKey('')
            setNewWeight('0')
        } else {
            toast({ title: 'Error', description: result.error, variant: 'destructive' })
        }
        setSaving(false)
    }

    const handleUpdateWeight = async (cloId: string, ploId: string, weight: number) => {
        if (!selectedSubjectId) return
        const result = await saveSubjectCLOMapping(selectedSubjectId, cloId, ploId, weight)
        if (result.success) {
            toast({ title: 'Berhasil', description: 'Bobot berhasil diperbarui.' })
            setMappings(prev => prev.map(m => (m.cloId === cloId && m.ploId === ploId) ? { ...m, weight } : m))
        } else {
            toast({ title: 'Error', description: result.error, variant: 'destructive' })
        }
    }

    const handleDeleteMapping = async (cloId: string, ploId: string) => {
        if (!selectedSubjectId) return
        const result = await deleteSubjectCLOMapping(selectedSubjectId, cloId, ploId)
        if (result.success) {
            toast({ title: 'Berhasil', description: 'Pemetaan PLO-CLO berhasil dihapus.' })
            setMappings(prev => prev.filter(m => !(m.cloId === cloId && m.ploId === ploId)))
        } else {
            toast({ title: 'Error', description: result.error, variant: 'destructive' })
        }
    }

    const totalWeight = mappings.reduce((sum, m) => sum + m.weight, 0)

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Map CLO to Subject</CardTitle>
                    <CardDescription>Select a subject to view its mappings and assign new ones.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLocked && (
                        <div className="mb-6 p-4 bg-yellow-50 text-yellow-800 rounded-md">
                            Kurikulum telah disetujui. Anda tidak dapat mengubah pemetaan CLO-Subject saat ini.
                        </div>
                    )}
                    <div className="flex flex-col gap-4 max-w-sm mb-6">
                        <Select value={selectedSubjectId} onValueChange={handleSubjectChange}>
                            <SelectTrigger className="w-full md:w-96">
                                <SelectValue placeholder="Pilih Mata Kuliah..." />
                            </SelectTrigger>
                            <SelectContent>
                                {subjects.map(s => (
                                    <SelectItem key={s.id} value={s.id}>{s.code} - {s.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedSubjectId && !isLocked && (
                        <div className="bg-muted/30 p-4 rounded-lg space-y-4">
                            <h3 className="font-semibold text-lg border-b pb-2">Add New Mapping</h3>
                            <div className="flex flex-col md:flex-row gap-3 items-end">
                                <div className="flex-1 space-y-1">
                                    <Label className="text-xs">Pilih Kombinasi PLO - CLO</Label>
                                    <Select value={selectedOptionKey} onValueChange={setSelectedOptionKey}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih PLO - CLO..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {dropdownOptions.length === 0 ? (
                                                <SelectItem value="-" disabled>Semua kombinasi sudah dipetakan</SelectItem>
                                            ) : (
                                                dropdownOptions.map(opt => (
                                                    <SelectItem key={optionKey(opt)} value={optionKey(opt)}>
                                                        {opt.label}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="w-32 space-y-1">
                                    <Label className="text-xs">Bobot (%)</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="100"
                                        value={newWeight}
                                        onChange={e => setNewWeight(e.target.value)}
                                        placeholder="0"
                                    />
                                </div>
                                <Button onClick={handleAddMapping} disabled={saving || !selectedOptionKey}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    {saving ? 'Menyimpan...' : 'Tambah'}
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {selectedSubjectId && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-base">Pemetaan PLO - CLO</CardTitle>
                                <CardDescription>
                                    Total bobot CLO:{' '}
                                    <span className={totalWeight > 100 ? 'text-red-500 font-bold' : totalWeight === 100 ? 'text-green-600 font-bold' : 'text-yellow-600 font-bold'}>
                                        {totalWeight.toFixed(1)}%
                                    </span>
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loadingMappings ? (
                            <p className="text-sm text-muted-foreground">Memuat data...</p>
                        ) : mappings.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Belum ada pemetaan PLO-CLO di mata kuliah ini.</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-28">PLO</TableHead>
                                        <TableHead className="w-28">CLO</TableHead>
                                        <TableHead>Deskripsi CLO</TableHead>
                                        <TableHead className="w-32">Bobot (%)</TableHead>
                                        {!isLocked && <TableHead className="w-16"></TableHead>}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {mappings.map(mapping => (
                                        <MappingRow
                                            key={mapping.id}
                                            mapping={mapping}
                                            isLocked={isLocked}
                                            onUpdateWeight={handleUpdateWeight}
                                            onDelete={handleDeleteMapping}
                                        />
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

function MappingRow({
    mapping,
    isLocked,
    onUpdateWeight,
    onDelete,
}: {
    mapping: SubjectCLOMapping,
    isLocked?: boolean
    onUpdateWeight: (cloId: string, ploId: string, weight: number) => void
    onDelete: (cloId: string, ploId: string) => void
}) {
    const [weight, setWeight] = useState(mapping.weight.toString())

    const handleBlur = async () => {
        await onUpdateWeight(mapping.cloId, mapping.ploId, parseFloat(weight) || 0)
    }

    return (
        <TableRow>
            <TableCell>
                <span
                    title={mapping.plo.description}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-700 cursor-help border border-blue-200"
                >
                    {mapping.plo.code}
                </span>
            </TableCell>
            <TableCell className="font-semibold text-sm">{mapping.clo.code}</TableCell>
            <TableCell className="text-sm text-muted-foreground max-w-[280px]">{mapping.clo.description}</TableCell>
            <TableCell>
                <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    className="w-20 h-8 text-sm"
                    value={weight}
                    onChange={e => setWeight(e.target.value)}
                    onBlur={handleBlur}
                    disabled={isLocked}
                />
            </TableCell>
            {!isLocked && (
                <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(mapping.cloId, mapping.ploId)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                </TableCell>
            )}
        </TableRow>
    )
}
