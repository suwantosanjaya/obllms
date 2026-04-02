import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { getFakultasList } from '@/app/actions/prodiActions'
import { CreateFakultasDialog, CreateProdiDialog } from '@/app/components/admin/ProdiDialogs'
import { Building2, GraduationCap } from 'lucide-react'

export default async function AdminProdiPage() {
    const res = await getFakultasList()
    const fakultasList = res.success && res.fakultasList ? res.fakultasList : []

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Fakultas & Program Studi</h1>
                    <p className="text-muted-foreground mt-1">Kelola struktur organisasi akademik.</p>
                </div>
                <div className="flex gap-2">
                    <CreateFakultasDialog />
                    <CreateProdiDialog fakultasList={fakultasList.map(f => ({ id: f.id, code: f.code, name: f.name }))} />
                </div>
            </div>

            <div className="grid gap-6">
                {fakultasList.length === 0 ? (
                    <Card>
                        <CardContent className="text-center py-12 text-muted-foreground">
                            <Building2 className="h-10 w-10 mx-auto mb-3 opacity-40" />
                            <p>Belum ada data Fakultas. Tambahkan Fakultas terlebih dahulu.</p>
                        </CardContent>
                    </Card>
                ) : (
                    fakultasList.map(fakultas => (
                        <Card key={fakultas.id}>
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-blue-100">
                                        <Building2 className="h-5 w-5 text-blue-700" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">
                                            {fakultas.name}
                                            <Badge variant="outline" className="ml-2 font-mono bg-slate-100 text-slate-700 border-slate-300">
                                                {fakultas.code}
                                            </Badge>
                                        </CardTitle>
                                        <CardDescription>{(fakultas as any).prodis?.length ?? 0} Program Studi</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {!(fakultas as any).prodis?.length ? (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        Belum ada prodi di fakultas ini.
                                    </p>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[120px]">Kode</TableHead>
                                                <TableHead>Nama Program Studi</TableHead>
                                                <TableHead className="text-right">Jml. Mata Kuliah</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {(fakultas as any).prodis.map((prodi: any) => (
                                                <TableRow key={prodi.id}>
                                                    <TableCell>
                                                        <Badge variant="outline" className="font-medium bg-green-50 text-green-800 border-green-300">
                                                            {prodi.code}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <GraduationCap className="h-4 w-4 text-muted-foreground" />
                                                            <span className="font-medium">{prodi.name}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right text-muted-foreground text-sm">
                                                        {prodi._count?.subjects ?? '-'} MK
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
