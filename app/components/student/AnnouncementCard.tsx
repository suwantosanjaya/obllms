'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Globe, Building2, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

const TAG_COLORS: Record<string, string> = {
    'Fitur Baru': 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
    'Pengumuman': 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
    'Penting': 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
    'Info': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
}

const CONTENT_LIMIT = 120 // characters before showing "more"

export function AnnouncementCard({ announcement }: { announcement: any }) {
    const [expanded, setExpanded] = useState(false)
    const a = announcement
    const isLong = a.content.length > CONTENT_LIMIT

    return (
        <Card className="hover:shadow-sm transition-shadow">
            <CardContent className="pt-4 pb-4">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border-0 ${TAG_COLORS[a.tag] || TAG_COLORS['Info']}`}>
                        {a.tag}
                    </span>
                    {a.scope === 'global' ? (
                        <span className="flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                            <Globe className="w-3 h-3" /> Global
                        </span>
                    ) : (
                        <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                            <Building2 className="w-3 h-3" /> {a.department?.name || 'Program Studi'}
                        </span>
                    )}
                    <span className="text-[11px] text-muted-foreground ml-auto">
                        {new Date(a.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                </div>

                <h3 className="font-semibold">{a.title}</h3>

                <div className={`mt-2 text-sm text-muted-foreground leading-relaxed prose prose-sm max-w-none dark:prose-invert ${!expanded && isLong ? 'max-h-[120px] overflow-hidden relative' : ''}`}>
                    <div dangerouslySetInnerHTML={{ __html: a.content }} />
                    {!expanded && isLong && (
                        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card to-transparent pointer-events-none" />
                    )}
                </div>

                {isLong && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 h-6 px-0 text-xs text-primary hover:bg-transparent hover:text-primary/70"
                        onClick={() => setExpanded(!expanded)}
                    >
                        {expanded ? (
                            <><ChevronUp className="w-3 h-3 mr-1" />Lebih sedikit</>
                        ) : (
                            <><ChevronDown className="w-3 h-3 mr-1" />Selengkapnya</>
                        )}
                    </Button>
                )}

                <p className="text-[11px] text-muted-foreground/60 mt-2">Oleh: {a.author?.name}</p>
            </CardContent>
        </Card>
    )
}
