'use client'

import { useState } from 'react'
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
import { Settings2, Loader2 } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
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
    } | null
}) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    // Form states (use existing config or default to true)
    const [srl, setSrl] = useState(config?.isSrlEnabled ?? true)
    const [gamification, setGamification] = useState(config?.isGamificationEnabled ?? true)
    const [forum, setForum] = useState(config?.isForumEnabled ?? true)
    const [reflections, setReflections] = useState(config?.isReflectionsEnabled ?? true)

    async function handleSave() {
        setLoading(true)
        const res = await updateCourseConfig(courseId, {
            isSrlEnabled: srl,
            isGamificationEnabled: gamification,
            isForumEnabled: forum,
            isReflectionsEnabled: reflections
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
                <Button variant="outline"><Settings2 className="w-4 h-4 mr-2" /> Pengaturan LMS</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Pengaturan Fitur Mata Kuliah</DialogTitle>
                    <DialogDescription>
                        Aktifkan atau nonaktifkan fitur-fitur pendukung pembelajaran (LMS) untuk mata kuliah ini.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    <div className="flex items-center justify-between space-x-2">
                        <div className="flex flex-col gap-1">
                            <Label htmlFor="srl" className="font-semibold text-base flex items-center gap-2">
                                SRL Modul
                            </Label>
                            <span className="text-sm text-muted-foreground">Aktifkan instruksi Self-Regulated Learning di materi.</span>
                        </div>
                        <Switch id="srl" checked={srl} onCheckedChange={setSrl} />
                    </div>

                    <div className="flex items-center justify-between space-x-2">
                        <div className="flex flex-col gap-1">
                            <Label htmlFor="gamification" className="font-semibold text-base flex items-center gap-2">
                                Gamifikasi
                            </Label>
                            <span className="text-sm text-muted-foreground">Sistem poin, lencana (badge), dan level partisipasi.</span>
                        </div>
                        <Switch id="gamification" checked={gamification} onCheckedChange={setGamification} />
                    </div>

                    <div className="flex items-center justify-between space-x-2">
                        <div className="flex flex-col gap-1">
                            <Label htmlFor="forum" className="font-semibold text-base flex items-center gap-2">
                                Forum Diskusi
                            </Label>
                            <span className="text-sm text-muted-foreground">Izinkan mahasiswa membuat ruang diskusi mingguan.</span>
                        </div>
                        <Switch id="forum" checked={forum} onCheckedChange={setForum} />
                    </div>

                    <div className="flex items-center justify-between space-x-2">
                        <div className="flex flex-col gap-1">
                            <Label htmlFor="reflections" className="font-semibold text-base flex items-center gap-2">
                                Jurnal Refleksi
                            </Label>
                            <span className="text-sm text-muted-foreground">Wajibkan evaluasi & refleksi mingguan bagi mahasiswa.</span>
                        </div>
                        <Switch id="reflections" checked={reflections} onCheckedChange={setReflections} />
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
