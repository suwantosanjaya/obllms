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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { createCourse, getSubjects } from '@/app/actions/courseActions'
import { getTeachers } from '@/app/actions/userActions'
import { useRouter } from 'next/navigation'

export function CreateClassDialog({ onCourseCreated, departmentId }: { onCourseCreated?: () => void, departmentId?: string | null }) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState("")
    const router = useRouter()

    const [subjects, setSubjects] = useState<{ id: string, code: string, title: string }[]>([])
    const [teachers, setTeachers] = useState<{ id: string, name: string }[]>([])
    
    const [subjectId, setSubjectId] = useState("")
    const [instructorId, setInstructorId] = useState("")
    const [classCode, setClassCode] = useState("Kelas Reguler")
    const [schedule, setSchedule] = useState("")
    const [semester, setSemester] = useState("Ganjil")
    const [academicYear, setAcademicYear] = useState("2025/2026")

    useEffect(() => {
        async function fetchData() {
            const resSub = await getSubjects(departmentId)
            if (resSub.success && resSub.subjects) {
                setSubjects(resSub.subjects)
            }
            const resTeach = await getTeachers()
            if (resTeach.success && resTeach.teachers) {
                setTeachers(resTeach.teachers)
            }
        }
        if (open) fetchData()
    }, [open])

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)
        setErrorMsg("")

        if (!subjectId || !instructorId || !classCode) {
            setErrorMsg("Harap lengkapi semua isian wajib (Mata Kuliah, Dosen, Nama Kelas).")
            setIsLoading(false)
            return
        }

        const res = await createCourse({
            subjectId,
            semester,
            academicYear,
            instructorId,
            classCode,
            schedule,
            departmentId: departmentId || null,
            isSrlEnabled: true,
            isGamificationEnabled: true,
            isForumEnabled: true,
            isReflectionsEnabled: true,
            isAnalyticsEnabled: true
        })

        if (res.success) {
            setOpen(false)
            setSubjectId("")
            setInstructorId("")
            setClassCode("Kelas Reguler")
            setSchedule("")
            setErrorMsg("")
            router.refresh()
            if (onCourseCreated) onCourseCreated()
        } else {
            setErrorMsg(res.error || "Gagal membuka kelas. Periksa koneksi atau hubungi admin.")
        }

        setIsLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" /> Buka Kelas Baru</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle>Buka Kelas Baru & Assign Dosen</DialogTitle>
                        <DialogDescription>
                            Tugaskan dosen untuk mengajar mata kuliah tertentu di jadwal spesifik.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 py-4">
                        {errorMsg && (
                            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md border border-red-200">
                                {errorMsg}
                            </div>
                        )}
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="subject">Mata Kuliah</Label>
                            <Select value={subjectId} onValueChange={setSubjectId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Mata Kuliah..." />
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

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="instructor">Dosen Pengampu</Label>
                            <Select value={instructorId} onValueChange={setInstructorId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Dosen..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {teachers.map(teacher => (
                                        <SelectItem key={teacher.id} value={teacher.id}>
                                            {teacher.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="classCode">Nama Kelas</Label>
                            <Input 
                                id="classCode" 
                                placeholder="Contoh: Kelas A, Kelas Paralel 1" 
                                value={classCode}
                                onChange={(e) => setClassCode(e.target.value)}
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="schedule">Jadwal (Hari, Jam, Ruangan) <span className="text-muted-foreground font-normal">(Opsional)</span></Label>
                            <Input 
                                id="schedule" 
                                placeholder="Contoh: Senin, 08:00 - 10:30, Ruang 101" 
                                value={schedule}
                                onChange={(e) => setSchedule(e.target.value)}
                            />
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

                    </div>
                    <DialogFooter>
                        <Button variant="outline" type="button" onClick={() => setOpen(false)} disabled={isLoading}>Batal</Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Simpan Kelas
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
