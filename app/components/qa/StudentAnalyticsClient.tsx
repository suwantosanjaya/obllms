'use client'

import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ChevronDown, ChevronRight, Printer, Info, Target, Award, CheckCircle2, BookOpen } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function StudentAnalyticsClient({ plos, clos, sclAssessments = [], studentId }: { plos: any[], clos: any[], sclAssessments?: any[], studentId: string }) {
    const [expandedPlos, setExpandedPlos] = useState<Record<string, boolean>>({})

    const togglePlo = (ploId: string) => {
        setExpandedPlos(prev => ({ ...prev, [ploId]: !prev[ploId] }))
    }

    const getStatusColor = (average: number | null) => {
        if (average === null) return 'text-muted-foreground'
        if (average < 50) return 'text-red-600 font-bold'
        if (average >= 70) return 'text-green-600 font-bold'
        return 'text-orange-500 font-bold'
    }

    const getRowBgColor = (average: number | null, isClickable: boolean = false) => {
        const baseHover = isClickable ? '' : 'hover:bg-transparent'
        if (average === null) return baseHover
        if (average < 50) {
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

    const calcAverage = (scores: (number | null)[]) => {
        const valid = scores.filter(s => s !== null) as number[];
        if (valid.length === 0) return null;
        return valid.reduce((a, b) => a + b, 0) / valid.length;
    };

    const renderSubjectCount = (clo: any) => {
        return (
            <Popover>
                <PopoverTrigger asChild>
                    <button className="text-right hover:text-blue-500 font-medium hover:underline transition-colors focus:outline-none cursor-pointer">
                        {clo.subjectCount || 0} / {clo.targetSubjectCount || 0}
                    </button>
                </PopoverTrigger>
                <PopoverContent className="w-96 text-left p-4 z-50" side="left" align="center">
                    <div className="space-y-4">
                        <div>
                            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                Sudah Diambil ({clo.takenSubjectsList?.length || 0})
                            </h4>
                            {clo.takenSubjectsList?.length > 0 ? (
                                <ul className="text-sm text-muted-foreground space-y-1.5 ml-6 list-disc">
                                    {clo.takenSubjectsList.map((s: any) => (
                                        <li key={s.id}>
                                            <div className="flex justify-between items-start gap-2 -ml-1">
                                                <span><span className="font-medium text-foreground">{s.code}</span> - {s.name}</span>
                                                <span className="text-[10px] font-medium bg-muted text-muted-foreground px-1.5 py-0.5 rounded shrink-0 whitespace-nowrap">Bobot: {s.weightPercent ? s.weightPercent.toFixed(1) : 0}%</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted-foreground ml-6 italic">Belum ada mata kuliah yang diambil.</p>
                            )}
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-orange-500" />
                                Belum Diambil ({clo.untakenSubjectsList?.length || 0})
                            </h4>
                            {clo.untakenSubjectsList?.length > 0 ? (
                                <ul className="text-sm text-muted-foreground space-y-1.5 ml-6 list-disc">
                                    {clo.untakenSubjectsList.map((s: any) => (
                                        <li key={s.id}>
                                            <div className="flex justify-between items-start gap-2 -ml-1">
                                                <span><span className="font-medium text-foreground">{s.code}</span> - {s.name}</span>
                                                <span className="text-[10px] font-medium bg-muted text-muted-foreground px-1.5 py-0.5 rounded shrink-0 whitespace-nowrap">Bobot: {s.weightPercent ? s.weightPercent.toFixed(1) : 0}%</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted-foreground ml-6 italic">Semua mata kuliah telah diambil.</p>
                            )}
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        )
    }

    const aggregatedScl = [
        {
            code: 'SCL-1',
            name: 'Kewirausahaan (Entrepreneurship)',
            average: calcAverage(sclAssessments.map(s => s.entrepreneurship))
        },
        {
            code: 'SCL-2',
            name: 'Kepemimpinan (Leadership)',
            average: calcAverage(sclAssessments.map(s => s.leadership))
        },
        {
            code: 'SCL-3',
            name: 'Wawasan Industri (Industry Knowledge)',
            average: calcAverage(sclAssessments.map(s => s.industryKnowledge))
        },
        {
            code: 'SCL-4',
            name: 'Kesiapan Kerja (Employability)',
            average: calcAverage(sclAssessments.map(s => s.employabilitySkill))
        }
    ];

    return (
        <div className="space-y-4">
            <div className="flex justify-end mb-2">
                <Button variant="outline" size="sm" asChild>
                    <Link href={`/print/transcript/${studentId}`} target="_blank" rel="noopener noreferrer">
                        <Printer className="w-4 h-4 mr-2" />
                        Cetak Transkrip
                    </Link>
                </Button>
            </div>
            <Tabs defaultValue="plo" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="plo">Rata-rata PLO</TabsTrigger>
                    <TabsTrigger value="clo">Rata-rata CLO</TabsTrigger>
                    <TabsTrigger value="scl">Rata-rata SCL</TabsTrigger>
                </TabsList>
                
                <TabsContent value="plo" className="space-y-4">
                    {!plos || plos.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Tidak ada pemetaan PLO.</p>
                    ) : (
                        <div className="border rounded-md overflow-x-auto bg-card">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[40px]"></TableHead>
                                        <TableHead className="w-[120px]">Kode PLO</TableHead>
                                        <TableHead>Deskripsi</TableHead>
                                        <TableHead className="text-center w-[150px]">CLO Diambil</TableHead>
                                        <TableHead className="text-right w-[100px]">Ketuntasan</TableHead>
                                        <TableHead className="text-right w-[100px]">Skor Rata-rata</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {plos.map((plo: any) => {
                                        const isExpanded = expandedPlos[plo.id]
                                        return (
                                            <React.Fragment key={plo.id}>
                                                <TableRow 
                                                    className={`cursor-pointer transition-colors ${getRowBgColor(plo.average, true)}`}
                                                    onClick={() => togglePlo(plo.id)}
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
                                                                            <TableHead className="text-right text-xs w-[100px] h-8">Jumlah MK</TableHead>
                                                                            <TableHead className="text-right text-xs w-[100px] h-8">Ketuntasan</TableHead>
                                                                            <TableHead className="text-right text-xs w-[100px] h-8">Skor</TableHead>
                                                                        </TableRow>
                                                                    </TableHeader>
                                                                    <TableBody>
                                                                        {!plo.mappedClos || plo.mappedClos.length === 0 ? (
                                                                            <TableRow>
                                                                                <TableCell colSpan={5} className="text-center text-xs text-muted-foreground py-4">Belum ada pemetaan CLO yang diambil</TableCell>
                                                                            </TableRow>
                                                                        ) : (
                                                                            plo.mappedClos.map((clo: any) => (
                                                                                <TableRow key={clo.id} className={getRowBgColor(clo.average, false)}>
                                                                                    <TableCell className="font-medium text-xs">{clo.code}</TableCell>
                                                                                    <TableCell className="text-xs text-muted-foreground">{clo.description}</TableCell>
                                                                                    <TableCell className="text-right text-xs">{renderSubjectCount(clo)}</TableCell>
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
                    {!clos || clos.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Tidak ada data CLO.</p>
                    ) : (
                        <div className="border rounded-md overflow-x-auto bg-card">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[120px]">Kode CLO</TableHead>
                                        <TableHead>Deskripsi</TableHead>
                                        <TableHead className="text-right w-[150px]">Matakuliah Diambil</TableHead>
                                        <TableHead className="text-right w-[100px]">Ketuntasan</TableHead>
                                        <TableHead className="text-right w-[100px]">Skor</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {clos.map((clo: any) => (
                                        <TableRow key={clo.id} className={getRowBgColor(clo.average, false)}>
                                            <TableCell className="font-semibold">{clo.code}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{clo.description}</TableCell>
                                            <TableCell className="text-right text-muted-foreground">{renderSubjectCount(clo)}</TableCell>
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

                <TabsContent value="scl" className="space-y-4">
                    <div className="border rounded-md overflow-x-auto bg-card">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[120px]">Kode SCL</TableHead>
                                    <TableHead>Kompetensi Soft-Skill</TableHead>
                                    <TableHead className="text-right w-[100px]">Skor</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {aggregatedScl.map((scl) => (
                                    <TableRow key={scl.code} className={getRowBgColor(scl.average, false)}>
                                        <TableCell className="font-semibold">{scl.code}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{scl.name}</TableCell>
                                        <TableCell className="text-right">
                                            {renderScoreWithProgress(scl.average)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>
            </Tabs>

            <div className="mt-10 border border-blue-100/50 dark:border-blue-900/30 rounded-xl overflow-hidden bg-gradient-to-br from-blue-50/50 via-transparent to-transparent dark:from-blue-950/20 shadow-sm">
                <div className="bg-blue-50/80 dark:bg-blue-900/20 px-6 py-4 border-b border-blue-100/50 dark:border-blue-800/50 flex items-center gap-3">
                    <div className="p-1.5 bg-blue-100 dark:bg-blue-800/50 rounded-md text-blue-600 dark:text-blue-300">
                        <Info className="w-4 h-4" />
                    </div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100">Panduan Membaca Analitik</h4>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-sm">
                    <div className="flex gap-4">
                        <div className="mt-0.5 text-blue-500 shrink-0">
                            <Target className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="font-semibold text-foreground block mb-1">Ketuntasan Beban Studi</span>
                            <span className="text-muted-foreground leading-relaxed">Persentase kemajuan Anda menyelesaikan beban studi (berdasarkan bobot kurikulum) untuk kompetensi terkait. Bar biru 100% berarti Anda telah menuntaskan seluruh beban untuk metrik ini.</span>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="mt-0.5 text-orange-500 shrink-0">
                            <Award className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="font-semibold text-foreground block mb-1">Skor Rata-rata</span>
                            <span className="text-muted-foreground leading-relaxed">Nilai capaian akademik Anda yang dihitung secara matematis dari rata-rata seluruh nilai tugas/ujian yang dikalikan dengan bobot distribusinya di kurikulum.</span>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="mt-0.5 text-emerald-500 shrink-0">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="font-semibold text-foreground block mb-1">Capaian CLO Diambil</span>
                            <span className="text-muted-foreground leading-relaxed">Menunjukkan berapa banyak indikator capaian mata kuliah (CLO) yang secara kumulatif telah Anda kumpulkan untuk membangun satu kompetensi lulusan (PLO).</span>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="mt-0.5 text-purple-500 shrink-0">
                            <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="font-semibold text-foreground block mb-1">Matakuliah Diambil</span>
                            <span className="text-muted-foreground leading-relaxed">Format pecahan <strong className="text-foreground">X / Y</strong> berarti Anda telah memiliki nilai dari <strong className="text-foreground">X</strong> mata kuliah, dari total <strong className="text-foreground">Y</strong> target mata kuliah di kurikulum yang secara spesifik melatih kompetensi tersebut.</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
