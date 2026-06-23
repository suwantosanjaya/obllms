/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from 'next/navigation'
import { getSessionUser } from '@/app/actions/userActions'
import { getPublicAnnouncements } from '@/app/actions/announcementActions'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, BookOpen, PenLine, Lightbulb, Megaphone, ArrowRight, Star, Zap, Brain, Clock } from 'lucide-react'
import Link from 'next/link'
import prisma from '@/lib/db'
import { AnnouncementListClient } from '@/app/components/student/AnnouncementListClient'

export default async function CommunityPage() {
    const user = await getSessionUser()
    if (!user || !user.roles?.includes('student')) {
        redirect('/')
    }

    const [totalStudents, totalReflections, totalCourses, announcementsRes] = await Promise.all([
        prisma.user.count({ where: { role: { contains: 'student' } } }),
        prisma.srlReflection.count(),
        prisma.course.count({ where: { config: { isPublished: true } } }),
        getPublicAnnouncements(user.activeDepartmentId),
    ])

    const announcements: any[] = announcementsRes.success ? (announcementsRes as any).announcements : []

    const tips = [
        { icon: Clock, title: 'Tetapkan Jadwal Belajar', desc: 'Luangkan minimal 2 jam sehari untuk belajar mandiri di luar jam kuliah. Konsistensi lebih penting dari durasi.', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
        { icon: Brain, title: 'Teknik Pomodoro', desc: 'Belajar 25 menit, istirahat 5 menit. Setelah 4 siklus, ambil istirahat lebih panjang (15–30 menit).', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
        { icon: PenLine, title: 'Tulis Jurnal Refleksi', desc: 'Isi jurnal SRL setiap minggu untuk mendapatkan poin gamifikasi dan melatih kebiasaan evaluasi diri.', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
        { icon: Star, title: 'Aktif di Forum Kelas', desc: 'Diskusi aktif dengan sesama mahasiswa membantu pemahaman materi dan meningkatkan nilai partisipasi.', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
        { icon: Zap, title: 'Manfaatkan Fitur Gamifikasi', desc: 'Kumpulkan poin dari tugas, refleksi, dan aktivitas kelas. Poin dapat dikonversi menjadi nilai partisipasi.', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20' },
        { icon: BookOpen, title: 'Review Materi Secara Berkala', desc: 'Baca ulang ringkasan materi setiap minggu untuk memperkuat ingatan jangka panjang (spaced repetition).', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
    ]

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Komunitas</h1>
                <p className="text-muted-foreground mt-1">Pengumuman, tips belajar, dan statistik komunitas mahasiswa OLIMS.</p>
            </div>

            {/* Community Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
                <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="pt-4 flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg"><Users className="w-5 h-5 text-primary" /></div>
                        <div>
                            <p className="text-2xl font-black text-primary">{totalStudents}</p>
                            <p className="text-xs text-muted-foreground">Total Mahasiswa (Global)</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/50">
                    <CardContent className="pt-4 flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg"><PenLine className="w-5 h-5 text-green-600 dark:text-green-400" /></div>
                        <div>
                            <p className="text-2xl font-black text-green-700 dark:text-green-400">{totalReflections}</p>
                            <p className="text-xs text-muted-foreground">Total Jurnal SRL (Global)</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50">
                    <CardContent className="pt-4 flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg"><BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" /></div>
                        <div>
                            <p className="text-2xl font-black text-blue-700 dark:text-blue-400">{totalCourses}</p>
                            <p className="text-xs text-muted-foreground">Total Kelas Tersedia (Global)</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Announcements from DB */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <Megaphone className="w-5 h-5 text-primary" />
                        <h2 className="text-lg font-semibold">Pengumuman Sistem</h2>
                    </div>

                    {announcements.length === 0 ? (
                        <Card>
                            <CardContent className="py-10 text-center text-muted-foreground">
                                <Megaphone className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                <p className="text-sm">Belum ada pengumuman saat ini.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <AnnouncementListClient announcements={announcements} />
                    )}
                </div>

                {/* SRL Tips */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-yellow-500" />
                        <h2 className="text-lg font-semibold">Tips Belajar Mandiri</h2>
                    </div>
                    <div className="grid gap-3">
                        {tips.map((tip, i) => (
                            <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${tip.bg} border-transparent`}>
                                <div className="p-1.5 rounded-lg bg-white/60 dark:bg-black/20 shrink-0">
                                    <tip.icon className={`w-4 h-4 ${tip.color}`} />
                                </div>
                                <div>
                                    <p className={`text-sm font-semibold ${tip.color}`}>{tip.title}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{tip.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA */}
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
                <CardContent className="pt-5 pb-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                        <p className="font-semibold text-primary">Sudah mengisi jurnal minggu ini?</p>
                        <p className="text-sm text-muted-foreground mt-0.5">Dapatkan +10 poin gamifikasi setiap jurnal refleksi yang Anda isi.</p>
                    </div>
                    <Button asChild className="shrink-0">
                        <Link href="/student/srl">Lihat SRL Tracker <ArrowRight className="ml-2 w-4 h-4" /></Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
