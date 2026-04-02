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
import { CircleUser, Menu } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Sidebar } from './Sidebar' // We will extract the nav part later to avoid duplication, but for now inside Sheet
import { useRouter } from 'next/navigation'

export function Header() {
    const { role, userName, logout } = useUserStore()
    const router = useRouter()

    const handleLogout = () => {
        logout()
        router.push('/')
    }

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

            <div className="w-full flex-1">
                {/* Search or breadcrumbs could go here */}
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
                            <DropdownMenuLabel>{userName} ({role})</DropdownMenuLabel>
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
