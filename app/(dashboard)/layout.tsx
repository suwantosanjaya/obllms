'use client'

import { Sidebar } from '@/app/components/layout/Sidebar'
import { Header } from '@/app/components/layout/Header'
import { ActiveDepartmentAlert } from '@/app/components/dashboard/ActiveDepartmentAlert'
import { useUserStore } from '@/lib/store/useUserStore'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { activeRole, role, _hasHydrated, departments, activeDepartmentId, isSidebarCollapsed } = useUserStore()
    const router = useRouter()
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    const currentRole = activeRole || role

    useEffect(() => {
        // Only enforce route protection once the component has mounted 
        // AND Zustand persist has finished hydrating from localStorage
        if (isMounted && _hasHydrated && !currentRole) {
            router.replace('/')
        }
    }, [isMounted, _hasHydrated, currentRole, router])

    if (!isMounted || !_hasHydrated || !currentRole) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className={cn(
            "grid h-screen w-full bg-background transition-all duration-300 overflow-hidden",
            isSidebarCollapsed ? "md:grid-cols-[64px_1fr]" : "md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]"
        )}>
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto w-full p-4 lg:p-6 bg-muted/10">
                    {['qa', 'teacher', 'student', 'head_of_department'].includes(currentRole) && (
                        <ActiveDepartmentAlert department={departments?.find(d => d.id === activeDepartmentId)} />
                    )}
                    {children}
                </main>
            </div>
        </div>
    )
}
