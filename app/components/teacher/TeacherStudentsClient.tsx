'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getCourseStudentAnalytics } from '@/app/actions/teacherAnalyticsActions'
import { Loader2, Users, AlertTriangle, CheckCircle2, TrendingDown } from 'lucide-react'

export default function TeacherStudentsClient({ courses }: { courses: any[] }) {
    const [selectedCourseId, setSelectedCourseId] = useState<string>(courses.length > 0 ? courses[0].id : '')
    const [threshold, setThreshold] = useState<number>(60)
    
    const [loading, setLoading] = useState(false)
    const [analyticsData, setAnalyticsData] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!selectedCourseId) return

        const fetchAnalytics = async () => {
            setLoading(true)
            setError(null)
            try {
                const res = await getCourseStudentAnalytics(selectedCourseId)
                if (res.success) {
                    setAnalyticsData(res)
                } else {
                    setError(res.error || 'Gagal memuat data analitik')
                }
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchAnalytics()
    }, [selectedCourseId])

    const handleThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value)
        if (!isNaN(val) && val >= 0 && val <= 100) {
            setThreshold(val)
        } else if (e.target.value === '') {
            // allow empty for typing, but we might want to handle it on blur. 
            // We'll just ignore for now or set to 0.
        }
    }

    if (courses.length === 0) {
        return (
            <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                    Anda belum mengajar kelas apa pun di program studi ini.
                </CardContent>
            </Card>
        )
    }

    const students = analyticsData?.students || []
    const totalStudents = students.length
    
    // Calculate metrics based on dynamic threshold
    const atRiskStudents = students.filter((s: any) => s.averageScore < threshold)
    const safeStudents = students.filter((s: any) => s.averageScore >= threshold)
    const classAverage = totalStudents > 0 
        ? students.reduce((acc: number, curr: any) => acc + curr.averageScore, 0) / totalStudents 
        : 0

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader className="pb-4">
                    <CardTitle>Filter & Pengaturan</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Kolom Kiri: Select Kelas */}
                        <div className="flex-1 min-w-0 flex flex-col gap-2">
                            <Label>Pilih Kelas</Label>
                            <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                                <SelectTrigger className="w-full overflow-hidden text-left">
                                    <span className="truncate block">
                                        <SelectValue placeholder="Pilih Kelas..." />
                                    </span>
                                </SelectTrigger>
                                <SelectContent className="max-w-[calc(100vw-2rem)] sm:max-w-[400px] md:max-w-[500px]">
                                    {courses.map((c) => (
                                        <SelectItem key={c.id} value={c.id}>
                                            <span className="truncate block pr-4">
                                                {c.name} ({c.semester} {c.academicYear})
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        
                        {/* Kolom Kanan: Threshold Input */}
                        <div className="lg:w-[400px] shrink-0 flex flex-col gap-2">
                            <Label>Ambang Batas "At-Risk" (0-100)</Label>
                            <div className="flex items-start sm:items-center gap-3 bg-muted/30 p-2 rounded-md border border-muted">
                                <Input 
                                    type="number" 
                                    min="0" 
                                    max="100" 
                                    value={threshold} 
                                    onChange={handleThresholdChange}
                                    className="w-20 shrink-0 bg-background text-center font-bold"
                                />
                                <span className="text-xs text-muted-foreground leading-snug">
                                    Mahasiswa dengan nilai rata-rata &lt; {threshold} akan diberi peringatan berisiko.
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {loading ? (
                <div className="flex justify-center items-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : error ? (
                <div className="p-4 bg-red-50 text-red-600 rounded-md">
                    {error}
                </div>
            ) : (
                <>
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Mahasiswa</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{totalStudents}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Rata-rata Kelas</CardTitle>
                                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{classAverage.toFixed(1)}</div>
                            </CardContent>
                        </Card>
                        <Card className="border-red-200">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-red-600">Mahasiswa Berisiko (At-Risk)</CardTitle>
                                <TrendingDown className="h-4 w-4 text-red-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">{atRiskStudents.length}</div>
                                <p className="text-xs text-red-500 mt-1">
                                    Mendapatkan nilai &lt; {threshold}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Performa Individu Mahasiswa</CardTitle>
                            <CardDescription>
                                Daftar mahasiswa yang terdaftar di kelas ini beserta nilai rata-rata dari seluruh tugas/kuis yang telah dikerjakan.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]">No</TableHead>
                                        <TableHead>NIM</TableHead>
                                        <TableHead>Nama Mahasiswa</TableHead>
                                        <TableHead className="text-center">Tugas Selesai</TableHead>
                                        <TableHead className="text-right">Rata-rata Nilai</TableHead>
                                        <TableHead className="text-center">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {students.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                Tidak ada mahasiswa yang terdaftar di kelas ini.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        students.map((student: any, index: number) => {
                                            const isAtRisk = student.averageScore < threshold
                                            return (
                                                <TableRow key={student.id}>
                                                    <TableCell>{index + 1}</TableCell>
                                                    <TableCell className="font-mono text-xs">{student.nim}</TableCell>
                                                    <TableCell className="font-medium">{student.name}</TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge variant="outline">
                                                            {student.submittedCount} / {student.totalAssessments}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right font-semibold">
                                                        {student.averageScore.toFixed(1)}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {isAtRisk ? (
                                                            <Badge variant="destructive" className="flex items-center gap-1 justify-center w-fit mx-auto">
                                                                <AlertTriangle className="h-3 w-3" /> At-Risk
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-200">
                                                                Aman
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    )
}
