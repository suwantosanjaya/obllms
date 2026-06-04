import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertCircle, ArrowDown } from 'lucide-react'

export default function CriticalCoursesTable({ data }: { data: any[] }) {
    if (!data || data.length === 0) {
        return (
            <Card className="h-full border-destructive/20 dark:border-destructive/30">
                <CardHeader>
                    <CardTitle className="text-destructive flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" /> Mata Kuliah Kritis
                    </CardTitle>
                    <CardDescription>Belum ada data nilai mata kuliah pada rentang yang dipilih.</CardDescription>
                </CardHeader>
            </Card>
        )
    }

    return (
        <Card className="h-full border-destructive/30 bg-destructive/5 dark:bg-destructive/10 transition-colors">
            <CardHeader className="pb-3">
                <CardTitle className="text-destructive flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" /> Mata Kuliah Kritis
                </CardTitle>
                <CardDescription className="text-destructive/80">
                    Maksimal 5 mata kuliah dengan nilai rata-rata di bawah standar (&lt; 70).
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border border-destructive/20 bg-background/50 backdrop-blur-sm overflow-hidden shadow-sm">
                    <Table>
                        <TableHeader className="bg-destructive/5 border-b-destructive/20">
                            <TableRow className="hover:bg-transparent border-b-destructive/20">
                                <TableHead className="text-destructive/80 font-semibold">Mata Kuliah</TableHead>
                                <TableHead className="text-destructive/80 font-semibold">Dosen Pengampu</TableHead>
                                <TableHead className="text-right text-destructive/80 font-semibold">Rata-rata</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((course, idx) => (
                                <TableRow key={idx} className="border-b-destructive/10 hover:bg-destructive/5">
                                    <TableCell>
                                        <div className="font-medium text-foreground">{course.subjectCode}</div>
                                        <div className="text-xs text-muted-foreground">{course.subjectName}</div>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{course.instructorName}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-destructive/10 text-destructive font-bold text-sm shadow-sm">
                                            <ArrowDown className="h-3.5 w-3.5" />
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
