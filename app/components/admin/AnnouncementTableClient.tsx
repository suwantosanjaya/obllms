'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Announcement } from '@prisma/client'
import { deleteAnnouncement, updateAnnouncement } from '@/app/actions/announcementActions'
import { AnnouncementDialog } from './AnnouncementDialog'
import { Trash2, Globe, Building2, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const TAG_COLORS: Record<string, string> = {
    'Fitur Baru': 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
    'Pengumuman': 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
    'Penting': 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
    'Info': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
}

type ExtendedAnnouncement = Announcement & {
    department?: { code: string } | null
    author?: { name: string } | null
}

export function AnnouncementTableClient({
    announcements: initial,
    departments,
    activeRole,
    activeDepartmentId,
}: {
    announcements: ExtendedAnnouncement[]
    departments: { id: string; name: string; code: string }[]
    activeRole: string
    activeDepartmentId?: string | null
}) {
    const router = useRouter()
    const { toast } = useToast()
    const [announcements, setAnnouncements] = useState(initial)

    useEffect(() => {
        setAnnouncements(initial)
    }, [initial])
    const [searchQuery, setSearchQuery] = useState('')
    const [filterTag, setFilterTag] = useState('All')
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 5

    const filteredAnnouncements = announcements.filter(a => {
        const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              a.content.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesTag = filterTag === 'All' || a.tag === filterTag
        return matchesSearch && matchesTag
    })

    const totalPages = Math.ceil(filteredAnnouncements.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedAnnouncements = filteredAnnouncements.slice(startIndex, startIndex + itemsPerPage)

    async function handleToggleActive(id: string, current: boolean) {
        const res = await updateAnnouncement(id, { isActive: !current })
        if (res.success) {
            setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, isActive: !current } : a))
            router.refresh()
        } else {
            toast({ title: 'Gagal', description: (res as { error?: string }).error || 'Terjadi kesalahan', variant: 'destructive' })
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Hapus pengumuman ini?')) return
        const res = await deleteAnnouncement(id)
        if (res.success) {
            setAnnouncements(prev => prev.filter(a => a.id !== id))
            toast({ title: 'Dihapus', description: 'Pengumuman telah dihapus.' })
            router.refresh()
        } else {
            toast({ title: 'Gagal', description: (res as { error?: string }).error || 'Terjadi kesalahan', variant: 'destructive' })
        }
    }

    if (announcements.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground border border-dashed rounded-xl">
                <p className="font-medium">Belum ada pengumuman.</p>
                <p className="text-sm mt-1">Klik &quot;Buat Pengumuman&quot; untuk menambahkan.</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-3 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari pengumuman..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    />
                </div>
                <Select value={filterTag} onValueChange={(val) => { setFilterTag(val); setCurrentPage(1); }}>
                    <SelectTrigger className="w-full sm:w-45">
                        <SelectValue placeholder="Semua Kategori" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">Semua Kategori</SelectItem>
                        <SelectItem value="Info">Info</SelectItem>
                        <SelectItem value="Fitur Baru">Fitur Baru</SelectItem>
                        <SelectItem value="Pengumuman">Pengumuman</SelectItem>
                        <SelectItem value="Penting">Penting</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {filteredAnnouncements.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border border-dashed rounded-xl">
                    <p className="font-medium">Tidak ada pengumuman yang cocok.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {paginatedAnnouncements.map(a => (
                <div key={a.id} className={`flex flex-col sm:flex-row sm:items-center gap-3 p-4 border rounded-xl transition-all ${a.isActive ? 'bg-card' : 'bg-muted/30 opacity-60'}`}>
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TAG_COLORS[a.tag] || TAG_COLORS['Info']}`}>{a.tag}</span>
                            {a.scope === 'global' ? (
                                <span className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-medium">
                                    <Globe className="w-3 h-3" /> Global
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                    <Building2 className="w-3 h-3" /> {a.department?.code || 'Program Studi'}
                                </span>
                            )}
                            <span className="text-xs text-muted-foreground">{new Date(a.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                        <p className="font-semibold text-sm">{a.title}</p>
                        <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2 prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: a.content }} />
                        <p className="text-[11px] text-muted-foreground/70 mt-1">Oleh: {a.author?.name}</p>
                    </div>
                    {(activeRole === 'admin' || (activeRole === 'qa' && a.departmentId === activeDepartmentId)) && (
                        <div className="flex items-center gap-2 shrink-0">
                            <Switch checked={a.isActive} onCheckedChange={() => handleToggleActive(a.id, a.isActive)} title="Aktif/nonaktifkan" />
                            <AnnouncementDialog
                                mode="edit"
                                announcement={a}
                                departments={departments}
                                activeRole={activeRole}
                                activeDepartmentId={activeDepartmentId}
                            />
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(a.id)} className="text-destructive hover:text-destructive">
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </div>
            ))}

            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-2 pt-2">
                    <p className="text-sm text-muted-foreground">
                        Menampilkan {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredAnnouncements.length)} dari {filteredAnnouncements.length} pengumuman
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                        >
                            Next <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
        )}
        </div>
    )
}
