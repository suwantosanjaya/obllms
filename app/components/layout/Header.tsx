'use client'

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
import { CircleUser, Menu, GraduationCap } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Sidebar } from './Sidebar' // We will extract the nav part later to avoid duplication, but for now inside Sheet
import { useRouter } from 'next/navigation'
import { setActiveProdiCookie } from '@/app/actions/userActions'
import { HeaderRoleSwitcher } from './HeaderRoleSwitcher'

export function Header() {
    const { role, activeRole, roles, userName, logout, departments, activeDepartmentId, setActiveDepartmentId, departmentRoles } = useUserStore()
    const router = useRouter()

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
            .filter(dr => dr.role === activeRole && dr.department)
            .map(dr => dr.department) as { id: string, name: string, code: string }[]

    return (
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
            {role && (
                <Sheet>
                    <SheetTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            className="shrink-0 md:hidden"
                        >
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Toggle navigation menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="flex flex-col">
                        {/* We can re-use the navigation from Sidebar here, or just render Sidebar components for mobile */}
                        <nav className="grid gap-2 text-lg font-medium">
                            <div className="text-xl font-bold mb-4">OBL LMS</div>
                            {/* Mobile links would go here. For now, we mainly rely on desktop Sidebar for simplicity in this demo */}
                            <div className="text-sm text-muted-foreground">Mobile Menu (Expanded in full version)</div>
                        </nav>
                    </SheetContent>
                </Sheet>
            )}

            <div className="w-full flex-1 flex justify-end px-4 gap-4">
                {['qa', 'teacher', 'head_of_department', 'student'].includes(activeRole || '') && visibleDepartments.length > 0 && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="flex gap-2">
                                <GraduationCap className="h-4 w-4" />
                                <span className="hidden md:inline">
                                    {visibleDepartments.find(p => p.id === activeDepartmentId)?.code || 'Pilih Department'}
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

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon" className="rounded-full">
                        <CircleUser className="h-5 w-5" />
                        <span className="sr-only">Toggle user menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {role ? (
                        <>
                            <DropdownMenuLabel>{userName} ({activeRole || role})</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => router.push('/profile')}>Settings</DropdownMenuItem>
                            <DropdownMenuItem onClick={handleLogout} className="text-red-500 font-medium">Logout</DropdownMenuItem>
                        </>
                    ) : (
                        <DropdownMenuLabel>Not Logged In</DropdownMenuLabel>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    )
}
