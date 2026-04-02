'use client'

import { Sidebar } from '@/app/components/layout/Sidebar'
import { Header } from '@/app/components/layout/Header'
import { useUserStore } from '@/lib/store/useUserStore'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { role, _hasHydrated } = useUserStore()
    const router = useRouter()
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    useEffect(() => {
        // Only enforce route protection once the component has mounted 
        // AND Zustand persist has finished hydrating from localStorage
        if (isMounted && _hasHydrated && !role) {
            router.replace('/')
        }
    }, [isMounted, _hasHydrated, role, router])

    if (!isMounted || !_hasHydrated || !role) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] bg-background">
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto w-full p-4 lg:p-6 bg-muted/10">
                    {children}
                </main>
            </div>
        </div>
    )
}
