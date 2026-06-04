import { redirect } from 'next/navigation'
import { getSessionUser } from '@/app/actions/userActions'
import { getAllAnnouncementsAdmin } from '@/app/actions/announcementActions'
import { AnnouncementDialog } from '@/app/components/admin/AnnouncementDialog'
import { AnnouncementTableClient } from '@/app/components/admin/AnnouncementTableClient'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import prisma from '@/lib/db'
import { Megaphone } from 'lucide-react'

export default async function AnnouncementsPage() {
    const user = await getSessionUser()
    if (!user || !['admin', 'qa'].includes(user.activeRole)) {
        redirect('/')
    }

    const res = await getAllAnnouncementsAdmin()
    const announcements = res.success ? (res as any).announcements : []

    const departments = await prisma.department.findMany({
        select: { id: true, name: true, code: true },
        orderBy: { code: 'asc' }
    })

    const activeCount = announcements.filter((a: any) => a.isActive).length
    const globalCount = announcements.filter((a: any) => a.scope === 'global').length
    const deptCount = announcements.filter((a: any) => a.scope === 'department').length

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manajemen Pengumuman</h1>
                    <p className="text-muted-foreground mt-1">
                        {user.activeRole === 'qa'
                            ? 'Kelola pengumuman untuk mahasiswa di program studi Anda.'
                            : 'Kelola pengumuman global dan per-program studi untuk mahasiswa.'}
                    </p>
                </div>
                <AnnouncementDialog
                    departments={departments}
                    activeRole={user.activeRole}
                    activeDepartmentId={user.activeDepartmentId}
                />
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                    <CardContent className="pt-4 flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Megaphone className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-primary">{activeCount}</p>
                            <p className="text-xs text-muted-foreground">Pengumuman Aktif</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <p className="text-2xl font-black text-blue-600">{globalCount}</p>
                        <p className="text-xs text-muted-foreground">Global</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <p className="text-2xl font-black text-emerald-600">{deptCount}</p>
                        <p className="text-xs text-muted-foreground">Per-Program Studi</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Daftar Pengumuman</CardTitle>
                    <CardDescription>
                        Toggle aktif/nonaktif, edit, atau hapus pengumuman. Mahasiswa hanya melihat pengumuman yang aktif.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <AnnouncementTableClient
                        announcements={announcements}
                        departments={departments}
                        activeRole={user.activeRole}
                        activeDepartmentId={user.activeDepartmentId}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
