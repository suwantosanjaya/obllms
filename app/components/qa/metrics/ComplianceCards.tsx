import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, AlertCircle, BookOpen, UserCheck, ListTodo } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function ComplianceCards({ compliance }: { compliance: any }) {
    
    const rate = compliance?.rate || 0
    const total = compliance?.totalCourses || 0
    const compliant = compliance?.compliantCourses || 0
    const nonCompliantList = compliance?.details?.nonCompliant || []

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Tingkat Kepatuhan Penilaian</CardTitle>
                    <UserCheck className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{rate}%</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Dosen yang telah mengunggah nilai OBE
                    </p>
                    <div className="w-full bg-secondary h-2 mt-3 rounded-full overflow-hidden">
                        <div 
                            className={`h-full ${rate >= 80 ? 'bg-green-500' : rate >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} 
                            style={{ width: `${rate}%` }}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Kelas Terasemen</CardTitle>
                    <BookOpen className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between items-end">
                        <div>
                            <div className="text-2xl font-bold">{compliant} <span className="text-muted-foreground text-sm font-normal">/ {total} Kelas</span></div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Kelas dengan minimal 1 instrumen nilai
                            </p>
                        </div>
                        
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="h-7 text-xs px-2 gap-1" disabled={nonCompliantList.length === 0}>
                                    <ListTodo className="h-3 w-3" /> Detail
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Daftar Kelas Belum Terasemen</DialogTitle>
                                    <DialogDescription>
                                        Mata kuliah berikut belum memiliki satupun nilai evaluasi (Tugas/Kuis/Ujian) yang dimasukkan oleh dosen pengampu.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="mt-4 border rounded-md">
                                    <Table>
                                        <TableHeader className="bg-muted/50">
                                            <TableRow>
                                                <TableHead>Mata Kuliah</TableHead>
                                                <TableHead>Kelas</TableHead>
                                                <TableHead>Dosen Pengampu</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {nonCompliantList.map((course: any, idx: number) => (
                                                <TableRow key={idx}>
                                                    <TableCell>
                                                        <div className="font-medium">{course.subjectCode}</div>
                                                        <div className="text-xs text-muted-foreground">{course.subjectName}</div>
                                                    </TableCell>
                                                    <TableCell className="text-sm">{course.classCode}</TableCell>
                                                    <TableCell className="text-sm">{course.instructorName}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Status Kesehatan</CardTitle>
                    {rate >= 80 ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                    )}
                </CardHeader>
                <CardContent>
                    <div className={`text-xl font-bold ${rate >= 80 ? 'text-green-600' : rate >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                        {rate >= 80 ? 'Sehat (Optimal)' : rate >= 50 ? 'Peringatan (Sedang)' : 'Kritis (Rendah)'}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Berdasarkan tingkat kepatuhan saat ini
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
