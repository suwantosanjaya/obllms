'use client'

import { useState } from 'react'
import { AnnouncementCard } from './AnnouncementCard'
import { Button } from '@/components/ui/button'
import { ChevronDown } from 'lucide-react'

export function AnnouncementListClient({ announcements }: { announcements: any[] }) {
    const [visibleCount, setVisibleCount] = useState(3)

    const visibleAnnouncements = announcements.slice(0, visibleCount)
    const hasMore = visibleCount < announcements.length

    return (
        <div className="flex flex-col gap-3">
            {visibleAnnouncements.map((a: any) => (
                <AnnouncementCard key={a.id} announcement={a} />
            ))}

            {hasMore && (
                <Button 
                    variant="outline" 
                    className="w-full mt-2 bg-background/50 hover:bg-background"
                    onClick={() => setVisibleCount(prev => prev + 5)}
                >
                    <ChevronDown className="w-4 h-4 mr-2" />
                    Tampilkan Lebih Banyak ({announcements.length - visibleCount} tersisa)
                </Button>
            )}
        </div>
    )
}
