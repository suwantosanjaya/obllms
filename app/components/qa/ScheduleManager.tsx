'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CalendarClock, Pencil, Plus, Trash2, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { deleteCourse } from '@/app/actions/courseActions'
import { CreateClassDialog } from './CreateClassDialog'
import { EditClassDialog } from './EditClassDialog'
import { useClientTable } from '@/app/hooks/useClientTable'
import { DataTablePagination } from '../ui/data-table-pagination'
import { SortableTableHead } from '@/app/components/ui/sortable-table-head'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function ScheduleManager({ courses, departmentId }: { courses: any[], departmentId?: string | null }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [selectedCourse, setSelectedCourse] = useState<any>(null)
    const [localCourses, setLocalCourses] = useState(courses)
    const [deleteId, setDeleteId] = useState<string | null>(null)

    const [selectedCurriculumId, setSelectedCurriculumId] = useState<string>('all')
    const [selectedSemesterTA, setSelectedSemesterTA] = useState<string>('all')
    const [hasSetDefaultSemester, setHasSetDefaultSemester] = useState(false)

    const curriculums = useMemo(() => {
        const unique = new Map()
        courses.forEach(c => {
            if (c.curriculumYear) {
                unique.set(c.curriculumYear.id, c.curriculumYear.name)
            }
        })
        return Array.from(unique.entries()).map(([id, name]) => ({ id, name }))
    }, [courses])

    const semesterTAs = useMemo(() => {
        const unique = new Set<string>()
        courses.forEach(c => {
            if (c.semester && c.academicYear) {
                unique.add(`${c.semester} ${c.academicYear}`)
            }
        })
        return Array.from(unique).sort((a, b) => {
            const [semA, yearA] = a.split(' ')
            const [semB, yearB] = b.split(' ')
            if (yearA !== yearB) return yearB.localeCompare(yearA)
            return semA === 'Genap' ? -1 : (semB === 'Genap' ? 1 : 0)
        })
    }, [courses])

    useEffect(() => {
        if (semesterTAs.length > 0 && !hasSetDefaultSemester) {
            setSelectedSemesterTA(semesterTAs[0])
            setHasSetDefaultSemester(true)
        }
    }, [semesterTAs, hasSetDefaultSemester])

    useEffect(() => {
        const filtered = courses.filter(c => {
            const matchCurriculum = selectedCurriculumId === 'all' || c.curriculumYearId === selectedCurriculumId
            const semTa = `${c.semester} ${c.academicYear}`
            const matchSemesterTA = selectedSemesterTA === 'all' || semTa === selectedSemesterTA
            return matchCurriculum && matchSemesterTA
        })
        setLocalCourses(filtered)
    }, [courses, selectedCurriculumId, selectedSemesterTA])

    const {
        searchQuery,
        setSearchQuery,
        pageIndex,
        setPageIndex,
        pageSize,
        setPageSize,
        paginatedData,
        totalItems,
        sortConfig,
        handleSort
    } = useClientTable(localCourses, (c: any) => `${c.subject?.code} ${c.subject?.title} ${c.instructor?.name || ''} ${c.classCode || ''} ${c.semester} ${c.academicYear} ${c.schedule || ''}`)

    const handleEditClick = (course: any) => {
        setSelectedCourse(course)
        setIsDialogOpen(true)
    }

    const handleCourseUpdated = (updatedCourse: any) => {
        setLocalCourses(prev => prev.map(c => c.id === updatedCourse.id ? { ...c, ...updatedCourse } : c))
    }

    const confirmDelete = (courseId: string) => {
        setDeleteId(courseId)
    }

    const handleDelete = async () => {
        if (!deleteId) return
        
        const res = await deleteCourse(deleteId)
        if (res.success) {
            setLocalCourses(prev => prev.filter(c => c.id !== deleteId))
            setDeleteId(null)
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
            <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                    <div className="flex items-center space-x-2">
                        <Search className="w-4 h-4 text-muted-foreground" />
                        <Input 
                            placeholder="Cari kelas (kode, matkul, dosen)..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-[250px] h-8"
                        />
                    </div>
                    <div className="flex items-center space-x-2 w-full sm:w-auto">
                        <Select value={selectedCurriculumId} onValueChange={setSelectedCurriculumId}>
                            <SelectTrigger className="h-8 w-[150px]">
                                <SelectValue placeholder="Kurikulum" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Kurikulum</SelectItem>
                                {curriculums.map(c => (
                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={selectedSemesterTA} onValueChange={setSelectedSemesterTA}>
                            <SelectTrigger className="h-8 w-[180px]">
                                <SelectValue placeholder="Semester / TA" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Semester</SelectItem>
                                {semesterTAs.map(ta => (
                                    <SelectItem key={ta} value={ta}>{ta}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <SortableTableHead label="Kode Kelas" sortKey="subject.code" currentSort={sortConfig} onSort={handleSort} />
                                <SortableTableHead label="Mata Kuliah" sortKey="subject.title" currentSort={sortConfig} onSort={handleSort} />
                                <SortableTableHead label="Dosen" sortKey="instructor.name" currentSort={sortConfig} onSort={handleSort} />
                                <SortableTableHead label="Kurikulum" sortKey="curriculumYear.name" currentSort={sortConfig} onSort={handleSort} />
                                <SortableTableHead label="Semester / TA" sortKey="semester" currentSort={sortConfig} onSort={handleSort} />
                                <SortableTableHead label="Jadwal" sortKey="schedule" currentSort={sortConfig} onSort={handleSort} />
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        Data kelas tidak ditemukan.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedData.map((course: any) => (
                                    <TableRow key={course.id}>
                                        <TableCell className="font-medium">{course.subject.code}</TableCell>
                                        <TableCell>
                                            <span className="font-medium block">{course.subject.title}</span>
                                            <span className="text-xs text-muted-foreground">{course.classCode || 'Kelas Reguler'}</span>
                                        </TableCell>
                                        <TableCell>
                                            {course.instructor ? (
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-sm">
                                                        {course.instructor.teacherProfile?.gelarDepan ? `${course.instructor.teacherProfile.gelarDepan} ` : ''}
                                                        {course.instructor.name}
                                                        {course.instructor.teacherProfile?.gelarBelakang ? `, ${course.instructor.teacherProfile.gelarBelakang}` : ''}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">{course.instructor.email}</span>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="font-mono text-xs">
                                                {course.curriculumYear ? course.curriculumYear.name : 'N/A'}
                                            </Badge>
                                        </TableCell>
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
                                            <div className="flex items-center justify-end gap-2">
                                                {course.schedule ? (
                                                    <>
                                                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(course)}>
                                                            <Pencil className="w-4 h-4 text-blue-600" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => confirmDelete(course.id)}>
                                                            <Trash2 className="w-4 h-4 text-red-600" />
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <Button variant="outline" size="sm" onClick={() => handleEditClick(course)}>
                                                        <Plus className="w-4 h-4 mr-2" /> Atur Jadwal
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
                <DataTablePagination 
                    pageIndex={pageIndex}
                    pageSize={pageSize}
                    totalItems={totalItems}
                    onPageChange={setPageIndex}
                    onPageSizeChange={setPageSize}
                />
            </CardContent>

            <EditClassDialog 
                course={selectedCourse}
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onCourseUpdated={handleCourseUpdated}
                departmentId={departmentId}
            />

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Kelas?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus kelas ini? Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data penugasan mahasiswa di kelas ini.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Ya, Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    )
}
