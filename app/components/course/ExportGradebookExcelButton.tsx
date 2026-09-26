"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import { calculateStudentOBEGrade } from '@/app/utils/obeCalculator'

interface ExportGradebookExcelProps {
    course: any;
    enrollments: any[];
    assessments: any[];
    submissions: any[];
    subjectClos: any[];
    gradeScales: any[];
}

export function ExportGradebookExcelButton({ course, enrollments, assessments, submissions, subjectClos, gradeScales }: ExportGradebookExcelProps) {
    const [isExporting, setIsExporting] = useState(false)

    const handleExport = async () => {
        setIsExporting(true)
        try {
            const workbook = new ExcelJS.Workbook()
            workbook.creator = 'OLIMS System'
            workbook.created = new Date()

            const sheet = workbook.addWorksheet('Buku Nilai Komponen', {
                views: [{ state: 'frozen', ySplit: 7, xSplit: 3 }]
            })

            // 1. HEADER (Title)
            sheet.mergeCells('A1', 'H1')
            sheet.getCell('A1').value = `Buku Nilai Komponen`
            sheet.getCell('A1').font = { size: 16, bold: true }

            sheet.mergeCells('A2', 'H2')
            sheet.getCell('A2').value = `Mata Kuliah: ${course.subject?.code || ''} - ${course.subject?.title || ''}`
            sheet.getCell('A2').font = { size: 12, bold: true }

            sheet.mergeCells('A3', 'H3')
            sheet.getCell('A3').value = `Kelas: ${course.classCode || ''} | Tahun Ajaran: ${course.academicYear || ''} ${course.semester || ''}`

            // Empty row
            sheet.addRow([])

            // 2. TABLE HEADERS (Row 6 = main header, Row 7 = sub-header with technique/CLO)
            const headerRow1 = sheet.getRow(6)
            const headerRow2 = sheet.getRow(7)

            // Basic Columns
            headerRow1.getCell(1).value = 'No'
            sheet.mergeCells(6, 1, 7, 1)

            headerRow1.getCell(2).value = 'NIM'
            sheet.mergeCells(6, 2, 7, 2)

            headerRow1.getCell(3).value = 'Nama Mahasiswa'
            sheet.mergeCells(6, 3, 7, 3)

            // Nilai Akhir
            headerRow1.getCell(4).value = 'Nilai\nAkhir'
            sheet.mergeCells(6, 4, 7, 4)

            headerRow1.getCell(5).value = 'Huruf'
            sheet.mergeCells(6, 5, 7, 5)

            let currentColIndex = 6

            // Assessment Headers
            assessments.forEach((a: any) => {
                const cloCodes: string[] = (a.assessmentClos ?? [])
                    .map((ac: any) => ac.clo?.code)
                    .filter(Boolean)
                const cloText = cloCodes.length > 0 ? cloCodes.join(', ') : '-'
                
                headerRow1.getCell(currentColIndex).value = a.title
                headerRow1.getCell(currentColIndex).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
                
                headerRow2.getCell(currentColIndex).value = `${a.type || '-'}\n[${cloText}]`
                headerRow2.getCell(currentColIndex).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }

                currentColIndex += 1
            })

            // Status column
            headerRow1.getCell(currentColIndex).value = 'Jumlah\nDinilai'
            sheet.mergeCells(6, currentColIndex, 7, currentColIndex)
            const gradedCountColIndex = currentColIndex
            currentColIndex += 1

            headerRow1.getCell(currentColIndex).value = 'Jumlah\nTugas'
            sheet.mergeCells(6, currentColIndex, 7, currentColIndex)
            const totalCountColIndex = currentColIndex

            // Style Headers
            for (let i = 6; i <= 7; i++) {
                const row = sheet.getRow(i)
                row.height = i === 7 ? 50 : 25
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

            // 3. TABLE BODY
            let rowOffset = 8
            enrollments.forEach((enr: any, idx: number) => {
                const row = sheet.getRow(rowOffset)
                row.getCell(1).value = idx + 1
                row.getCell(1).alignment = { horizontal: 'center' }
                row.getCell(2).value = enr.student.studentProfile?.nim || enr.student.identifier || '-'
                row.getCell(3).value = enr.student.name

                const obeResult = calculateStudentOBEGrade(enr.studentId, assessments, submissions, subjectClos, gradeScales)
                
                // Final Grade
                row.getCell(4).value = obeResult.finalGrade !== null ? Number(obeResult.finalGrade.toFixed(2)) : '-'
                row.getCell(4).alignment = { horizontal: 'center' }
                row.getCell(4).font = { bold: true }
                row.getCell(4).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0F2FE' } }

                row.getCell(5).value = obeResult.letterGrade
                row.getCell(5).alignment = { horizontal: 'center' }
                row.getCell(5).font = { bold: true }
                row.getCell(5).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0F2FE' } }

                let cIdx = 6
                let gradedCount = 0

                // Assessment scores
                assessments.forEach((a: any) => {
                    const sub = submissions.find((s: any) => s.assessmentId === a.id && s.studentId === enr.studentId)
                    
                    if (sub && sub.score !== null) {
                        row.getCell(cIdx).value = Number(sub.score.toFixed(2))
                        row.getCell(cIdx).font = { color: { argb: 'FF15803D' } } // Green-700
                        gradedCount++
                    } else if (sub && sub.content === 'DITOLAK') {
                        row.getCell(cIdx).value = 'Ditolak'
                        row.getCell(cIdx).font = { color: { argb: 'FFEF4444' }, italic: true }
                    } else if (sub) {
                        row.getCell(cIdx).value = 'Menunggu'
                        row.getCell(cIdx).font = { color: { argb: 'FFCA8A04' }, italic: true }
                    } else {
                        row.getCell(cIdx).value = '-'
                        row.getCell(cIdx).font = { color: { argb: 'FF9CA3AF' } }
                    }
                    row.getCell(cIdx).alignment = { horizontal: 'center' }
                    cIdx += 1
                })

                // Summary columns
                row.getCell(gradedCountColIndex).value = gradedCount
                row.getCell(gradedCountColIndex).alignment = { horizontal: 'center' }
                
                row.getCell(totalCountColIndex).value = assessments.length
                row.getCell(totalCountColIndex).alignment = { horizontal: 'center' }

                // Add borders
                row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                    if (colNumber <= totalCountColIndex) {
                        cell.border = {
                            top: { style: 'thin' }, left: { style: 'thin' },
                            bottom: { style: 'thin' }, right: { style: 'thin' }
                        }
                    }
                })

                // Alternate row coloring
                if (idx % 2 === 1) {
                    for (let c = 1; c <= totalCountColIndex; c++) {
                        const cell = row.getCell(c)
                        if (!cell.fill || (cell.fill as any).fgColor?.argb !== 'FFE0F2FE') {
                            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } } // Slate-50
                        }
                    }
                }

                rowOffset += 1
            })

            // 4. CLASS AVERAGE ROW
            const avgRow = sheet.getRow(rowOffset)
            sheet.mergeCells(rowOffset, 1, rowOffset, 3)
            avgRow.getCell(1).value = 'Rata-rata Kelas'
            avgRow.getCell(1).alignment = { horizontal: 'right', vertical: 'middle' }
            avgRow.getCell(1).font = { bold: true }

            // Calculate class average for final grade
            let totalFinalGrade = 0
            let finalGradeCount = 0
            enrollments.forEach((enr: any) => {
                const obeResult = calculateStudentOBEGrade(enr.studentId, assessments, submissions, subjectClos, gradeScales)
                if (obeResult.finalGrade !== null) {
                    totalFinalGrade += obeResult.finalGrade
                    finalGradeCount++
                }
            })
            avgRow.getCell(4).value = finalGradeCount > 0 ? Number((totalFinalGrade / finalGradeCount).toFixed(2)) : '-'
            avgRow.getCell(4).alignment = { horizontal: 'center' }
            avgRow.getCell(4).font = { bold: true }
            avgRow.getCell(5).value = '-'
            avgRow.getCell(5).alignment = { horizontal: 'center' }

            // Calculate class averages per assessment
            let avgCIdx = 6
            assessments.forEach((a: any) => {
                let totalScore = 0
                let scoreCount = 0
                enrollments.forEach((enr: any) => {
                    const sub = submissions.find((s: any) => s.assessmentId === a.id && s.studentId === enr.studentId)
                    if (sub && sub.score !== null) {
                        totalScore += sub.score
                        scoreCount++
                    }
                })
                avgRow.getCell(avgCIdx).value = scoreCount > 0 ? Number((totalScore / scoreCount).toFixed(2)) : '-'
                avgRow.getCell(avgCIdx).alignment = { horizontal: 'center' }
                avgCIdx += 1
            })

            avgRow.getCell(gradedCountColIndex).value = '-'
            avgRow.getCell(totalCountColIndex).value = '-'

            // Style average row
            avgRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                if (colNumber <= totalCountColIndex) {
                    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
                    cell.font = { bold: true }
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } } // Amber-100
                    cell.border = {
                        top: { style: 'medium' }, left: { style: 'thin' },
                        bottom: { style: 'thin' }, right: { style: 'thin' }
                    }
                }
            })

            // 5. Adjust Column Widths
            sheet.getColumn(1).width = 5
            sheet.getColumn(2).width = 15
            sheet.getColumn(3).width = 30
            sheet.getColumn(4).width = 10
            sheet.getColumn(5).width = 8
            for (let i = 6; i <= totalCountColIndex; i++) {
                sheet.getColumn(i).width = 16
            }

            // 6. Save File
            const buffer = await workbook.xlsx.writeBuffer()
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
            saveAs(blob, `Buku_Nilai_${course.subject?.code || 'Komponen'}_${course.classCode || 'Kelas'}.xlsx`)

        } catch (error) {
            console.error("Error exporting gradebook excel:", error)
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
