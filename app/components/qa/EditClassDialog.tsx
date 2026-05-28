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
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Check, ChevronsUpDown } from 'lucide-react'
import { cn } from "@/lib/utils"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { updateCourseDetails, getSubjectsByCurriculum } from '@/app/actions/courseActions'
import { getTeachers } from '@/app/actions/userActions'
import { getCurriculumYears } from '@/app/actions/obeActions'

export function EditClassDialog({ course, open, onOpenChange, onCourseUpdated, departmentId }: { course: any, open: boolean, onOpenChange: (open: boolean) => void, onCourseUpdated?: (course: any) => void, departmentId?: string | null }) {
    const [isLoading, setIsLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState("")
    
    const [teacherComboboxOpen, setTeacherComboboxOpen] = useState(false)

    const [subjects, setSubjects] = useState<{ id: string, code: string, title: string }[]>([])
    const [teachers, setTeachers] = useState<{ id: string, name: string, facultyName?: string, departmentName?: string }[]>([])
    
    const [curriculumYears, setCurriculumYears] = useState<{ id: string, name: string }[]>([])
    
    const [curriculumYearId, setCurriculumYearId] = useState("")
    const [subjectId, setSubjectId] = useState("")
    const [instructorId, setInstructorId] = useState("")
    const [classCode, setClassCode] = useState("")
    const [schedule, setSchedule] = useState("")
    const [semester, setSemester] = useState("")
    const [academicYear, setAcademicYear] = useState("")

    // Initialize state when dialog opens or course changes
    useEffect(() => {
        if (open && course) {
            setCurriculumYearId(course.curriculumYearId || "")
            setSubjectId(course.subjectId || "")
            setInstructorId(course.instructorId || "")
            setClassCode(course.classCode || "Kelas Reguler")
            setSchedule(course.schedule || "")
            setSemester(course.semester || "Ganjil")
            setAcademicYear(course.academicYear || "2024/2025")
            setErrorMsg("")
        }
    }, [open, course])

    // Fetch initial data
    useEffect(() => {
        async function fetchData() {
            const resYears = await getCurriculumYears(departmentId || undefined, true)
            if (Array.isArray(resYears)) {
                setCurriculumYears(resYears)
            }
            const resTeach = await getTeachers()
            if (resTeach.success && resTeach.teachers) {
                setTeachers(resTeach.teachers)
            }
        }
        if (open) fetchData()
    }, [open, departmentId])

    // Fetch subjects when curriculum changes
    useEffect(() => {
        async function fetchSubjects() {
            if (!curriculumYearId || !departmentId) {
                setSubjects([])
                return
            }
            const resSub = await getSubjectsByCurriculum(departmentId, curriculumYearId)
            if (resSub.success && resSub.subjects) {
                setSubjects(resSub.subjects)
                // If the currently selected subject is not in the new list, clear it
                if (subjectId && !resSub.subjects.find(s => s.id === subjectId)) {
                    // Only clear if this isn't the initial load where course.subjectId matches
                    if (course && course.curriculumYearId !== curriculumYearId) {
                        setSubjectId("")
                    }
                }
            }
        }
        fetchSubjects()
    }, [curriculumYearId, departmentId]) // Omitted subjectId and course to prevent infinite loop

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)
        setErrorMsg("")

        if (!subjectId || !instructorId || !classCode) {
            setErrorMsg("Harap lengkapi semua isian wajib (Mata Kuliah, Dosen, Nama Kelas).")
            setIsLoading(false)
            return
        }

        const res = await updateCourseDetails(course.id, {
            subjectId,
            semester,
            academicYear,
            instructorId,
            classCode,
            schedule,
            curriculumYearId: curriculumYearId || null
        })

        if (res.success) {
            onOpenChange(false)
            if (onCourseUpdated && res.course) onCourseUpdated(res.course)
        } else {
            setErrorMsg(res.error || "Gagal menyimpan perubahan. Periksa koneksi atau hubungi admin.")
        }

        setIsLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle>Ubah Data Kelas</DialogTitle>
                        <DialogDescription>
                            Perbarui informasi kelas, dosen, maupun jadwal.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 py-4">
                        {errorMsg && (
                            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md border border-red-200">
                                {errorMsg}
                            </div>
                        )}
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="curriculum">Pilih Kurikulum</Label>
                            <Select value={curriculumYearId} onValueChange={(val) => {
                                setCurriculumYearId(val)
                                setSubjectId("") // Reset subject when curriculum changes
                            }}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Tahun Kurikulum..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {curriculumYears.map(year => (
                                        <SelectItem key={year.id} value={year.id}>
                                            {year.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="subject">Mata Kuliah</Label>
                            <Select value={subjectId} onValueChange={setSubjectId} disabled={!curriculumYearId}>
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
                            <Popover open={teacherComboboxOpen} onOpenChange={setTeacherComboboxOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={teacherComboboxOpen}
                                        className="justify-between font-normal"
                                    >
                                        {instructorId
                                            ? teachers.find((teacher) => teacher.id === instructorId)?.name
                                            : "Cari dan Pilih Dosen..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[450px] p-0">
                                    <Command>
                                        <CommandInput placeholder="Cari nama dosen..." />
                                        <CommandList>
                                            <CommandEmpty>Dosen tidak ditemukan.</CommandEmpty>
                                            {Object.entries(teachers.reduce((acc, t: any) => {
                                                const group = `${t.facultyName || 'Tanpa Fakultas'} - ${t.departmentName || 'Tanpa Departemen'}`;
                                                if (!acc[group]) acc[group] = [];
                                                acc[group].push(t);
                                                return acc;
                                            }, {} as Record<string, any[]>)).map(([group, groupTeachers]) => (
                                                <CommandGroup key={group} heading={group}>
                                                    {groupTeachers.map((teacher: any) => (
                                                        <CommandItem
                                                            key={teacher.id}
                                                            value={teacher.name}
                                                            onSelect={() => {
                                                                setInstructorId(teacher.id === instructorId ? "" : teacher.id)
                                                                setTeacherComboboxOpen(false)
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    instructorId === teacher.id ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                            {teacher.name}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            ))}
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
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
                        <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={isLoading}>Batal</Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Simpan Perubahan
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
