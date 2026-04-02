'use client'

import { useState, useEffect } from 'react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Loader2 } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { createCourse, getSubjects } from '@/app/actions/courseActions'
import { useUserStore } from '@/lib/store/useUserStore'

export function CreateCourseDialog() {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const userId = useUserStore(state => state.userId)

    const [subjects, setSubjects] = useState<{ id: string, code: string, title: string }[]>([])
    const [subjectId, setSubjectId] = useState("")
    const [semester, setSemester] = useState("Ganjil")
    const [academicYear, setAcademicYear] = useState("2025/2026")

    const [isSrlEnabled, setIsSrlEnabled] = useState(true)
    const [isGamificationEnabled, setIsGamificationEnabled] = useState(true)
    const [isForumEnabled, setIsForumEnabled] = useState(true)
    const [isReflectionsEnabled, setIsReflectionsEnabled] = useState(true)
    const [isAnalyticsEnabled, setIsAnalyticsEnabled] = useState(true)

    useEffect(() => {
        async function fetchSubjects() {
            const res = await getSubjects()
            if (res.success && res.subjects) {
                setSubjects(res.subjects)
            }
        }
        fetchSubjects()
    }, [])

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)

        if (!subjectId) {
            alert("Silakan pilih mata kuliah induk terlebih dahulu.")
            setIsLoading(false)
            return
        }

        if (!userId) {
            alert("Anda belum login (Simulasi missing userId)")
            setIsLoading(false)
            return
        }

        const res = await createCourse({
            subjectId,
            semester,
            academicYear,
            instructorId: userId,
            isSrlEnabled,
            isGamificationEnabled,
            isForumEnabled,
            isReflectionsEnabled,
            isAnalyticsEnabled
        })

        if (res.success) {
            setOpen(false)
        } else {
            alert(res.error || "Gagal membuat kelas")
        }

        setIsLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" /> Buat Kelas Baru</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle>Buat Mata Kuliah Baru</DialogTitle>
                        <DialogDescription>
                            Tambahkan mata kuliah untuk dikelola semester ini.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 py-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="subject">Mata Kuliah Induk</Label>
                            <Select value={subjectId} onValueChange={setSubjectId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Mata Kuliah dari Katalog..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {subjects.map(subject => (
                                        <SelectItem key={subject.id} value={subject.id}>
                                            {subject.code} - {subject.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="semester">Semester</Label>
                                <Select value={semester} onValueChange={setSemester}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Semester" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Ganjil">Ganjil</SelectItem>
                                        <SelectItem value="Genap">Genap</SelectItem>
                                        <SelectItem value="Pendek">Pendek</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="academicYear">Tahun Ajaran</Label>
                                <Select value={academicYear} onValueChange={setAcademicYear}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Tahun Ajaran" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="2024/2025">2024/2025</SelectItem>
                                        <SelectItem value="2025/2026">2025/2026</SelectItem>
                                        <SelectItem value="2026/2027">2026/2027</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Course Configuration Toggles */}
                        <div className="flex flex-col mt-2">
                            <h4 className="text-sm font-semibold mb-3 border-b pb-2">Konfigurasi Modul LMS</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="srl" className="text-xs text-muted-foreground">Self-Regulated Learning</Label>
                                    <Switch id="srl" checked={isSrlEnabled} onCheckedChange={setIsSrlEnabled} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="gamification" className="text-xs text-muted-foreground">Gamification (Poin/Badge)</Label>
                                    <Switch id="gamification" checked={isGamificationEnabled} onCheckedChange={setIsGamificationEnabled} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="forum" className="text-xs text-muted-foreground">Forum Diskusi & Q&A</Label>
                                    <Switch id="forum" checked={isForumEnabled} onCheckedChange={setIsForumEnabled} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="reflection" className="text-xs text-muted-foreground">Jurnal Refleksi Mingguan</Label>
                                    <Switch id="reflection" checked={isReflectionsEnabled} onCheckedChange={setIsReflectionsEnabled} />
                                </div>
                                <div className="flex items-center justify-between col-span-1 md:col-span-2">
                                    <Label htmlFor="analytics" className="text-xs text-muted-foreground">Learning Analytics Dashboard</Label>
                                    <Switch id="analytics" checked={isAnalyticsEnabled} onCheckedChange={setIsAnalyticsEnabled} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Simpan Mata Kuliah
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
