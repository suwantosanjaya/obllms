"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import { calculateStudentOBEGrade } from '@/app/utils/obeCalculator'

interface ExportExcelProps {
    course: any;
    enrollments: any[];
    clos: any[];
    plos: any[];
    assessments: any[];
    submissions: any[];
    subjectClos: any[];
    gradeScales: any[];
}

export function ExportExcelButton({ course, enrollments, clos, plos, assessments, submissions, subjectClos, gradeScales }: ExportExcelProps) {
    const [isExporting, setIsExporting] = useState(false)

    const handleExport = async () => {
        setIsExporting(true)
        try {
            const workbook = new ExcelJS.Workbook()
            workbook.creator = 'OBLMS System'
            workbook.created = new Date()

            const sheet = workbook.addWorksheet('Rekap Nilai & OBE', {
                views: [{ state: 'frozen', ySplit: 7, xSplit: 3 }] // Freeze headers and student names
            })

            // 1. HEADER (Title)
            sheet.mergeCells('A1', 'H1')
            sheet.getCell('A1').value = `Rekapitulasi Nilai & Capaian OBE`
            sheet.getCell('A1').font = { size: 16, bold: true }

            sheet.mergeCells('A2', 'H2')
            sheet.getCell('A2').value = `Mata Kuliah: ${course.subject?.code || ''} - ${course.subject?.title || ''}`
            sheet.getCell('A2').font = { size: 12, bold: true }

            sheet.mergeCells('A3', 'H3')
            sheet.getCell('A3').value = `Kelas: ${course.classCode || ''} | Tahun Ajaran: ${course.academicYear || ''} ${course.semester || ''}`

            // Empty row
            sheet.addRow([])

            // 2. TABLE HEADERS (Row 6 and 7)
            const headerRow1 = sheet.getRow(6)
            const headerRow2 = sheet.getRow(7)

            // Basic Columns (No, NIM, Nama)
            headerRow1.getCell(1).value = 'No'
            sheet.mergeCells(6, 1, 7, 1) // A6:A7

            headerRow1.getCell(2).value = 'NIM'
            sheet.mergeCells(6, 2, 7, 2) // B6:B7

            headerRow1.getCell(3).value = 'Nama Mahasiswa'
            sheet.mergeCells(6, 3, 7, 3) // C6:C7

            let currentColIndex = 4

            // CLO Headers
            clos.forEach((sc: any) => {
                const techniques = sc.techniques || []
                const colSpan = Math.max(1, techniques.length)
                
                headerRow1.getCell(currentColIndex).value = `${sc.clo?.code || 'CLO'} (${sc.weight}%)`
                if (colSpan > 1) {
                    sheet.mergeCells(6, currentColIndex, 6, currentColIndex + colSpan - 1)
                }

                if (techniques.length === 0) {
                    headerRow2.getCell(currentColIndex).value = 'Tanpa Teknik'
                    currentColIndex += 1
                } else {
                    techniques.forEach((t: any) => {
                        headerRow2.getCell(currentColIndex).value = `${t.technique}\n(${t.weight}%)`
                        headerRow2.getCell(currentColIndex).alignment = { wrapText: true, vertical: 'middle', horizontal: 'center' }
                        currentColIndex += 1
                    })
                }
            })

            // CLO Accumulation Headers
            clos.forEach((sc: any) => {
                headerRow1.getCell(currentColIndex).value = `Akumulasi\n${sc.clo?.code || 'CLO'}`
                sheet.mergeCells(6, currentColIndex, 7, currentColIndex)
                currentColIndex += 1
            })

            // PLO Headers
            plos.forEach(([id, plo]: any) => {
                headerRow1.getCell(currentColIndex).value = `Akumulasi\n${plo?.code || id}`
                sheet.mergeCells(6, currentColIndex, 7, currentColIndex)
                currentColIndex += 1
            })

            // Final Grade Headers
            headerRow1.getCell(currentColIndex).value = 'Nilai Akhir\nAngka'
            sheet.mergeCells(6, currentColIndex, 7, currentColIndex)
            const angkaColIndex = currentColIndex
            currentColIndex += 1

            headerRow1.getCell(currentColIndex).value = 'Nilai Akhir\nHuruf'
            sheet.mergeCells(6, currentColIndex, 7, currentColIndex)
            const hurufColIndex = currentColIndex

            // Style Headers
            for (let i = 6; i <= 7; i++) {
                const row = sheet.getRow(i)
                row.height = i === 7 ? 30 : 25
                row.eachCell({ includeEmpty: true }, (cell) => {
                    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
                    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FF1E293B' } // Slate-800
                    }
                    cell.border = {
                        top: { style: 'thin' }, left: { style: 'thin' },
                        bottom: { style: 'thin' }, right: { style: 'thin' }
                    }
                })
            }

            // 3. TABLE BODY (Data)
            let rowOffset = 8
            enrollments.forEach((enr: any, idx: number) => {
                const row = sheet.getRow(rowOffset)
                row.getCell(1).value = idx + 1
                row.getCell(2).value = enr.student.studentProfile?.nim || '-'
                row.getCell(3).value = enr.student.name

                const obeResult = calculateStudentOBEGrade(enr.studentId, assessments, submissions, subjectClos, gradeScales)

                let cIdx = 4
                
                // CLO Data
                clos.forEach((sc: any) => {
                    const techniques = sc.techniques || []
                    
                    if (techniques.length === 0) {
                        const cloData = obeResult.cloResults.get(sc.clo.id)
                        row.getCell(cIdx).value = cloData && cloData.points > 0 ? Number(cloData.points.toFixed(2)) : '-'
                        cIdx += 1
                    } else {
                        techniques.forEach((t: any) => {
                            const techAssessments = assessments.filter((a: any) => 
                                a.type === t.technique && 
                                a.assessmentClos.some((ac: any) => ac.cloId === sc.clo.id)
                            )
                            
                            let techScoreSum = 0;
                            let techCount = 0;

                            techAssessments.forEach((a: any) => {
                                const sub = submissions?.find((s: any) => s.studentId === enr.studentId && s.assessmentId === a.id);
                                if (sub && sub.score !== null) {
                                    const cloScore = sub.cloScores?.find((cs: any) => cs.cloId === sc.clo.id);
                                    if (cloScore && cloScore.score !== null) {
                                        techScoreSum += cloScore.score;
                                        techCount++;
                                    } else {
                                        techScoreSum += sub.score;
                                        techCount++;
                                    }
                                }
                            });

                            const scoreToDisplay = techCount > 0 ? techScoreSum / techCount : null;
                            row.getCell(cIdx).value = scoreToDisplay !== null ? Number(scoreToDisplay.toFixed(2)) : '-'
                            row.getCell(cIdx).alignment = { horizontal: 'center' }
                            cIdx += 1
                        })
                    }
                })

                // CLO Accumulation Data
                clos.forEach((sc: any) => {
                    const cloData = obeResult.cloResults.get(sc.clo.id)
                    row.getCell(cIdx).value = cloData && cloData.mastery !== null 
                        ? `${Number(cloData.points.toFixed(2))}\n(${Number(cloData.mastery.toFixed(2))}%)` 
                        : '-'
                    row.getCell(cIdx).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
                    // Highlight CLO Accumulation
                    row.getCell(cIdx).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0F2FE' } } // Blue-100
                    cIdx += 1
                })

                // PLO Data
                plos.forEach(([id, _]: any) => {
                    const ploData = obeResult.ploResults.get(id)
                    row.getCell(cIdx).value = ploData && ploData.mastery !== null 
                        ? `${Number(ploData.points.toFixed(2))}\n(${Number(ploData.mastery.toFixed(2))}%)` 
                        : '-'
                    row.getCell(cIdx).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
                    // Highlight PLO
                    row.getCell(cIdx).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3E8FF' } } // Purple-100
                    cIdx += 1
                })

                // Final Grades
                row.getCell(angkaColIndex).value = obeResult.finalGrade !== null ? Number(obeResult.finalGrade.toFixed(2)) : '-'
                row.getCell(angkaColIndex).alignment = { horizontal: 'center' }
                row.getCell(angkaColIndex).font = { bold: true }
                
                row.getCell(hurufColIndex).value = obeResult.letterGrade
                row.getCell(hurufColIndex).alignment = { horizontal: 'center' }
                row.getCell(hurufColIndex).font = { bold: true }

                // Add borders to the row
                row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                    if (colNumber <= hurufColIndex) {
                        cell.border = {
                            top: { style: 'thin' }, left: { style: 'thin' },
                            bottom: { style: 'thin' }, right: { style: 'thin' }
                        }
                    }
                })

                rowOffset += 1
            })

            // 4. CLASS AVERAGES ROW
            const classAverages = {
                clo: new Map<string, { totalPoints: number, totalMastery: number, count: number }>(),
                plo: new Map<string, { totalPoints: number, totalMastery: number, count: number }>(),
            }
            
            // Re-calculate to keep component clean
            enrollments.forEach((enr: any) => {
                const obeResult = calculateStudentOBEGrade(enr.studentId, assessments, submissions, subjectClos, gradeScales)
                
                obeResult.cloResults.forEach((val, key) => {
                    if (!classAverages.clo.has(key)) classAverages.clo.set(key, { totalPoints: 0, totalMastery: 0, count: 0 })
                    if (val.mastery !== null) {
                        const acc = classAverages.clo.get(key)!
                        acc.totalPoints += val.points
                        acc.totalMastery += val.mastery
                        acc.count += 1
                    }
                })

                obeResult.ploResults.forEach((val, key) => {
                    if (!classAverages.plo.has(key)) classAverages.plo.set(key, { totalPoints: 0, totalMastery: 0, count: 0 })
                    if (val.mastery !== null) {
                        const acc = classAverages.plo.get(key)!
                        acc.totalPoints += val.points
                        acc.totalMastery += val.mastery
                        acc.count += 1
                    }
                })
            })

            const avgRow = sheet.getRow(rowOffset)
            sheet.mergeCells(rowOffset, 1, rowOffset, 3)
            avgRow.getCell(1).value = 'Rata-rata Kelas'
            avgRow.getCell(1).alignment = { horizontal: 'right', vertical: 'middle' }
            avgRow.getCell(1).font = { bold: true }

            let avgIdx = 4
            // CLO
            clos.forEach((sc: any) => {
                const techniques = sc.techniques || []
                if (techniques.length === 0) {
                    const avg = classAverages.clo.get(sc.clo.id)
                    avgRow.getCell(avgIdx).value = avg && avg.count > 0 ? Number((avg.totalPoints / avg.count).toFixed(2)) : '-'
                    avgIdx += 1
                } else {
                    techniques.forEach(() => {
                        avgRow.getCell(avgIdx).value = '-' // No average for individual techniques yet
                        avgIdx += 1
                    })
                }
            })

            // CLO Accumulations
            clos.forEach((sc: any) => {
                const avg = classAverages.clo.get(sc.clo.id)
                avgRow.getCell(avgIdx).value = avg && avg.count > 0 
                    ? `${(avg.totalPoints / avg.count).toFixed(2)}\n(${(avg.totalMastery / avg.count).toFixed(2)}%)` 
                    : '-'
                avgRow.getCell(avgIdx).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0F2FE' } }
                avgIdx += 1
            })

            // PLO Accumulations
            plos.forEach(([id, _]: any) => {
                const avg = classAverages.plo.get(id)
                avgRow.getCell(avgIdx).value = avg && avg.count > 0 
                    ? `${(avg.totalPoints / avg.count).toFixed(2)}\n(${(avg.totalMastery / avg.count).toFixed(2)}%)` 
                    : '-'
                avgRow.getCell(avgIdx).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3E8FF' } }
                avgIdx += 1
            })

            // Final Grades (skip)
            avgRow.getCell(angkaColIndex).value = '-'
            avgRow.getCell(hurufColIndex).value = '-'

            // Apply styling
            avgRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                if (colNumber <= hurufColIndex) {
                    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
                    cell.font = { bold: true }
                    cell.border = {
                        top: { style: 'medium' }, left: { style: 'thin' },
                        bottom: { style: 'thin' }, right: { style: 'thin' }
                    }
                }
            })
            rowOffset += 3

            // 5. LEGEND
            const legendRow = sheet.getRow(rowOffset)
            legendRow.getCell(1).value = 'Keterangan Pemetaan Kurikulum:'
            legendRow.getCell(1).font = { bold: true }
            rowOffset += 1

            plos.forEach(([ploId, plo]: any) => {
                const ploRow = sheet.getRow(rowOffset)
                ploRow.getCell(2).value = plo?.code || ploId
                ploRow.getCell(2).font = { bold: true, color: { argb: 'FF6B21A8' } } // Purple-700
                if (plo?.description) {
                    ploRow.getCell(3).value = plo.description
                    sheet.mergeCells(rowOffset, 3, rowOffset, 8)
                }
                rowOffset += 1

                const relatedClos = clos.filter((sc: any) => sc.ploId === ploId)
                relatedClos.forEach((sc: any) => {
                    const cloRow = sheet.getRow(rowOffset)
                    cloRow.getCell(3).value = `${sc.clo.code} (${sc.weight}%)`
                    cloRow.getCell(3).font = { bold: true, color: { argb: 'FF1D4ED8' } } // Blue-700
                    if (sc.clo.description) {
                        cloRow.getCell(4).value = sc.clo.description
                        sheet.mergeCells(rowOffset, 4, rowOffset, 8)
                        rowOffset += 1
                    }
                    
                    const techTexts = sc.techniques && sc.techniques.length > 0 
                        ? sc.techniques.map((t: any) => `${t.technique}: ${t.weight}%`).join(', ')
                        : 'Belum ada teknik penilaian'
                    
                    const techRow = sheet.getRow(rowOffset)
                    sheet.mergeCells(rowOffset, 4, rowOffset, 8)
                    techRow.getCell(4).value = techTexts
                    rowOffset += 1
                })
                rowOffset += 1 // Empty row between PLOs
            })

            // Adjust Column Widths
            sheet.getColumn(1).width = 5
            sheet.getColumn(2).width = 15
            sheet.getColumn(3).width = 30
            for (let i = 4; i <= hurufColIndex; i++) {
                sheet.getColumn(i).width = 15
            }

            // Save File
            const buffer = await workbook.xlsx.writeBuffer()
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
            saveAs(blob, `Rekap_Nilai_${course.subject?.code || 'OBE'}_${course.classCode || 'Kelas'}.xlsx`)

        } catch (error) {
            console.error("Error exporting excel:", error)
            alert("Gagal mengunduh file Excel.")
        } finally {
            setIsExporting(false)
        }
    }

    return (
        <Button onClick={handleExport} disabled={isExporting} size="sm" variant="outline" className="gap-2">
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>Ekspor Excel</span>
        </Button>
    )
}
