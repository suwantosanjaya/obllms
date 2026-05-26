'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Loader2, CalendarClock, Pencil, Plus, Trash2 } from 'lucide-react'
import { updateCourseSchedule, deleteCourse } from '@/app/actions/courseActions'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { CreateClassDialog } from './CreateClassDialog'

export function ScheduleManager({ courses, departmentId }: { courses: any[], departmentId?: string | null }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [selectedCourse, setSelectedCourse] = useState<any>(null)
    const [scheduleInput, setScheduleInput] = useState("")
    const [isSaving, setIsSaving] = useState(false)
    const [localCourses, setLocalCourses] = useState(courses)

    useEffect(() => {
        setLocalCourses(courses)
    }, [courses])

    const handleEditClick = (course: any) => {
        setSelectedCourse(course)
        setScheduleInput(course.schedule || "")
        setIsDialogOpen(true)
    }

    const handleSave = async () => {
        if (!selectedCourse) return
        
        setIsSaving(true)
        const res = await updateCourseSchedule(selectedCourse.id, scheduleInput)
        
        if (res.success) {
            setLocalCourses(prev => prev.map(c => c.id === selectedCourse.id ? { ...c, schedule: scheduleInput } : c))
            setIsDialogOpen(false)
        } else {
            alert("Gagal menyimpan jadwal: " + res.error)
        }
        setIsSaving(false)
    }

    const handleDelete = async (courseId: string) => {
        if (!confirm("Apakah Anda yakin ingin menghapus kelas ini? Tindakan ini tidak dapat dibatalkan.")) return
        
        const res = await deleteCourse(courseId)
        if (res.success) {
            setLocalCourses(prev => prev.filter(c => c.id !== courseId))
        } else {
            alert(res.error)
        }
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Jadwal Kelas Aktif</CardTitle>
                        <CardDescription>Atur jadwal untuk semua kelas yang sedang berjalan.</CardDescription>
                    </div>
                    <CreateClassDialog departmentId={departmentId} />
                </div>
            </CardHeader>
            <CardContent>
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Kode Kelas</TableHead>
                                <TableHead>Mata Kuliah</TableHead>
                                <TableHead>Dosen</TableHead>
                                <TableHead>Semester / TA</TableHead>
                                <TableHead>Jadwal</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {localCourses.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        Belum ada kelas yang didaftarkan.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                localCourses.map((course: any) => (
                                    <TableRow key={course.id}>
                                        <TableCell className="font-medium">{course.subject.code}</TableCell>
                                        <TableCell>
                                            <span className="font-medium block">{course.subject.title}</span>
                                            <span className="text-xs text-muted-foreground">{course.classCode || 'Kelas Reguler'}</span>
                                        </TableCell>
                                        <TableCell>{course.instructor?.name || '-'}</TableCell>
                                        <TableCell>{course.semester} {course.academicYear}</TableCell>
                                        <TableCell>
                                            {course.schedule ? (
                                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1 flex w-fit items-center">
                                                    <CalendarClock className="w-3 h-3" />
                                                    {course.schedule}
                                                </Badge>
                                            ) : (
                                                <span className="text-xs text-muted-foreground italic">Belum diatur</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                {course.schedule ? (
                                                    <>
                                                        <Button variant="outline" size="sm" onClick={() => handleEditClick(course)}>
                                                            <Pencil className="w-4 h-4 mr-2" /> Ubah
                                                        </Button>
                                                        <Button variant="destructive" size="sm" onClick={() => handleDelete(course.id)}>
                                                            <Trash2 className="w-4 h-4 mr-2" /> Hapus Kelas
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <Button variant="default" size="sm" onClick={() => handleEditClick(course)}>
                                                        <Plus className="w-4 h-4 mr-2" /> Tambah Jadwal
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Atur Jadwal Kelas</DialogTitle>
                        <DialogDescription>
                            Tentukan jadwal untuk kelas <strong>{selectedCourse?.subject?.title}</strong> ({selectedCourse?.subject?.code}).
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="schedule">Jadwal (Hari, Jam, Ruangan)</Label>
                            <Input 
                                id="schedule" 
                                placeholder="Contoh: Senin, 08:00 - 10:30, Ruang 101" 
                                value={scheduleInput}
                                onChange={(e) => setScheduleInput(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>Batal</Button>
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Simpan Jadwal
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    )
}
