'use client'

import React, { useState, useEffect } from 'react'
import { getDepartmentPloMetrics, getCriticalSubjectsMetrics, getComplianceMetrics } from '@/app/actions/qaMetricsActions'
import PloBarChart from './PloBarChart'
import CriticalCoursesTable from './CriticalCoursesTable'
import ComplianceCards from './ComplianceCards'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function MetricsDashboardClient({ departmentId }: { departmentId: string }) {
    const [academicYear, setAcademicYear] = useState<string>('all')
    const [semester, setSemester] = useState<string>('all')

    const [ploData, setPloData] = useState<any[]>([])
    const [criticalCourses, setCriticalCourses] = useState<any[]>([])
    const [compliance, setCompliance] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            const yr = academicYear === 'all' ? undefined : academicYear
            const sem = semester === 'all' ? undefined : semester

            const [ploRes, criticalRes, complianceRes] = await Promise.all([
                getDepartmentPloMetrics(departmentId, yr, sem),
                getCriticalSubjectsMetrics(departmentId, yr, sem),
                getComplianceMetrics(departmentId, yr, sem)
            ])

            if (ploRes.success) setPloData(ploRes.metrics || [])
            if (criticalRes.success) setCriticalCourses(criticalRes.metrics || [])
            if (complianceRes.success) setCompliance(complianceRes)

            setLoading(false)
        }

        fetchData()
    }, [departmentId, academicYear, semester])

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Metrik Kualitas (QA)</h1>
                    <p className="text-muted-foreground mt-1">Laporan kesehatan dan kepatuhan sistem OBE institusi.</p>
                </div>
                <div className="flex flex-row gap-3">
                    <Select value={academicYear} onValueChange={setAcademicYear}>
                        <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Tahun Akademik" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Tahun</SelectItem>
                            <SelectItem value="2025/2026">2025/2026</SelectItem>
                            <SelectItem value="2024/2025">2024/2025</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={semester} onValueChange={setSemester}>
                        <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Semester" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Semester</SelectItem>
                            <SelectItem value="Ganjil">Ganjil</SelectItem>
                            <SelectItem value="Genap">Genap</SelectItem>
                            <SelectItem value="Pendek">Pendek</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {loading ? (
                <div className="h-[60vh] flex items-center justify-center text-muted-foreground animate-pulse">
                    Memuat metrik...
                </div>
            ) : (
                <div className="flex flex-col gap-6">
                    <ComplianceCards compliance={compliance} />
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <PloBarChart data={ploData} />
                        <CriticalCoursesTable data={criticalCourses} />
                    </div>
                </div>
            )}
        </div>
    )
}
