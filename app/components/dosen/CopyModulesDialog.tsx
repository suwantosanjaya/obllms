'use client'

import { useState, useEffect, useMemo } from 'react'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Copy, Loader2, Calendar } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { getEligibleCoursesForModuleCopy, copyModulesFromCourse } from '@/app/actions/courseActions'
import { useUserStore } from '@/lib/store/useUserStore'

export function CopyModulesDialog({ 
    currentCourseId, 
    subjectId 
}: { 
    currentCourseId: string, 
    subjectId: string 
}) {
    const { toast } = useToast()
    const userId = useUserStore(state => state.userId)
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isFetching, setIsFetching] = useState(false)
    const [courses, setCourses] = useState<any[]>([])
    const [selectedCourseId, setSelectedCourseId] = useState<string>('')
    const [selectedModuleIds, setSelectedModuleIds] = useState<string[]>([])

    useEffect(() => {
        if (isOpen && userId) {
            const fetchCourses = async () => {
                setIsFetching(true)
                try {
                    const res = await getEligibleCoursesForModuleCopy(userId, subjectId, currentCourseId)
                    if (res.success) {
                        setCourses(res.courses || [])
                    } else {
                        toast({ variant: 'destructive', title: res.error || 'Gagal memuat daftar kelas.' })
                    }
                } catch (error) {
                    toast({ variant: 'destructive', title: 'Terjadi kesalahan.' })
                } finally {
                    setIsFetching(false)
                }
            }
            fetchCourses()
        }
    }, [isOpen, userId, subjectId, currentCourseId, toast])

    const selectedCourse = useMemo(() => 
        courses.find(c => c.id === selectedCourseId), 
    [courses, selectedCourseId])

    // When course is selected, auto-select all modules
    useEffect(() => {
        if (selectedCourse && selectedCourse.modules) {
            setSelectedModuleIds(selectedCourse.modules.map((m: any) => m.id))
        } else {
            setSelectedModuleIds([])
        }
    }, [selectedCourse])

    const handleCopy = async () => {
        if (!selectedCourseId) {
            toast({ variant: 'destructive', title: 'Pilih kelas sumber terlebih dahulu' })
            return
        }

        if (selectedModuleIds.length === 0) {
            toast({ variant: 'destructive', title: 'Pilih minimal satu topik untuk disalin' })
            return
        }

        setIsLoading(true)
        try {
            const res = await copyModulesFromCourse(selectedCourseId, currentCourseId, selectedModuleIds)
            if (res.success) {
                toast({ title: `Berhasil menyalin ${selectedModuleIds.length} topik/materi.` })
                setIsOpen(false)
            } else {
                toast({ variant: 'destructive', title: res.error || 'Gagal menyalin materi.' })
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Terjadi kesalahan saat menyalin materi.' })
        } finally {
            setIsLoading(false)
        }
    }

    const toggleSelectAll = () => {
        if (selectedCourse) {
            if (selectedModuleIds.length === selectedCourse.modules.length) {
                setSelectedModuleIds([])
            } else {
                setSelectedModuleIds(selectedCourse.modules.map((m: any) => m.id))
            }
        }
    }

    const toggleModule = (moduleId: string) => {
        if (selectedModuleIds.includes(moduleId)) {
            setSelectedModuleIds(prev => prev.filter(id => id !== moduleId))
        } else {
            setSelectedModuleIds(prev => [...prev, moduleId])
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Copy className="h-4 w-4" />
                    Salin dari Kelas Lain
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px] max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Salin Topik Mingguan</DialogTitle>
                    <DialogDescription>
                        Pilih kelas sumber, lalu centang topik minggu ke-berapa saja yang ingin Anda salin ke kelas ini.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4 flex-1 overflow-hidden flex flex-col min-h-0">
                    <div className="space-y-2 flex-none">
                        <label className="text-sm font-medium">Pilih Kelas Sumber</label>
                        {isFetching ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground p-2 border rounded-md">
                                <Loader2 className="w-4 h-4 animate-spin" /> Memuat kelas...
                            </div>
                        ) : courses.length > 0 ? (
                            <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih kelas..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {courses.map((course) => (
                                        <SelectItem key={course.id} value={course.id}>
                                            {course.semester} {course.academicYear} ({course.modules.length} Topik)
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : (
                            <div className="p-3 text-sm border rounded-md bg-muted/50 text-muted-foreground text-center">
                                Tidak ada riwayat kelas sebelumnya dengan materi untuk mata kuliah ini.
                            </div>
                        )}
                    </div>

                    {selectedCourse && selectedCourse.modules && selectedCourse.modules.length > 0 && (
                        <div className="flex flex-col flex-1 min-h-0 space-y-2 mt-4 border rounded-md p-3">
                            <div className="flex items-center justify-between pb-2 border-b">
                                <span className="text-sm font-medium">Daftar Topik</span>
                                <Button variant="ghost" size="sm" onClick={toggleSelectAll} className="h-8 text-xs">
                                    {selectedModuleIds.length === selectedCourse.modules.length ? 'Batal Pilih Semua' : 'Pilih Semua'}
                                </Button>
                            </div>
                            <div className="overflow-y-auto flex-1 pr-2 space-y-2 max-h-[30vh]">
                                {selectedCourse.modules.sort((a: any, b: any) => a.weekNumber - b.weekNumber).map((mod: any) => (
                                    <div key={mod.id} className="flex items-start space-x-3 p-2 hover:bg-muted/50 rounded-md">
                                        <Checkbox 
                                            id={`mod-${mod.id}`} 
                                            checked={selectedModuleIds.includes(mod.id)}
                                            onCheckedChange={() => toggleModule(mod.id)}
                                            className="mt-1"
                                        />
                                        <div className="flex flex-col gap-1">
                                            <label 
                                                htmlFor={`mod-${mod.id}`}
                                                className="text-sm font-medium leading-none cursor-pointer"
                                            >
                                                <span className="text-muted-foreground mr-2">M{mod.weekNumber}:</span>
                                                {mod.title}
                                            </label>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="mt-2">
                    <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
                        Batal
                    </Button>
                    <Button onClick={handleCopy} disabled={isLoading || courses.length === 0 || !selectedCourseId || selectedModuleIds.length === 0}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Menyalin...
                            </>
                        ) : (
                            selectedModuleIds.length > 0 ? `Salin ${selectedModuleIds.length} Topik` : 'Pilih Topik'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
