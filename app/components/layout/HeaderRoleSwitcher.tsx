'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { setActiveRoleCookie } from '@/app/actions/userActions'
import { useUserStore } from '@/lib/store/useUserStore'
import { UserCircle2, Check, RefreshCw } from 'lucide-react'

interface HeaderRoleSwitcherProps {
    roles: string[]
    activeRole: string
}

const roleMap: Record<string, string> = {
    super_admin: 'Super Admin',
    admin: 'Department Admin',
    head_of_department: 'Ketua Departemen',
    qa: 'Quality Assurance',
    teacher: 'Dosen',
    student: 'Mahasiswa'
}

export function HeaderRoleSwitcher({ roles, activeRole }: HeaderRoleSwitcherProps) {
    const [loadingRole, setLoadingRole] = useState<string | null>(null)
    const { setActiveRole } = useUserStore()
    const router = useRouter()

    if (roles.length === 0) return null

    const handleRoleSwitch = async (role: string) => {
        if (role === activeRole) return
        
        setLoadingRole(role)
        setActiveRole(role as any) // Update Zustand
        
        const { departmentRoles, departments, setActiveDepartmentId } = useUserStore.getState()
        const visibleDeps = role === 'super_admin' ? departments : 
            (departmentRoles || [])
                .filter(dr => dr.role.split(',').map(r => r.trim()).includes(role) && dr.department)
                .map(dr => dr.department) as any[]
        
        let newDepId = null
        if (visibleDeps.length > 0) {
            newDepId = visibleDeps[0].id
            setActiveDepartmentId(newDepId)
        }

        await setActiveRoleCookie(role)
        if (newDepId) {
            // Need to import setActiveProdiCookie, assuming it's available in userActions
            const { setActiveProdiCookie } = await import('@/app/actions/userActions')
            await setActiveProdiCookie(newDepId)
        }
        
        // Let the application route naturally to the new dashboard
        window.location.href = '/'
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 h-8">
                    <UserCircle2 className="h-4 w-4 text-muted-foreground" />
                    <span className="hidden lg:inline">{roleMap[activeRole] || activeRole}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>Pilih Peran Aktif</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {roles.map((r) => (
                    <DropdownMenuItem 
                        key={r} 
                        onClick={() => handleRoleSwitch(r)}
                        className="flex items-center justify-between cursor-pointer"
                        disabled={loadingRole !== null}
                    >
                        <span>{roleMap[r] || r}</span>
                        {loadingRole === r ? (
                            <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
                        ) : activeRole === r ? (
                            <Check className="h-4 w-4 text-green-500" />
                        ) : null}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
