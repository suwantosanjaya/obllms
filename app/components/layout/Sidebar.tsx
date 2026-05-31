'use client'

import { Building2 } from 'lucide-react'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUserStore } from '@/lib/store/useUserStore'
import {
    LayoutDashboard,
    BookOpen,
    ClipboardList,
    MessageSquare,
    Users,
    Settings,
    Target,
    BarChart,
    ShieldCheck,
    GraduationCap,
    CalendarDays,
    Megaphone
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function getSidebarLinks(activeRole: string | null) {
    switch (activeRole) {
        case 'student':
            return [
                { href: '/student', label: 'Dashboard', icon: LayoutDashboard },
                { href: '/student/courses', label: 'Kelas Saya', icon: BookOpen },
                { href: '/student/obl', label: 'Pemetaan OBL', icon: GraduationCap },
                { href: '/student/assessments', label: 'Tugas & Ujian', icon: ClipboardList },
                { href: '/student/srl', label: 'Pelacak SRL', icon: Target },
                { href: '/student/analytics', label: 'Analitik Capaian', icon: BarChart },
                { href: '/student/community', label: 'Komunitas', icon: MessageSquare },
            ]
        case 'teacher':
            return [
                { href: '/teacher', label: 'Dashboard', icon: LayoutDashboard },
                { href: '/teacher/courses', label: 'Manajemen Kelas', icon: BookOpen },
                { href: '/teacher/obl', label: 'Pemetaan OBL', icon: GraduationCap },
                { href: '/teacher/students', label: 'Analitik Mahasiswa', icon: BarChart },
                { href: '/teacher/assessments', label: 'Penilaian', icon: ClipboardList },
            ]
        case 'qa':
            return [
                { href: '/qa', label: 'Dashboard', icon: LayoutDashboard },
                { href: '/qa/subjects', label: 'Katalog Mata Kuliah', icon: BookOpen },
                { href: '/qa/curriculum', label: 'Tinjauan Kurikulum', icon: BookOpen },
                { href: '/qa/schedules', label: 'Manajemen Jadwal', icon: CalendarDays },
                { href: '/qa/analytics', label: 'Analitik Capaian', icon: BarChart },
                { href: '/qa/metrics', label: 'Metrik QA', icon: BarChart },
                { href: '/qa/feedback', label: 'Umpan Balik Mahasiswa', icon: MessageSquare },
                { href: '/qa/students', label: 'Daftar Mahasiswa', icon: GraduationCap },
                { href: '/qa/teachers', label: 'Daftar Dosen', icon: Users },
                { href: '/admin/users', label: 'Manajemen Pengguna', icon: Users },
                { href: '/admin/announcements', label: 'Pengumuman', icon: Megaphone },
            ]
        case 'super_admin':
            return [
                { href: '/super_admin', label: 'Dashboard', icon: LayoutDashboard },
                { href: '/super_admin/users', label: 'Manajemen Admin', icon: ShieldCheck },
            ]
        case 'head_of_department':
            return [
                { href: '/qa/curriculum', label: 'Tinjauan Kurikulum', icon: BookOpen },
                { href: '/qa/analytics', label: 'Analitik Capaian', icon: BarChart },
                { href: '/qa/metrics', label: 'Metrik QA', icon: BarChart },
                { href: '/qa/feedback', label: 'Umpan Balik Mahasiswa', icon: MessageSquare },
            ]
        case 'admin':
            return [
                { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
                { href: '/admin/institutions', label: 'Manajemen Institusi', icon: Building2 },
                { href: '/admin/department-heads', label: 'Penetapan Ketua', icon: Users },
                { href: '/admin/users', label: 'Manajemen Pengguna', icon: Users },
                { href: '/admin/roles', label: 'Akses Peran', icon: ShieldCheck },
                { href: '/admin/announcements', label: 'Pengumuman', icon: Megaphone },
                { href: '/admin/settings/grades', label: 'Rentang Nilai', icon: Settings },
                { href: '/admin/settings', label: 'Pengaturan Sistem', icon: Settings },
            ]
        default:
            return []
    }
}

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
    const pathname = usePathname()
    const { activeRole, role, isSidebarCollapsed } = useUserStore()
    const currentRole = activeRole || role
    const links = getSidebarLinks(currentRole)

    return (
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {links.map((link) => {
                const Icon = link.icon
                return (
                    <Link
                        key={link.href}
                        href={link.href}
                        onClick={onNavigate}
                        title={isSidebarCollapsed ? link.label : undefined}
                        className={cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary',
                            isSidebarCollapsed ? 'justify-center px-0 py-3' : '',
                            pathname === link.href
                                ? 'bg-muted text-primary'
                                : 'text-muted-foreground'
                        )}
                    >
                        <Icon className="h-5 w-5 shrink-0" />
                        {!isSidebarCollapsed && <span>{link.label}</span>}
                    </Link>
                )
            })}
        </nav>
    )
}

export function Sidebar() {
    const { activeRole, role, isSidebarCollapsed } = useUserStore()
    const currentRole = activeRole || role

    if (!currentRole) {
        return <aside className="border-r bg-muted/40 hidden md:flex flex-col h-full max-h-screen"></aside>
    }

    return (
        <aside className="border-r bg-muted/40 hidden md:flex flex-col h-full max-h-screen transition-all duration-300">
            <div className="flex h-full max-h-screen flex-col gap-2">
                <div className={cn("flex h-14 items-center border-b px-4 lg:h-[60px]", isSidebarCollapsed ? "justify-center px-0" : "lg:px-6")}>
                    <Link href="/" className="flex items-center gap-2 font-semibold">
                        <GraduationCap className="h-6 w-6 shrink-0" />
                        {!isSidebarCollapsed && <span className="">OBLMS</span>}
                    </Link>
                </div>
                <div className="flex-1 overflow-auto py-2">
                    <SidebarNav />
                </div>
            </div>
        </aside>
    )
}