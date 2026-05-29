'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Settings2, Loader2, Calendar } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { updateCourseConfig } from '@/app/actions/courseActions'

export function CourseSettingsDialog({
    courseId,
    config
}: {
    courseId: string,
    config: {
        isSrlEnabled: boolean;
        isGamificationEnabled: boolean;
        isForumEnabled: boolean;
        isReflectionsEnabled: boolean;
        isPublished?: boolean;
        enrollmentDeadline?: Date | null;
    } | null
}) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    // Form states
    const [isPublished, setIsPublished] = useState(false)
    const [enrollmentDeadline, setEnrollmentDeadline] = useState('')
    
    const [srl, setSrl] = useState(true)
    const [gamification, setGamification] = useState(true)
    const [forum, setForum] = useState(true)
    const [reflections, setReflections] = useState(true)

    const deadlineInputRef = useRef<HTMLInputElement>(null)

    // Sync state with props when the dialog opens
    useEffect(() => {
        if (open) {
            setIsPublished(config?.isPublished ?? false)

            let initialDeadline = ''
            if (config?.enrollmentDeadline) {
                // Use existing deadline from config
                initialDeadline = new Date(config.enrollmentDeadline).toISOString().slice(0, 16)
            } else {
                // Default to current local datetime (rounded to next full hour)
                const now = new Date()
                now.setHours(now.getHours() + 1, 0, 0, 0)
                const offset = now.getTimezoneOffset() * 60000
                const localNow = new Date(now.getTime() - offset)
                initialDeadline = localNow.toISOString().slice(0, 16)
            }
            setEnrollmentDeadline(initialDeadline)

            setSrl(config?.isSrlEnabled ?? true)
            setGamification(config?.isGamificationEnabled ?? true)
            setForum(config?.isForumEnabled ?? true)
            setReflections(config?.isReflectionsEnabled ?? true)
        }
    }, [open, config])

    async function handleSave() {
        if (deadlineInputRef.current && !deadlineInputRef.current.validity.valid) {
            alert('Harap melengkapi format Tanggal dan Jam dengan benar, atau kosongkan sepenuhnya jika tidak ada batas waktu.');
            return;
        }

        setLoading(true)
        const deadlineDate = enrollmentDeadline ? new Date(enrollmentDeadline) : null;
        
        const res = await updateCourseConfig(courseId, {
            isSrlEnabled: srl,
            isGamificationEnabled: gamification,
            isForumEnabled: forum,
            isReflectionsEnabled: reflections,
            isPublished,
            enrollmentDeadline: deadlineDate
        })

        if (res.success) {
            setOpen(false)
        } else {
            alert("Gagal menyimpan pengaturan")
        }
        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline"><Settings2 className="w-4 h-4 mr-2" /> Pengaturan Kelas</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Pengaturan Mata Kuliah</DialogTitle>
                    <DialogDescription>
                        Atur visibilitas kelas, batas pendaftaran, dan fitur-fitur LMS.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4 max-h-[60vh] overflow-y-auto pr-2">
                    {/* Publikasi & Pendaftaran */}
                    <div className="space-y-4 pb-4 border-b">
                        <div className="flex items-center justify-between space-x-2">
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="publish" className="font-semibold text-base">
                                    Publikasi Kelas
                                </Label>
                                <span className="text-sm text-muted-foreground">Tampilkan kelas ini di katalog pendaftaran mahasiswa.</span>
                            </div>
                            <Switch id="publish" checked={isPublished} onCheckedChange={setIsPublished} />
                        </div>
                        
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="deadline" className="font-semibold flex items-center gap-2">
                                <Calendar className="w-4 h-4" /> Batas Akhir Pendaftaran
                            </Label>
                            <Input 
                                id="deadline" 
                                type="datetime-local" 
                                ref={deadlineInputRef}
                                value={enrollmentDeadline} 
                                onChange={e => setEnrollmentDeadline(e.target.value)} 
                            />
                            <span className="text-xs text-muted-foreground">Lewat dari waktu ini, mahasiswa tidak dapat mendaftar (enroll) lagi. Kosongkan jika tidak ada batas.</span>
                        </div>
                    </div>

                    {/* Fitur LMS */}
                    <div className="space-y-4">
                        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Fitur Pembelajaran</h4>
                        <div className="flex items-center justify-between space-x-2">
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="gamification" className="font-semibold text-base">Gamifikasi</Label>
                                <span className="text-sm text-muted-foreground">Poin, lencana, dan level.</span>
                            </div>
                            <Switch id="gamification" checked={gamification} onCheckedChange={setGamification} />
                        </div>

                        <div className="flex items-center justify-between space-x-2">
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="forum" className="font-semibold text-base">Forum Diskusi</Label>
                                <span className="text-sm text-muted-foreground">Ruang diskusi mingguan.</span>
                            </div>
                            <Switch id="forum" checked={forum} onCheckedChange={setForum} />
                        </div>

                        <div className="flex items-center justify-between space-x-2">
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="reflections" className="font-semibold text-base">Jurnal SRL & Refleksi</Label>
                                <span className="text-sm text-muted-foreground">Evaluasi mandiri (SRL) dan refleksi mahasiswa.</span>
                            </div>
                            <Switch id="reflections" checked={reflections} onCheckedChange={setReflections} />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Batal</Button>
                    <Button onClick={handleSave} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Simpan Perubahan
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
