'use client'

import React, { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ChevronDown, ChevronRight, Info, Target, Award, Users } from 'lucide-react'

export function AngkatanProfileClient({ angkatanProfiles }: { angkatanProfiles: any[] }) {
    const [expandedPlos, setExpandedPlos] = useState<Record<string, boolean>>({})

    if (!angkatanProfiles || angkatanProfiles.length === 0) {
        return <p className="text-muted-foreground italic text-center py-4 text-sm">Data angkatan belum tersedia.</p>
    }

    const togglePlo = (angkatan: string, ploId: string) => {
        const key = `${angkatan}-${ploId}`
        setExpandedPlos(prev => ({ ...prev, [key]: !prev[key] }))
    }

    const getStatusColor = (average: number | null) => {
        if (average === null) return 'text-muted-foreground'
        if (average < 50) return 'text-red-600 font-bold'
        if (average >= 70) return 'text-green-600 font-bold'
        return 'text-orange-500 font-bold'
    }

    const getRowBgColor = (average: number | null, isClickable: boolean = true) => {
        const baseHover = isClickable ? 'hover:bg-muted/50 cursor-pointer' : 'hover:bg-transparent cursor-default'
        if (average !== null && average < 50) {
            return isClickable 
                ? '!bg-red-50/50 hover:!bg-red-50 dark:!bg-red-950/20 dark:hover:!bg-red-950/40' 
                : '!bg-red-50/50 dark:!bg-red-950/20 hover:!bg-red-50/50 dark:hover:!bg-red-950/20'
        }
        return baseHover
    }

    const renderScoreWithProgress = (average: number | null) => {
        if (average === null) return <span className="text-muted-foreground">-</span>
        
        const isCritical = average < 50
        const isGood = average >= 70
        const percentage = Math.min(Math.max(average, 0), 100)
        
        return (
            <div className="flex flex-col items-end justify-center gap-1 w-full">
                <span className={getStatusColor(average)}>{average.toFixed(1)}</span>
                <div className="w-16 h-1 bg-secondary rounded-full overflow-hidden flex-shrink-0">
                    <div 
                        className={`h-full ${isCritical ? 'bg-red-500' : isGood ? 'bg-green-500' : 'bg-orange-400'}`} 
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>
        )
    }

    const renderCompletionProgress = (completion: number) => {
        const percentage = Math.min(Math.max(completion || 0, 0), 100)
        return (
            <div className="flex flex-col items-end justify-center gap-1 w-full">
                <span className="text-muted-foreground font-medium text-xs">{percentage.toFixed(1)}%</span>
                <div className="w-16 h-1 bg-secondary rounded-full overflow-hidden flex-shrink-0">
                    <div className="h-full bg-blue-500" style={{ width: `${percentage}%` }} />
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-12">
            {angkatanProfiles.map((activeProfile) => (
                <div key={activeProfile.angkatan} className="space-y-4">
                    {angkatanProfiles.length > 1 && (
                        <h3 className="text-lg font-semibold border-b pb-2">Angkatan {activeProfile.angkatan}</h3>
                    )}
                    
                    <Tabs defaultValue="plo" className="w-full">
                        <TabsList className="mb-4">
                            <TabsTrigger value="plo">Rata-rata PLO</TabsTrigger>
                            <TabsTrigger value="clo">Rata-rata CLO</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="plo" className="space-y-4">
                            {!activeProfile.plos || activeProfile.plos.length === 0 ? (
                                <p className="text-sm text-muted-foreground">Tidak ada pemetaan PLO pada angkatan ini.</p>
                            ) : (
                                <div className="border rounded-md overflow-x-auto bg-card">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[40px]"></TableHead>
                                            <TableHead className="w-[120px]">Kode PLO</TableHead>
                                            <TableHead>Deskripsi</TableHead>
                                            <TableHead className="text-center w-[150px]">CLO Pembentuk</TableHead>
                                            <TableHead className="text-right w-[100px]">Ketuntasan</TableHead>
                                            <TableHead className="text-right w-[100px]">Rata-rata</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {activeProfile.plos.map((plo: any) => {
                                            const key = `${activeProfile.angkatan}-${plo.id}`
                                            const isExpanded = expandedPlos[key]
                                            return (
                                                <React.Fragment key={plo.id}>
                                                    <TableRow 
                                                        className={`transition-colors ${getRowBgColor(plo.average, true)}`}
                                                        onClick={() => togglePlo(activeProfile.angkatan.toString(), plo.id)}
                                                    >
                                                        <TableCell>
                                                            {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                                                        </TableCell>
                                                        <TableCell className="font-semibold">{plo.code}</TableCell>
                                                        <TableCell className="text-sm text-muted-foreground">{plo.description}</TableCell>
                                                        <TableCell className="text-center text-muted-foreground">{plo.cloCount} CLO</TableCell>
                                                        <TableCell className="text-right">
                                                            {renderCompletionProgress(plo.completion || 0)}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {renderScoreWithProgress(plo.average)}
                                                        </TableCell>
                                                    </TableRow>
                                                    {isExpanded && (
                                                        <TableRow className="bg-muted/10 hover:bg-muted/10">
                                                            <TableCell colSpan={5} className="p-0">
                                                                <div className="pl-12 pr-4 py-3 border-b">
                                                                    <Table className="bg-background border shadow-sm rounded-md overflow-hidden">
                                                                        <TableHeader className="bg-muted/30">
                                                                            <TableRow>
                                                                                <TableHead className="w-[100px] text-xs h-8">Kode CLO</TableHead>
                                                                                <TableHead className="text-xs h-8">Deskripsi</TableHead>
                                                                                <TableHead className="text-right text-xs w-[100px] h-8">Sampel Mhs</TableHead>
                                                                                <TableHead className="text-right text-xs w-[100px] h-8">Ketuntasan</TableHead>
                                                                                <TableHead className="text-right text-xs w-[100px] h-8">Rata-rata</TableHead>
                                                                            </TableRow>
                                                                        </TableHeader>
                                                                        <TableBody>
                                                                            {!plo.mappedClos || plo.mappedClos.length === 0 ? (
                                                                                <TableRow>
                                                                                    <TableCell colSpan={5} className="text-center text-xs text-muted-foreground py-4">Belum ada pemetaan CLO</TableCell>
                                                                                </TableRow>
                                                                            ) : (
                                                                                plo.mappedClos.map((clo: any) => (
                                                                                    <TableRow key={clo.id} className={getRowBgColor(clo.average, false)}>
                                                                                        <TableCell className="font-medium text-xs">{clo.code}</TableCell>
                                                                                        <TableCell className="text-xs text-muted-foreground">{clo.description}</TableCell>
                                                                                        <TableCell className="text-right text-xs">{clo.studentCount}</TableCell>
                                                                                        <TableCell className="text-right">
                                                                                            {renderCompletionProgress(clo.completion || 0)}
                                                                                        </TableCell>
                                                                                        <TableCell className="text-right">
                                                                                            {renderScoreWithProgress(clo.average)}
                                                                                        </TableCell>
                                                                                    </TableRow>
                                                                                ))
                                                                            )}
                                                                        </TableBody>
                                                                    </Table>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </React.Fragment>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="clo" className="space-y-4">
                        {!activeProfile.clos || activeProfile.clos.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Tidak ada data CLO.</p>
                        ) : (
                            <div className="border rounded-md overflow-x-auto bg-card">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[120px]">Kode CLO</TableHead>
                                            <TableHead>Deskripsi</TableHead>
                                            <TableHead className="text-right w-[150px]">Sampel Mahasiswa</TableHead>
                                            <TableHead className="text-right w-[100px]">Ketuntasan</TableHead>
                                            <TableHead className="text-right w-[100px]">Rata-rata</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {activeProfile.clos.map((clo: any) => (
                                            <TableRow key={clo.id} className={getRowBgColor(clo.average, false)}>
                                                <TableCell className="font-semibold">{clo.code}</TableCell>
                                                <TableCell className="text-sm text-muted-foreground">{clo.description}</TableCell>
                                                <TableCell className="text-right text-muted-foreground">{clo.studentCount}</TableCell>
                                                <TableCell className="text-right">
                                                    {renderCompletionProgress(clo.completion || 0)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {renderScoreWithProgress(clo.average)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>

                {/* Legend Card */}
                <div className="mt-8 rounded-xl border bg-card/50 text-card-foreground shadow-sm overflow-hidden">
                    <div className="bg-muted/30 px-6 py-4 border-b flex items-center gap-2">
                        <Info className="w-5 h-5 text-blue-500" />
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100">Panduan Membaca Analitik QA</h4>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6 text-sm">
                        <div className="flex gap-4">
                            <div className="mt-0.5 text-blue-500 shrink-0">
                                <Target className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="font-semibold text-foreground block mb-1">Ketuntasan Kurikulum</span>
                                <span className="text-muted-foreground leading-relaxed">Persentase rata-rata penyelesaian beban studi kurikulum (berdasarkan pembobotan) oleh seluruh mahasiswa di angkatan ini.</span>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="mt-0.5 text-orange-500 shrink-0">
                                <Award className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="font-semibold text-foreground block mb-1">Skor Rata-rata</span>
                                <span className="text-muted-foreground leading-relaxed">Nilai agregat rata-rata capaian akademik mahasiswa. Bar merah (skor &lt; 50) menandakan capaian kritis yang memerlukan evaluasi atau intervensi.</span>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="mt-0.5 text-emerald-500 shrink-0">
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="font-semibold text-foreground block mb-1">Sampel Mahasiswa</span>
                                <span className="text-muted-foreground leading-relaxed">Jumlah mahasiswa di angkatan tersebut yang datanya berhasil diukur karena sudah mengambil dan dinilai pada mata kuliah pembentuk kompetensi terkait.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            ))}
        </div>
    )
}
