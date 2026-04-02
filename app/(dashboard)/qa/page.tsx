import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileSearch, CheckSquare, LineChart, BookOpen, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default function QADashboard() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard Quality Assurance (Prodi)</h1>
                    <p className="text-muted-foreground mt-1">Pemantauan keselarasan kurikulum (PLO-CLO) dan metrik kualitas.</p>
                </div>
            </div>

            {/* QA Quick Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Mata Kuliah Teralign</CardTitle>
                        <CheckSquare className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">94%</div>
                        <p className="text-xs text-muted-foreground mt-1">Sesuai standar OBL</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Usulan Perubahan</CardTitle>
                        <FileSearch className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">3</div>
                        <p className="text-xs text-muted-foreground mt-1">Menunggu persetujuan prodi</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Skor Kepuasan (Student)</CardTitle>
                        <LineChart className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">4.2/5</div>
                        <p className="text-xs text-muted-foreground mt-1">Rata-rata evaluasi dosen</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Monitoring PLO</CardTitle>
                        <BookOpen className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12/12</div>
                        <p className="text-xs text-muted-foreground mt-1">PLO diukur semester ini</p>
                    </CardContent>
                </Card>
            </div>

            {/* Alignment Review Table */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Tinjauan Keselarasan Kurikulum (CLO vs PLO)</CardTitle>
                            <CardDescription>
                                Review pemetaan mata kuliah terhadap Program Learning Outcomes (PLO).
                            </CardDescription>
                        </div>
                        <div className="flex relative items-center w-64">
                            <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
                            <Input type="search" placeholder="Cari mata kuliah..." className="pl-8" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Kode MK</TableHead>
                                    <TableHead>Mata Kuliah</TableHead>
                                    <TableHead>Dosen Pengampu</TableHead>
                                    <TableHead>Pemetaan CLO</TableHead>
                                    <TableHead>Status QA</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="font-medium">CS101</TableCell>
                                    <TableCell>Algoritma Dasar</TableCell>
                                    <TableCell>Dr. Andi</TableCell>
                                    <TableCell>100% (3 CLO ➔ 3 PLO)</TableCell>
                                    <TableCell><Badge className="bg-green-500">Approved</Badge></TableCell>
                                    <TableCell className="text-right"><Button variant="ghost" size="sm">Detail</Button></TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">CS202</TableCell>
                                    <TableCell>Pemrograman Lanjut</TableCell>
                                    <TableCell>Siti Rahma, MT</TableCell>
                                    <TableCell>85% (1 CLO belum dipetakan)</TableCell>
                                    <TableCell><Badge variant="outline" className="text-orange-500 border-orange-500">Review</Badge></TableCell>
                                    <TableCell className="text-right"><Button variant="ghost" size="sm">Beri Catatan</Button></TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">IS301</TableCell>
                                    <TableCell>Manajemen Basis Data</TableCell>
                                    <TableCell>Prof. Budi</TableCell>
                                    <TableCell>100% (5 CLO ➔ 2 PLO)</TableCell>
                                    <TableCell><Badge className="bg-green-500">Approved</Badge></TableCell>
                                    <TableCell className="text-right"><Button variant="ghost" size="sm">Detail</Button></TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
