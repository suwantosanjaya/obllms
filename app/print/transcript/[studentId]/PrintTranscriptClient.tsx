'use client'

import React, { useEffect, useState } from 'react'

export function PrintTranscriptClient({ 
    student, plos, clos, sclAssessments, passThreshold, moderateThreshold 
}: { 
    student: any, plos: any[], clos: any[], sclAssessments: any[], passThreshold: number, moderateThreshold: number 
}) {
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
        // Auto-print when mounted
        const timer = setTimeout(() => {
            window.print()
        }, 500)
        return () => clearTimeout(timer)
    }, [])

    if (!isClient) return null // Prevent hydration mismatch

    const getStatusText = (average: number | null) => {
        if (average === null) return '-'
        if (average < moderateThreshold) return 'Kurang'
        if (average >= passThreshold) return 'Tercapai'
        return 'Sedang'
    }

    const currentDate = new Date().toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })

    const institutionName = student.homebaseDepartment?.faculty?.university?.name || 'Universitas XYZ'
    const institutionLogo = student.homebaseDepartment?.faculty?.university?.logo || '/university-logo.svg'
    const facultyName = student.homebaseDepartment?.faculty?.name || 'Fakultas Ilmu Komputer'
    const departmentName = student.homebaseDepartment?.name || 'Teknik Informatika'

    const calcAverage = (scores: (number | null)[]) => {
        const valid = scores.filter(s => s !== null) as number[];
        if (valid.length === 0) return null;
        return valid.reduce((a, b) => a + b, 0) / valid.length;
    };

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
        <div className="font-serif max-w-[210mm] mx-auto p-4 print:p-0 bg-white text-black min-h-[100vh] print:min-h-0">
            {/* Header / Kop Surat */}
            <div className="border-b-2 border-black pb-4 mb-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <img src={institutionLogo} alt="Logo Universitas" className="w-20 h-20 object-contain" />
                    <div>
                        <h1 className="font-bold text-lg leading-tight capitalize">{institutionName}</h1>
                        <p className="text-sm font-semibold leading-tight">{facultyName}</p>
                        <p className="text-xs leading-tight mt-1">Program Studi {departmentName}</p>
                    </div>
                </div>
                {/* Removed Form info */}
            </div>

            <div className="text-center mb-4">
                <h2 className="text-xl font-bold uppercase underline">Transkrip Capaian Pembelajaran</h2>
                <p className="text-xs mt-1">Outcome-Based Education (OBE) Portfolio</p>
            </div>

            {/* Biodata Mahasiswa */}
            <table className="w-full text-sm mb-4">
                <tbody>
                    <tr>
                        <td className="w-32 font-bold py-0.5">Nama Mahasiswa</td>
                        <td className="w-4">:</td>
                        <td className="py-0.5">{student.name}</td>
                    </tr>
                    <tr>
                        <td className="w-32 font-bold py-0.5">N I M</td>
                        <td className="w-4">:</td>
                        <td className="py-0.5">{student.studentProfile?.nim || '-'}</td>
                    </tr>
                </tbody>
            </table>

            {/* Tabel PLO */}
            <div className="mb-4">
                <h3 className="text-sm font-bold mb-2">A. Capaian Lulusan / Program Learning Outcomes (PLO)</h3>
                <table className="w-full text-xs border-collapse border border-black leading-tight">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-black px-2 py-0.5 text-left w-20">Kode</th>
                            <th className="border border-black px-2 py-0.5 text-left">Deskripsi Kompetensi</th>
                            <th className="border border-black px-2 py-0.5 text-center w-24">Nilai Rata-rata</th>
                            <th className="border border-black px-2 py-0.5 text-center w-20">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {plos.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="border border-black px-2 py-1 text-center italic">Tidak ada data capaian.</td>
                            </tr>
                        ) : (
                            plos.map(plo => (
                                <tr key={plo.id}>
                                    <td className="border border-black px-2 py-0.5 font-bold text-center">{plo.code}</td>
                                    <td className="border border-black px-2 py-0.5">{plo.description}</td>
                                    <td className="border border-black px-2 py-0.5 text-center font-bold">
                                        {plo.average !== null ? plo.average.toFixed(2) : '-'}
                                    </td>
                                    <td className="border border-black px-2 py-0.5 text-center">
                                        {getStatusText(plo.average)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Tabel CLO */}
            <div className="mb-4">
                <h3 className="text-sm font-bold mb-2">B. Rincian Capaian Mata Kuliah / Course Learning Outcomes (CLO)</h3>
                <table className="w-full text-xs border-collapse border border-black leading-tight">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-black px-2 py-0.5 text-left w-20">Kode</th>
                            <th className="border border-black px-2 py-0.5 text-left">Deskripsi Pembelajaran</th>
                            <th className="border border-black px-2 py-0.5 text-center w-24">Nilai</th>
                            <th className="border border-black px-2 py-0.5 text-center w-20">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clos.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="border border-black px-2 py-1 text-center italic">Tidak ada rincian capaian mata kuliah.</td>
                            </tr>
                        ) : (
                            clos.map(clo => (
                                <tr key={clo.id}>
                                    <td className="border border-black px-2 py-0.5 font-bold text-center">{clo.code}</td>
                                    <td className="border border-black px-2 py-0.5">{clo.description}</td>
                                    <td className="border border-black px-2 py-0.5 text-center font-bold">
                                        {clo.average !== null ? clo.average.toFixed(2) : '-'}
                                    </td>
                                    <td className="border border-black px-2 py-0.5 text-center">
                                        {getStatusText(clo.average)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Tabel Soft Skills / SCL */}
            <div className="mb-4 break-inside-avoid" style={{ pageBreakInside: 'avoid' }}>
                <h3 className="text-sm font-bold mb-2">C. Capaian Keterampilan Non-Teknis & Penilaian Berbasis Siswa (SCL)</h3>
                <table className="w-full text-xs border-collapse border border-black leading-tight">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-black px-2 py-0.5 text-left w-20">Kode</th>
                            <th className="border border-black px-2 py-0.5 text-left">Kompetensi Soft-Skill</th>
                            <th className="border border-black px-2 py-0.5 text-center w-24">Nilai Rata-rata</th>
                            <th className="border border-black px-2 py-0.5 text-center w-20">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {aggregatedScl.map((scl, index) => (
                            <tr key={index}>
                                <td className="border border-black px-2 py-0.5 font-bold text-center">{scl.code}</td>
                                <td className="border border-black px-2 py-0.5">{scl.name}</td>
                                <td className="border border-black px-2 py-0.5 text-center font-bold">
                                    {scl.average !== null ? scl.average.toFixed(2) : '-'}
                                </td>
                                <td className="border border-black px-2 py-0.5 text-center">
                                    {getStatusText(scl.average)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer Row (Legend + TTD) */}
            <div className="mt-4 flex justify-between items-end break-inside-avoid" style={{ pageBreakInside: 'avoid' }}>
                
                {/* Keterangan Rentang Nilai */}
                <div className="text-[9px] border border-gray-400 p-1.5 bg-gray-50 w-auto inline-block rounded leading-tight">
                    <p className="font-bold mb-0.5">Keterangan Rentang Nilai Status Capaian:</p>
                    <table className="text-[9px]">
                        <tbody>
                            <tr>
                                <td className="w-16 font-semibold pb-0.5">Tercapai</td>
                                <td className="w-2 pb-0.5">:</td>
                                <td className="pb-0.5">Nilai rata-rata &ge; {passThreshold.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td className="font-semibold pb-0.5">Sedang</td>
                                <td className="pb-0.5">:</td>
                                <td className="pb-0.5">{moderateThreshold.toFixed(2)} &le; Nilai rata-rata &lt; {passThreshold.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td className="font-semibold">Kurang</td>
                                <td>:</td>
                                <td>Nilai rata-rata &lt; {moderateThreshold.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* TTD / Keterangan */}
                <div className="text-sm w-64 text-left">
                    <p className="mb-1">Dikeluarkan pada tanggal: {currentDate}</p>
                    <p className="font-bold">Dekan {facultyName}</p>
                    <div className="h-16"></div>
                    
                    {(() => {
                        const dean = student.homebaseDepartment?.faculty?.activeDean;
                        if (dean) {
                            const profile = dean.teacherProfile;
                            const prefix = profile?.gelarDepan ? `${profile.gelarDepan} ` : '';
                            const suffix = profile?.gelarBelakang ? `, ${profile.gelarBelakang}` : '';
                            const fullName = `${prefix}${dean.name}${suffix}`;
                            const nip = profile?.nip || '.........................';
                            
                            return (
                                <>
                                    <p className="font-bold underline">{fullName}</p>
                                    <p className="text-xs">NIP. {nip}</p>
                                </>
                            )
                        }
                        return (
                            <>
                                <p className="font-bold underline">___________________________</p>
                                <p className="text-xs">NIP. .........................</p>
                            </>
                        )
                    })()}
                </div>
            </div>

            {/* Removed Fixed Footer untuk Print */}
            {/* Print Styling */}
            <style jsx global>{`
                @media print {
                    @page { size: A4; margin: 15mm 15mm 20mm 15mm; }
                    body, html {
                        background: white !important;
                        color: black !important;
                    }
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>
        </div>
    )
}
