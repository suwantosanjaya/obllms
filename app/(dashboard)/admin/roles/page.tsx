import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Check, Minus, Settings, Users, BookOpen, GraduationCap } from 'lucide-react'

// Define the matrix data structure without super_admin
const roleFeatures = [
    {
        category: 'Administrasi Sistem',
        features: [
            { name: 'Konfigurasi Tahun Kurikulum', admin: true, qa: false, teacher: false, student: false },
            { name: 'Manajemen Akun Mahasiswa & Dosen', admin: true, qa: false, teacher: false, student: false },
            { name: 'Aktivasi / Nonaktivasi Akun', admin: true, qa: false, teacher: false, student: false },
            { name: 'Manajemen Pengumuman', admin: true, qa: true, teacher: false, student: false },
        ]
    },
    {
        category: 'Data Master & Kurikulum',
        features: [
            { name: 'Manajemen Data Fakultas & Departemen', admin: true, qa: false, teacher: false, student: false },
            { name: 'Pembuatan Katalog Mata Kuliah', admin: true, qa: true, teacher: false, student: false },
            { name: 'Definisi Profil Lulusan & PLO', admin: true, qa: true, teacher: false, student: false },
            { name: 'Tinjauan Kualitas (QA Metrics)', admin: true, qa: true, teacher: false, student: false },
        ]
    },
    {
        category: 'Pembelajaran & Interaksi (OBL)',
        features: [
            { name: 'Membuka Sesi Kelas / Semester', admin: false, qa: false, teacher: true, student: false },
            { name: 'Pembuatan Assessment & Rubrik', admin: false, qa: false, teacher: true, student: false },
            { name: 'Memberikan Penilaian (Grading)', admin: false, qa: false, teacher: true, student: false },
            { name: 'Mendaftar Sesi Kelas (KRS)', admin: false, qa: false, teacher: false, student: true },
            { name: 'Mengumpulkan Tugas & Kuis', admin: false, qa: false, teacher: false, student: true },
            { name: 'Akses Forum Komunitas', admin: false, qa: false, teacher: true, student: true },
            { name: 'Jurnal Refleksi Diri (SRL)', admin: false, qa: false, teacher: false, student: true },
        ]
    }
]

export default function RolesMatrixPage() {
    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Matriks Hak Akses (Role Access)</h1>
                <p className="text-muted-foreground mt-1">Peta kapabilitas bawaan sistem untuk setiap tingkatan pengguna operasional.</p>
            </div>

            {/* Role Summary Cards (Removed Super Admin) */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <Settings className="h-5 w-5 mb-2 text-blue-500" />
                        <CardTitle className="text-base">Admin Departemen</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">Pengelola data master universitas, fakultas, departemen, dan pengaturan global.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <BookOpen className="h-5 w-5 mb-2 text-green-500" />
                        <CardTitle className="text-base">QA / Departemen</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">Penjamin mutu yang mengelola kurikulum dan memantau analitik lulusan.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <Users className="h-5 w-5 mb-2 text-orange-500" />
                        <CardTitle className="text-base">Teacher (Dosen)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">Fasilitator kelas yang membuat materi, rubrik, dan memberikan nilai.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <GraduationCap className="h-5 w-5 mb-2 text-purple-500" />
                        <CardTitle className="text-base">Student</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">Peserta didik yang mengikuti kelas, mengumpulkan tugas, dan mengisi SRL.</p>
                    </CardContent>
                </Card>
            </div>

            {/* Matrix Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Peta Kapabilitas Sistem</CardTitle>
                    <CardDescription>Hak akses fitur utama yang terikat secara statis dengan masing-masing peran operasional.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="w-[300px] font-semibold">Fitur / Modul</TableHead>
                                <TableHead className="text-center">Admin Departemen</TableHead>
                                <TableHead className="text-center">QA</TableHead>
                                <TableHead className="text-center">Teacher</TableHead>
                                <TableHead className="text-center">Student</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {roleFeatures.map((category, i) => (
                                <React.Fragment key={i}>
                                    <TableRow className="bg-muted/20 hover:bg-muted/20">
                                        <TableCell colSpan={5} className="font-semibold text-sm text-primary py-3">
                                            {category.category}
                                        </TableCell>
                                    </TableRow>
                                    {category.features.map((feature, j) => (
                                        <TableRow key={j}>
                                            <TableCell className="font-medium text-sm pl-6">{feature.name}</TableCell>
                                            <TableCell className="text-center">
                                                {feature.admin ? <Check className="h-4 w-4 mx-auto text-green-500" /> : <Minus className="h-4 w-4 mx-auto text-muted-foreground/30" />}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {feature.qa ? <Check className="h-4 w-4 mx-auto text-green-500" /> : <Minus className="h-4 w-4 mx-auto text-muted-foreground/30" />}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {feature.teacher ? <Check className="h-4 w-4 mx-auto text-green-500" /> : <Minus className="h-4 w-4 mx-auto text-muted-foreground/30" />}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {feature.student ? <Check className="h-4 w-4 mx-auto text-green-500" /> : <Minus className="h-4 w-4 mx-auto text-muted-foreground/30" />}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </React.Fragment>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
