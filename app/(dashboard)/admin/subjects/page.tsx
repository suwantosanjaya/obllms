import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { getSubjects } from '@/app/actions/courseActions'
import { CreateSubjectDialog } from '@/app/components/admin/CreateSubjectDialog'
import { DeleteSubjectButton } from '@/app/components/admin/DeleteSubjectButton'
import { BookOpen, GraduationCap, Building2, University } from 'lucide-react'

const SCOPE_LABELS: Record<string, { label: string; icon: React.ElementType; className: string }> = {
    universitas: { label: 'Universitas', icon: University, className: 'bg-purple-100 text-purple-800 border-purple-300' },
    fakultas: { label: 'Fakultas', icon: Building2, className: 'bg-blue-100 text-blue-800 border-blue-300' },
    prodi: { label: 'Prodi', icon: GraduationCap, className: 'bg-green-100 text-green-800 border-green-300' },
}

export default async function AdminSubjectsPage() {
    const res = await getSubjects()
    const subjects = res.success ? (res.subjects ?? []) : []

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Katalog Mata Kuliah</h1>
                    <p className="text-muted-foreground mt-1">Kelola master mata kuliah yang tersedia di program studi.</p>
                </div>
                <CreateSubjectDialog />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Daftar Mata Kuliah</CardTitle>
                    <CardDescription>
                        Data ini digunakan sebagai referensi saat dosen membuat kelas baru.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[130px]">Kode</TableHead>
                                <TableHead>Nama Mata Kuliah</TableHead>
                                <TableHead className="w-[100px]">Tipe</TableHead>
                                <TableHead className="w-[130px]">Kelompok</TableHead>
                                <TableHead className="hidden md:table-cell">Prodi / Fakultas</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {subjects.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        <div className="flex flex-col items-center gap-2">
                                            <BookOpen className="h-8 w-8 opacity-40" />
                                            <span>Belum ada katalog mata kuliah.</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                subjects.map((subject) => {
                                    const scopeInfo = SCOPE_LABELS[subject.scope] ?? SCOPE_LABELS.prodi
                                    const ScopeIcon = scopeInfo.icon

                                    // Determine the unit label
                                    let unitLabel = '-'
                                    if (subject.scope === 'prodi' && subject.prodi) {
                                        unitLabel = `${subject.prodi.name} (${subject.prodi.fakultas.code})`
                                    } else if (subject.scope === 'fakultas' && subject.fakultas) {
                                        unitLabel = subject.fakultas.name
                                    } else if (subject.scope === 'universitas') {
                                        unitLabel = 'Semua Prodi'
                                    }

                                    return (
                                        <TableRow key={subject.id}>
                                            <TableCell>
                                                <Badge variant="outline" className="font-medium bg-slate-100 text-slate-800 border-slate-300">
                                                    {subject.code}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-semibold text-slate-700">
                                                {subject.title}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={subject.type === 'wajib'
                                                        ? 'bg-red-50 text-red-700 border-red-200'
                                                        : 'bg-amber-50 text-amber-700 border-amber-200'
                                                    }
                                                >
                                                    {subject.type === 'wajib' ? 'Wajib' : 'Pilihan'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={`flex items-center gap-1 w-fit ${scopeInfo.className}`}>
                                                    <ScopeIcon className="h-3 w-3" />
                                                    {scopeInfo.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                                                {unitLabel}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DeleteSubjectButton id={subject.id} title={subject.title} />
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
