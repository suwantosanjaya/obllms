'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'

export function CurriculumReportTab({
    visionMissions,
    graduateProfiles,
    plos,
    clos,
    subjects,
    mappings
}: {
    visionMissions: any[]
    graduateProfiles: any[]
    plos: any[]
    clos: any[]
    subjects: any[]
    mappings: any[]
}) {
    const handlePrint = () => {
        window.print()
    }

    // Filter subjects to only those that have at least one mapping
    const mappedSubjects = subjects.filter(subject => 
        mappings.some(m => m.subjectId === subject.id)
    )

    // Pre-process mappings for Section 6 (Bobot per PLO)
    const ploGroups: Record<string, {
        ploCode: string;
        totalWeight: number;
        subjects: Record<string, {
            subjectCode: string;
            clos: {
                cloCode: string;
                weight: number;
            }[]
        }>
    }> = {}

    mappings.forEach(m => {
        if (!m.plo || !m.clo) return;
        const ploCode = m.plo.code;
        const subjectCode = subjects.find(s => s.id === m.subjectId)?.code || '-';
        const cloCode = m.clo.code;

        if (!ploGroups[ploCode]) {
            ploGroups[ploCode] = { ploCode, totalWeight: 0, subjects: {} }
        }

        if (!ploGroups[ploCode].subjects[subjectCode]) {
            ploGroups[ploCode].subjects[subjectCode] = { subjectCode, clos: [] }
        }

        const cloWeight = m.techniques?.reduce((sum: number, t: any) => sum + (t.weight || 0), 0) || 0;
        
        ploGroups[ploCode].subjects[subjectCode].clos.push({
            cloCode,
            weight: cloWeight
        });

        ploGroups[ploCode].totalWeight += cloWeight;
    });

    const sortedPLOs = Object.values(ploGroups).sort((a, b) => a.ploCode.localeCompare(b.ploCode));

    return (
        <Card className="border-none shadow-none">
            <CardHeader className="px-0 flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="print:hidden">Laporan Kurikulum</CardTitle>
                    <CardDescription className="print:hidden">
                        Ringkasan seluruh data kurikulum mulai dari Visi Misi hingga Pembobotan Asesmen.
                    </CardDescription>
                </div>
                <Button onClick={handlePrint} className="print:hidden">
                    <Printer className="mr-2 h-4 w-4" /> Cetak Laporan
                </Button>
            </CardHeader>
            <CardContent className="px-0 space-y-12 print:space-y-8 print:text-sm">
                
                {/* 1. Visi & Misi */}
                <section>
                    <h3 className="text-lg font-bold mb-4 print:text-base">1. Visi & Misi</h3>
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="w-[100px]">Kode</TableHead>
                                    <TableHead className="w-[150px]">Tipe</TableHead>
                                    <TableHead>Deskripsi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {visionMissions.length === 0 ? (
                                    <TableRow><TableCell colSpan={3} className="text-center">Tidak ada data.</TableCell></TableRow>
                                ) : (
                                    visionMissions.map(vm => (
                                        <TableRow key={vm.id}>
                                            <TableCell className="font-semibold">{vm.code}</TableCell>
                                            <TableCell className="capitalize">{vm.type.replace('_', ' ')}</TableCell>
                                            <TableCell>{vm.description}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </section>

                {/* 2. Profil Lulusan */}
                <section>
                    <h3 className="text-lg font-bold mb-4 print:text-base">2. Profil Lulusan & Pemetaan VM</h3>
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="w-[100px]">Kode</TableHead>
                                    <TableHead className="w-[200px]">Profil Lulusan</TableHead>
                                    <TableHead>Deskripsi</TableHead>
                                    <TableHead className="w-[200px]">VM Terkait</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {graduateProfiles.length === 0 ? (
                                    <TableRow><TableCell colSpan={4} className="text-center">Tidak ada data.</TableCell></TableRow>
                                ) : (
                                    graduateProfiles.map(gp => (
                                        <TableRow key={gp.id}>
                                            <TableCell className="font-semibold">{gp.code}</TableCell>
                                            <TableCell>{gp.title}</TableCell>
                                            <TableCell>{gp.description}</TableCell>
                                            <TableCell>
                                                {gp.visionMission?.code || '-'}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </section>

                {/* 3. PLO */}
                <section>
                    <h3 className="text-lg font-bold mb-4 print:text-base">3. Capaian Pembelajaran Lulusan (PLO) & Pemetaan GP</h3>
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="w-[100px]">Kode</TableHead>
                                    <TableHead>Deskripsi PLO</TableHead>
                                    <TableHead className="w-[200px]">GP Terkait</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {plos.length === 0 ? (
                                    <TableRow><TableCell colSpan={3} className="text-center">Tidak ada data.</TableCell></TableRow>
                                ) : (
                                    plos.map(plo => (
                                        <TableRow key={plo.id}>
                                            <TableCell className="font-semibold">{plo.code}</TableCell>
                                            <TableCell>{plo.description}</TableCell>
                                            <TableCell>
                                                {plo.graduateProfiles?.map((gp: any) => gp.code).join(', ') || '-'}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </section>

                {/* 4. CLO */}
                <section>
                    <h3 className="text-lg font-bold mb-4 print:text-base">4. Capaian Pembelajaran Mata Kuliah (CLO) & Pemetaan PLO</h3>
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="w-[100px]">Kode</TableHead>
                                    <TableHead>Deskripsi CLO</TableHead>
                                    <TableHead className="w-[200px]">PLO Terkait</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {clos.length === 0 ? (
                                    <TableRow><TableCell colSpan={3} className="text-center">Tidak ada data.</TableCell></TableRow>
                                ) : (
                                    clos.map(clo => (
                                        <TableRow key={clo.id}>
                                            <TableCell className="font-semibold">{clo.code}</TableCell>
                                            <TableCell>{clo.description}</TableCell>
                                            <TableCell>
                                                {clo.plos?.map((plo: any) => plo.code).join(', ') || '-'}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </section>

                {/* 5. Master Matriks */}
                <section>
                    <h3 className="text-lg font-bold mb-4 print:text-base">5. Master Matriks: Pemetaan MK, Asesmen & Pembobotan</h3>
                    <div className="border rounded-md">
                        <Table className="border-collapse">
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="w-[50px] border-r">No</TableHead>
                                    <TableHead className="w-[250px] border-r">Mata Kuliah</TableHead>
                                    <TableHead className="w-[50px] text-center border-r">SKS</TableHead>
                                    <TableHead className="w-[80px] text-center border-r">PLO</TableHead>
                                    <TableHead className="w-[80px] text-center border-r">CLO</TableHead>
                                    <TableHead className="border-r">Teknik Penilaian</TableHead>
                                    <TableHead className="w-[80px] text-center">Bobot</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mappedSubjects.length === 0 ? (
                                    <TableRow><TableCell colSpan={7} className="text-center">Tidak ada mata kuliah yang dipetakan.</TableCell></TableRow>
                                ) : (
                                    mappedSubjects.map((subject, subjectIndex) => {
                                        const subjectMappings = mappings.filter(m => m.subjectId === subject.id)
                                        
                                        // Sort subjectMappings by PLO code, then CLO code to group them properly
                                        subjectMappings.sort((a, b) => {
                                            if (a.plo?.code === b.plo?.code) {
                                                return (a.clo?.code || '').localeCompare(b.clo?.code || '')
                                            }
                                            return (a.plo?.code || '').localeCompare(b.plo?.code || '')
                                        })

                                        let subjectTotalWeight = 0
                                        const ploTotals: Record<string, number> = {}
                                        const ploRowSpans: Record<string, number> = {}
                                        
                                        subjectMappings.forEach(m => {
                                            if (ploTotals[m.ploId] === undefined) {
                                                ploTotals[m.ploId] = 0
                                                ploRowSpans[m.ploId] = 0
                                            }
                                            const techCount = m.techniques && m.techniques.length > 0 ? m.techniques.length : 1
                                            ploRowSpans[m.ploId] += techCount

                                            if (m.techniques) {
                                                m.techniques.forEach((t: any) => {
                                                    subjectTotalWeight += t.weight || 0
                                                    ploTotals[m.ploId] += t.weight || 0
                                                })
                                            }
                                        })
                                        
                                        // Calculate total rows needed for this subject
                                        const rowSpan = subjectMappings.reduce((sum, m) => sum + Math.max(m.techniques?.length || 1, 1), 0)
                                        
                                        let currentGlobalRowIndex = 0

                                        return subjectMappings.map((mapping, mappingIndex) => {
                                            const techniques = mapping.techniques && mapping.techniques.length > 0 
                                                ? mapping.techniques 
                                                : [{ technique: '-', weight: 0 }] // dummy if no technique

                                            const cloRowSpan = techniques.length
                                            
                                            const cloTotalWeight = techniques.reduce((sum: number, t: any) => sum + (t.weight || 0), 0)
                                            const ploTotalWeight = ploTotals[mapping.ploId] || 0
                                            
                                            const isFirstMappingForPLO = mappingIndex === 0 || subjectMappings[mappingIndex - 1].ploId !== mapping.ploId

                                            return techniques.map((tech: any, techIndex: number) => {
                                                const isFirstRowForSubject = currentGlobalRowIndex === 0
                                                const isFirstRowForCLO = techIndex === 0
                                                const isFirstRowForPLO = isFirstMappingForPLO && techIndex === 0
                                                currentGlobalRowIndex++

                                                return (
                                                    <TableRow key={`${subject.id}-${mapping.id}-${techIndex}`} className={subjectIndex % 2 === 0 ? "!bg-background" : "!bg-muted/50"}>
                                                        {isFirstRowForSubject && (
                                                            <>
                                                                <TableCell rowSpan={rowSpan} className="align-top text-center border-r border-b text-muted-foreground">
                                                                    {subjectIndex + 1}
                                                                </TableCell>
                                                                <TableCell rowSpan={rowSpan} className="align-top border-r border-b">
                                                                    <div className="font-bold">{subject.code}</div>
                                                                    <div className="text-sm text-muted-foreground">{subject.title}</div>
                                                                </TableCell>
                                                                <TableCell rowSpan={rowSpan} className="align-top text-center border-r border-b">
                                                                    <div className="font-medium">{subject.credits || '-'} SKS</div>
                                                                    <div className="mt-2 text-[11px] text-muted-foreground">Total Bobot:</div>
                                                                    <div className={Math.abs(subjectTotalWeight - 100) > 0.01 ? 'text-sm text-red-500 font-bold' : 'text-sm text-green-600 font-bold'}>
                                                                        {subjectTotalWeight.toFixed(1)}%
                                                                    </div>
                                                                </TableCell>
                                                            </>
                                                        )}
                                                        
                                                        {isFirstRowForPLO && (
                                                            <TableCell rowSpan={ploRowSpans[mapping.ploId]} className="align-top text-center border-r border-b">
                                                                <div className="font-semibold">{mapping.plo?.code || '-'}</div>
                                                                <div className="text-[11px] font-semibold mt-1 text-muted-foreground">Total:</div>
                                                                <div className="text-sm font-bold">{ploTotalWeight.toFixed(1)}%</div>
                                                            </TableCell>
                                                        )}

                                                        {isFirstRowForCLO && (
                                                            <TableCell rowSpan={cloRowSpan} className="align-top text-center border-r border-b">
                                                                <div className="font-semibold">{mapping.clo?.code || '-'}</div>
                                                                <div className="text-[11px] font-semibold mt-1 text-muted-foreground">Total:</div>
                                                                <div className="text-sm font-bold">{cloTotalWeight.toFixed(1)}%</div>
                                                            </TableCell>
                                                        )}

                                                        <TableCell className="border-r border-b">
                                                            {tech.technique}
                                                        </TableCell>
                                                        <TableCell className="text-center border-b">
                                                            {tech.weight ? `${tech.weight}%` : '-'}
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            })
                                        })
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </section>

                {/* 6. Bobot per PLO */}
                <section>
                    <h3 className="text-lg font-bold mb-4 print:text-base">6. Rekapitulasi Bobot per PLO</h3>
                    <div className="border rounded-md">
                        <Table className="border-collapse">
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="w-[50px] text-center border-r">No</TableHead>
                                    <TableHead className="w-[100px] text-center border-r">PLO</TableHead>
                                    <TableHead className="w-[150px] text-center border-r">Mata Kuliah</TableHead>
                                    <TableHead className="w-[150px] text-center border-r">CLO</TableHead>
                                    <TableHead className="w-[120px] text-center border-r">Bobot CLO</TableHead>
                                    <TableHead className="w-[150px] text-center">Total Bobot PLO</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedPLOs.length === 0 ? (
                                    <TableRow><TableCell colSpan={6} className="text-center">Tidak ada data pembobotan.</TableCell></TableRow>
                                ) : (
                                    sortedPLOs.map((ploGroup, ploIndex) => {
                                        const ploRowSpan = Object.values(ploGroup.subjects).reduce((sum, s) => sum + s.clos.length, 0);
                                        const sortedSubjects = Object.values(ploGroup.subjects).sort((a,b) => a.subjectCode.localeCompare(b.subjectCode));

                                        return sortedSubjects.map((subject, subjectIndex) => {
                                            const subjectRowSpan = subject.clos.length;
                                            const sortedClos = subject.clos.sort((a,b) => a.cloCode.localeCompare(b.cloCode));

                                            return sortedClos.map((clo, cloIndex) => {
                                                const isFirstRowForPLO = subjectIndex === 0 && cloIndex === 0;
                                                const isFirstRowForSubject = cloIndex === 0;

                                                return (
                                                    <TableRow key={`${ploGroup.ploCode}-${subject.subjectCode}-${clo.cloCode}`} className={ploIndex % 2 === 0 ? "!bg-background" : "!bg-muted/50"}>
                                                        {isFirstRowForPLO && (
                                                            <>
                                                                <TableCell rowSpan={ploRowSpan} className="align-middle text-center border-r border-b font-medium text-muted-foreground">
                                                                    {ploIndex + 1}
                                                                </TableCell>
                                                                <TableCell rowSpan={ploRowSpan} className="align-middle text-center border-r border-b font-bold">
                                                                    {ploGroup.ploCode}
                                                                </TableCell>
                                                            </>
                                                        )}
                                                        {isFirstRowForSubject && (
                                                            <TableCell rowSpan={subjectRowSpan} className="align-middle text-center border-r border-b font-medium">
                                                                {subject.subjectCode}
                                                            </TableCell>
                                                        )}
                                                        <TableCell className="align-middle text-center border-r border-b">
                                                            {clo.cloCode}
                                                        </TableCell>
                                                        <TableCell className="align-middle text-center border-r border-b">
                                                            {clo.weight.toFixed(1).replace('.0', '')}%
                                                        </TableCell>
                                                        {isFirstRowForPLO && (
                                                            <TableCell rowSpan={ploRowSpan} className="align-middle text-center border-b font-bold">
                                                                {ploGroup.totalWeight.toFixed(1).replace('.0', '')}%
                                                            </TableCell>
                                                        )}
                                                    </TableRow>
                                                )
                                            })
                                        })
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </section>

                <style dangerouslySetInnerHTML={{__html: `
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        .print\\:hidden {
                            display: none !important;
                        }
                        /* Print only the CardContent */
                        .border-none > .px-0, .border-none > .px-0 * {
                            visibility: visible;
                        }
                        .border-none > .px-0 {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                        }
                        /* Ensure table borders render well */
                        table {
                            border-collapse: collapse;
                            width: 100%;
                        }
                        th, td {
                            border: 1px solid #e5e7eb !important;
                        }
                        /* Page breaks */
                        section {
                            page-break-inside: avoid;
                            margin-bottom: 2rem;
                        }
                    }
                `}} />
            </CardContent>
        </Card>
    )
}
