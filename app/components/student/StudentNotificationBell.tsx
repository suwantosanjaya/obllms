'use client'

import { useState, useEffect } from 'react'
import { Bell, FileText, AlertTriangle, MessageSquare, Megaphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getStudentNotifications, NotificationItem } from '@/app/actions/notificationActions'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'

export function StudentNotificationBell({ studentId, departmentId }: { studentId: string, departmentId: string | null }) {
    const [notifications, setNotifications] = useState<NotificationItem[]>([])
    const [loading, setLoading] = useState(true)
    const [unreadCount, setUnreadCount] = useState(0)

    useEffect(() => {
        const fetchNotifications = async () => {
            const res = await getStudentNotifications(studentId, departmentId)
            if (res.success && res.notifications) {
                setNotifications(res.notifications)
                setUnreadCount(res.notifications.length)
            }
            setLoading(false)
        }
        
        fetchNotifications()
        
        // Optional: Poll every 5 minutes
        const interval = setInterval(fetchNotifications, 5 * 60 * 1000)
        return () => clearInterval(interval)
    }, [studentId, departmentId])

    const getIcon = (type: string) => {
        switch (type) {
            case 'assignment': return <FileText className="h-4 w-4 text-blue-500" />
            case 'risk': return <AlertTriangle className="h-4 w-4 text-red-500" />
            case 'forum': return <MessageSquare className="h-4 w-4 text-green-500" />
            case 'announcement': return <Megaphone className="h-4 w-4 text-purple-500" />
            default: return <Bell className="h-4 w-4" />
        }
    }

    return (
        <DropdownMenu onOpenChange={(open) => {
            if (open) setUnreadCount(0) // Clear badge when opened
        }}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative rounded-full">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 flex h-3 w-3 items-center justify-center rounded-full bg-red-600 text-[8px] font-bold text-white">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                    <span className="sr-only">Notifikasi</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 sm:w-96">
                <DropdownMenuLabel className="flex justify-between items-center">
                    <span>Notifikasi Terbaru</span>
                    <span className="text-xs font-normal text-muted-foreground">{notifications.length} notifikasi</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <div className="max-h-[60vh] overflow-y-auto">
                    {loading ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">Memuat notifikasi...</div>
                    ) : notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">Tidak ada notifikasi baru.</div>
                    ) : (
                        notifications.map((notif) => (
                            <DropdownMenuItem key={notif.id} className="cursor-pointer p-3 focus:bg-muted/50" asChild>
                                <Link href={notif.href} className="flex items-start gap-3 w-full">
                                    <div className="mt-1 flex-shrink-0 bg-muted/50 p-1.5 rounded-full">
                                        {getIcon(notif.type)}
                                    </div>
                                    <div className="flex flex-col gap-1 w-full overflow-hidden">
                                        <div className="flex justify-between items-start gap-2">
                                            <span className="text-sm font-semibold leading-none">{notif.title}</span>
                                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                {formatDistanceToNow(new Date(notif.date), { addSuffix: true, locale: id })}
                                            </span>
                                        </div>
                                        <span className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                            {notif.message}
                                        </span>
                                    </div>
                                </Link>
                            </DropdownMenuItem>
                        ))
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
