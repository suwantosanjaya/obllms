'use client'

import React, { useEffect, useState } from 'react'

export function PrintTranscriptClient({ student, plos, clos }: { student: any, plos: any[], clos: any[] }) {
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
        if (average < 50) return 'Kurang'
        if (average >= 70) return 'Tercapai'
        return 'Sedang'
    }

    const currentDate = new Date().toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })

    const institutionName = student.homebaseDepartment?.faculty?.university?.name || 'Universitas XYZ'
    const facultyName = student.homebaseDepartment?.faculty?.name || 'Fakultas Ilmu Komputer'
    const departmentName = student.homebaseDepartment?.name || 'Teknik Informatika'

    return (
        <div className="font-serif max-w-[210mm] mx-auto p-4 print:p-0 bg-white text-black min-h-screen">
            {/* Header / Kop Surat */}
            <div className="border-b-2 border-black pb-2 mb-4 flex items-center justify-between">
                <div>
                    <h1 className="text-lg font-bold uppercase tracking-wider">{institutionName}</h1>
                    <p className="text-xs">{facultyName}</p>
                    <p className="text-xs">Departemen {departmentName}</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-500">Form: OBE-01</p>
                    <p className="text-xs text-gray-500">Rev: 2.0</p>
                </div>
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
                <table className="w-full text-xs border-collapse border border-black">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-black px-2 py-1 text-left w-20">Kode</th>
                            <th className="border border-black px-2 py-1 text-left">Deskripsi Kompetensi</th>
                            <th className="border border-black px-2 py-1 text-center w-24">Nilai Rata-rata</th>
                            <th className="border border-black px-2 py-1 text-center w-20">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {plos.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="border border-black px-2 py-2 text-center italic">Tidak ada data capaian.</td>
                            </tr>
                        ) : (
                            plos.map(plo => (
                                <tr key={plo.id}>
                                    <td className="border border-black px-2 py-1 font-bold text-center">{plo.code}</td>
                                    <td className="border border-black px-2 py-1">{plo.description}</td>
                                    <td className="border border-black px-2 py-1 text-center font-bold">
                                        {plo.average !== null ? plo.average.toFixed(2) : '-'}
                                    </td>
                                    <td className="border border-black px-2 py-1 text-center">
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
                <table className="w-full text-xs border-collapse border border-black">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-black px-2 py-1 text-left w-20">Kode</th>
                            <th className="border border-black px-2 py-1 text-left">Deskripsi Pembelajaran</th>
                            <th className="border border-black px-2 py-1 text-center w-24">Nilai</th>
                            <th className="border border-black px-2 py-1 text-center w-20">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clos.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="border border-black px-2 py-2 text-center italic">Tidak ada rincian capaian mata kuliah.</td>
                            </tr>
                        ) : (
                            clos.map(clo => (
                                <tr key={clo.id}>
                                    <td className="border border-black px-2 py-1 text-center">{clo.code}</td>
                                    <td className="border border-black px-2 py-1">{clo.description}</td>
                                    <td className="border border-black px-2 py-1 text-center">
                                        {clo.average !== null ? clo.average.toFixed(2) : '-'}
                                    </td>
                                    <td className="border border-black px-2 py-1 text-center">
                                        {getStatusText(clo.average)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Keterangan Rentang Nilai */}
            <div className="mb-8 text-[11px] border border-gray-400 p-3 bg-gray-50 w-2/3 rounded break-inside-avoid" style={{ pageBreakInside: 'avoid' }}>
                <p className="font-bold mb-1">Keterangan Rentang Nilai Status Capaian:</p>
                <table className="w-full text-xs">
                    <tbody>
                        <tr>
                            <td className="w-24 font-semibold">Tercapai</td>
                            <td className="w-4">:</td>
                            <td>Nilai rata-rata &ge; 70.00</td>
                        </tr>
                        <tr>
                            <td className="font-semibold">Sedang</td>
                            <td>:</td>
                            <td>50.00 &le; Nilai rata-rata &lt; 70.00</td>
                        </tr>
                        <tr>
                            <td className="font-semibold">Kurang</td>
                            <td>:</td>
                            <td>Nilai rata-rata &lt; 50.00</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* TTD / Keterangan */}
            <div className="flex justify-end mt-8 text-sm break-inside-avoid" style={{ pageBreakInside: 'avoid' }}>
                <div className="text-center w-64">
                    <p className="mb-16">Dikeluarkan pada tanggal: {currentDate}</p>
                    <p className="border-t border-black pt-1">Sistem Penjaminan Mutu OBE</p>
                </div>
            </div>

            {/* Fixed Footer untuk Print */}
            <div className="hidden print:block fixed bottom-0 left-0 w-full text-center text-[10px] text-gray-500 border-t pt-2 bg-white">
                Transkrip Portofolio OBE ini dihasilkan secara otomatis oleh Outcome-Based Learning Management System (OBLMS).
            </div>

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
