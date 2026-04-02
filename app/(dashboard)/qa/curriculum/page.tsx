import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CreatePLODialog } from '@/app/components/qa/CreatePLODialog'
import { DeletePLOButton } from '@/app/components/qa/DeletePLOButton'
import { getPLOs } from '@/app/actions/obeActions'
import prisma from '@/lib/db'

export default async function QaCurriculumPage() {
    const { success, plos } = await getPLOs()
    const validPlos = success ? plos || [] : []

    // Ensure the QA user exists for demo purposes
    const qaUser = await prisma.user.findFirst({ where: { role: 'qa' } })

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Review Kurikulum (CPL)</h1>
                    <p className="text-muted-foreground mt-1">Tinjau Capaian Pembelajaran Lulusan (CPL/PLO) program studi.</p>
                </div>
                <CreatePLODialog />
            </div>

            {!qaUser && (
                <div className="p-4 bg-yellow-50 text-yellow-800 border-l-4 border-yellow-500 rounded text-sm">
                    Peringatan: User QA tidak ditemukan di database. Pastikan seed data telah dijalankan.
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Master Data CPL/PLO</CardTitle>
                    <CardDescription>
                        Berikut adalah daftar standar profil capaian yang diharapkan dari setiap lulusan.
                        Nantinya CPL ini akan dipetakan ke setiap mata kuliah (CPMK).
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">Kode</TableHead>
                                <TableHead>Deskripsi CPL</TableHead>
                                <TableHead className="text-center">Jumlah CPMK Terhubung</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {validPlos.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                        Belum ada CPL/PLO yang didaftarkan.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                validPlos.map((plo: { id: string, code: string, description: string, _count?: { clos: number } }) => (
                                    <TableRow key={plo.id}>
                                        <TableCell className="font-semibold text-primary">{plo.code}</TableCell>
                                        <TableCell className="max-w-[400px]">
                                            {plo.description}
                                        </TableCell>
                                        <TableCell className="text-center font-medium">
                                            {plo._count?.clos || 0}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DeletePLOButton id={plo.id} code={plo.code} />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
