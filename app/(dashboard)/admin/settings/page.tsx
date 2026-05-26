import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { getCurriculumYears } from '@/app/actions/adminActions'
import { CreateCurriculumYearDialog } from '@/app/components/admin/CreateCurriculumYearDialog'
import { SetActiveCurriculumYearButton } from '@/app/components/admin/SetActiveCurriculumYearButton'

export default async function AdminSettingsPage() {
    const curriculumYears = await getCurriculumYears()

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Pengaturan Sistem</h1>
                    <p className="text-muted-foreground mt-1">Konfigurasi global LMS dan Tahun Kurikulum.</p>
                </div>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Tahun Kurikulum</CardTitle>
                        <CardDescription>Kelola tahun kurikulum OBE. Hanya satu tahun yang dapat aktif pada satu waktu.</CardDescription>
                    </div>
                    <CreateCurriculumYearDialog />
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tahun Kurikulum</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {curriculumYears.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                        Belum ada data tahun kurikulum.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                curriculumYears.map((cy) => (
                                    <TableRow key={cy.id}>
                                        <TableCell className="font-medium">{cy.name}</TableCell>
                                        <TableCell>
                                            {cy.isActive ? (
                                                <Badge variant="default" className="bg-green-600 hover:bg-green-700">Aktif</Badge>
                                            ) : (
                                                <Badge variant="secondary">Tidak Aktif</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {!cy.isActive && (
                                                <SetActiveCurriculumYearButton id={cy.id} name={cy.name} />
                                            )}
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
