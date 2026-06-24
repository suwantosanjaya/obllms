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
import { Plus, Loader2, Check, ChevronsUpDown } from 'lucide-react'
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
    SelectGroup,
    SelectLabel
} from "@/components/ui/select"
import { createCourse, getSubjectsByCurriculum } from '@/app/actions/courseActions'
import { getTeachers } from '@/app/actions/userActions'
import { getCurriculumYears } from '@/app/actions/obeActions'
import { getAcademicYearsList } from '@/app/actions/systemSettingActions'
import { useRouter } from 'next/navigation'

export function CreateClassDialog({ onCourseCreated, departmentId }: { onCourseCreated?: () => void, departmentId?: string | null }) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState("")
    const router = useRouter()
    
    const [teacherComboboxOpen, setTeacherComboboxOpen] = useState(false)

    const [subjects, setSubjects] = useState<{ id: string, code: string, title: string }[]>([])
    const [teachers, setTeachers] = useState<{ id: string, name: string }[]>([])
    
    const [curriculumYears, setCurriculumYears] = useState<{ id: string, name: string }[]>([])
    const [curriculumYearId, setCurriculumYearId] = useState("")
    const [subjectId, setSubjectId] = useState("")
    const [instructorId, setInstructorId] = useState("")
    const [classCode, setClassCode] = useState("Kelas Reguler")
    const [schedule, setSchedule] = useState("")
    const [semester, setSemester] = useState("Ganjil")
    const [academicYearsOptions, setAcademicYearsOptions] = useState<string[]>(["2025/2026"])
    const [academicYear, setAcademicYear] = useState("2025/2026")

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
            const yearsOptions = await getAcademicYearsList()
            setAcademicYearsOptions(yearsOptions)
            if (yearsOptions.length > 0 && !yearsOptions.includes(academicYear)) {
                setAcademicYear(yearsOptions[0])
            }
        }
        if (open) fetchData()
    }, [open])

    useEffect(() => {
        async function fetchSubjects() {
            if (!curriculumYearId || !departmentId) {
                setSubjects([])
                return
            }
            const resSub = await getSubjectsByCurriculum(departmentId, curriculumYearId)
            if (resSub.success && resSub.subjects) {
                setSubjects(resSub.subjects)
            }
        }
        fetchSubjects()
    }, [curriculumYearId, departmentId])

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
            curriculumYearId: curriculumYearId || null,
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
                                                const group = `${t.facultyName} - ${t.departmentName}`;
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
                                        {academicYearsOptions.map((year) => (
                                            <SelectItem key={year} value={year}>{year}</SelectItem>
                                        ))}
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
