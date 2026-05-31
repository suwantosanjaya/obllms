'use client'

import { useState } from 'react'
import { useUserStore } from '@/lib/store/useUserStore'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { CircleUser, Menu, GraduationCap, PanelLeftClose, PanelLeft } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { SidebarNav } from './Sidebar'
import { useRouter } from 'next/navigation'
import { setActiveProdiCookie } from '@/app/actions/userActions'
import { HeaderRoleSwitcher, roleMap } from './HeaderRoleSwitcher'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { StudentNotificationBell } from '../student/StudentNotificationBell'

export function Header() {
    const { role, activeRole, roles, userName, userId, logout, departments, activeDepartmentId, setActiveDepartmentId, departmentRoles, isSidebarCollapsed, toggleSidebar } = useUserStore()
    const router = useRouter()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    const handleLogout = () => {
        logout()
        router.push('/')
    }

    const handleSwitchProdi = async (prodiId: string) => {
        setActiveDepartmentId(prodiId)
        await setActiveProdiCookie(prodiId)
        // Refresh the current route to fetch data with the new cookie
        router.refresh()
    }

    const visibleDepartments = activeRole === 'super_admin' ? departments : 
        (departmentRoles || [])
            .filter(dr => dr.role?.split(',').map((r: string) => r.trim()).includes(activeRole as string) && dr.department)
            .map(dr => dr.department) as { id: string, name: string, code: string }[]

    return (
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
            {role && (
                <>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="hidden md:flex shrink-0"
                        onClick={toggleSidebar}
                    >
                        {isSidebarCollapsed ? <PanelLeft className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
                        <span className="sr-only">Buka Sidebar</span>
                    </Button>
                    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                        <SheetTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="shrink-0 md:hidden"
                            >
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Buka menu navigasi</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="flex flex-col">
                        <VisuallyHidden>
                            <SheetTitle>Menu Navigasi</SheetTitle>
                        </VisuallyHidden>
                        <div className="flex h-14 items-center border-b px-4 mb-4">
                            <div className="flex items-center gap-2 font-semibold">
                                <GraduationCap className="h-6 w-6" />
                                <span className="text-xl">OBLMS</span>
                            </div>
                        </div>
                        <div className="flex-1 overflow-auto">
                            <SidebarNav onNavigate={() => setIsMobileMenuOpen(false)} />
                        </div>
                    </SheetContent>
                </Sheet>
                </>
            )}

            <div className="w-full flex-1 flex justify-end px-4 gap-4">
                {['qa', 'teacher', 'head_of_department', 'student'].includes(activeRole || '') && visibleDepartments.length > 0 && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="flex gap-2">
                                <GraduationCap className="h-4 w-4" />
                                <span className="hidden md:inline">
                                    {visibleDepartments.find(p => p.id === activeDepartmentId)?.code || 'Pilih Departemen'}
                                </span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Konteks Departemen</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {visibleDepartments.map(p => (
                                <DropdownMenuItem 
                                    key={p.id} 
                                    onClick={() => handleSwitchProdi(p.id)}
                                    className={p.id === activeDepartmentId ? "bg-primary/10 font-bold" : ""}
                                >
                                    {p.name} ({p.code})
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
                {roles && roles.length > 0 && (
                    <HeaderRoleSwitcher roles={roles} activeRole={activeRole as string} />
                )}
            </div>

            {activeRole === 'student' && userId && (
                <StudentNotificationBell studentId={userId} departmentId={activeDepartmentId} />
            )}

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon" className="rounded-full">
                        <CircleUser className="h-5 w-5" />
                        <span className="sr-only">Buka menu pengguna</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {role ? (
                        <>
                            <DropdownMenuLabel>{userName} ({roleMap[activeRole || role || ''] || activeRole || role})</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => router.push('/profile')}>Profil</DropdownMenuItem>
                            <DropdownMenuItem onClick={handleLogout} className="text-red-500 font-medium">Keluar</DropdownMenuItem>
                        </>
                    ) : (
                        <DropdownMenuLabel>Belum Masuk</DropdownMenuLabel>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    )
}
