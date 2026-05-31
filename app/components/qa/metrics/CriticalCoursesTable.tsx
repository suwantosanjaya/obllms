import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertCircle, ArrowDown } from 'lucide-react'

export default function CriticalCoursesTable({ data }: { data: any[] }) {
    if (!data || data.length === 0) {
        return (
            <Card className="h-full border-red-200">
                <CardHeader>
                    <CardTitle className="text-red-700 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" /> Mata Kuliah Kritis
                    </CardTitle>
                    <CardDescription>Belum ada data nilai mata kuliah pada rentang yang dipilih.</CardDescription>
                </CardHeader>
            </Card>
        )
    }

    return (
        <Card className="h-full border-red-200 bg-red-50/30">
            <CardHeader className="pb-3">
                <CardTitle className="text-red-700 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" /> Mata Kuliah Kritis
                </CardTitle>
                <CardDescription className="text-red-900/60">
                    Maksimal 5 mata kuliah dengan nilai rata-rata di bawah standar (&lt; 70).
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border border-red-100 bg-white">
                    <Table>
                        <TableHeader className="bg-red-50/50">
                            <TableRow>
                                <TableHead>Mata Kuliah</TableHead>
                                <TableHead>Dosen Pengampu</TableHead>
                                <TableHead className="text-right">Rata-rata</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((course, idx) => (
                                <TableRow key={idx}>
                                    <TableCell>
                                        <div className="font-medium">{course.subjectCode}</div>
                                        <div className="text-xs text-muted-foreground">{course.subjectName}</div>
                                    </TableCell>
                                    <TableCell className="text-sm">{course.instructorName}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-100 text-red-700 font-bold text-sm">
                                            <ArrowDown className="h-3 w-3" />
                                            {course.average}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}
