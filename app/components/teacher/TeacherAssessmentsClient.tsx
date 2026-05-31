'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { BookOpen, ChevronDown, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { GradeSubmissionDialog } from '@/app/components/dosen/GradeSubmissionDialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function TeacherAssessmentsClient({ 
    assessments, 
    courses 
}: { 
    assessments: any[], 
    courses: any[] 
}) {
    const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all')
    const [selectedCourseId, setSelectedCourseId] = useState<string>('all')
    const [expandedAssessments, setExpandedAssessments] = useState<Set<string>>(new Set())
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({ key: 'course', direction: 'asc' })

    // Extract unique subjects from courses
    const subjects = Array.from(new Map(courses.map(c => [
        c.subjectId, 
        { id: c.subjectId, code: c.subjectCode, title: c.subjectTitle }
    ])).values())

    // Available courses based on selected subject
    const availableCourses = selectedSubjectId === 'all' 
        ? courses 
        : courses.filter(c => c.subjectId === selectedSubjectId)

    // Reset selected course if it's no longer available after changing subject
    useEffect(() => {
        if (selectedCourseId !== 'all' && !availableCourses.find(c => c.id === selectedCourseId)) {
            setSelectedCourseId('all')
        }
    }, [selectedSubjectId, availableCourses, selectedCourseId])

    const toggleExpand = (id: string) => {
        const newSet = new Set(expandedAssessments)
        if (newSet.has(id)) {
            newSet.delete(id)
        } else {
            newSet.add(id)
        }
        setExpandedAssessments(newSet)
    }

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc'
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc'
        }
        setSortConfig({ key, direction })
    }

    const filteredAssessments = assessments.filter(a => {
        if (selectedSubjectId !== 'all' && a.course?.subjectId !== selectedSubjectId) {
            return false
        }
        if (selectedCourseId !== 'all' && a.courseId !== selectedCourseId) {
            return false
        }
        return true
    })

    const sortedAssessments = [...filteredAssessments].sort((a, b) => {
        if (sortConfig.key === 'title') {
            return sortConfig.direction === 'asc' 
                ? a.title.localeCompare(b.title) 
                : b.title.localeCompare(a.title)
        }
        if (sortConfig.key === 'course') {
            const courseA = a.course?.subject?.title || ''
            const courseB = b.course?.subject?.title || ''
            return sortConfig.direction === 'asc' 
                ? courseA.localeCompare(courseB) 
                : courseB.localeCompare(courseA)
        }
        if (sortConfig.key === 'dueDate') {
            const dateA = new Date(a.dueDate).getTime()
            const dateB = new Date(b.dueDate).getTime()
            return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA
        }
        if (sortConfig.key === 'submissions') {
            const subA = a._count?.submissions || 0
            const subB = b._count?.submissions || 0
            return sortConfig.direction === 'asc' ? subA - subB : subB - subA
        }
        return 0
    })

    // Helper to format score to max 2 decimal places
    const formatScore = (score: number | null | undefined) => {
        if (score === null || score === undefined) return null;
        return Number.isInteger(score) ? score : Number(score.toFixed(2));
    }

    return (
        <Card>
            <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <CardTitle>Daftar Tugas</CardTitle>
                    <CardDescription>Semua tugas yang telah Anda berikan di kelas-kelas Anda.</CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                    <Label className="whitespace-nowrap hidden sm:block">Filter:</Label>
                    
                    {/* Filter 1: Subject (Mata Kuliah) */}
                    <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
                        <SelectTrigger className="w-full sm:w-[220px] overflow-hidden text-left">
                            <span className="truncate block">
                                <SelectValue placeholder="Semua Mata Kuliah" />
                            </span>
                        </SelectTrigger>
                        <SelectContent className="max-w-[calc(100vw-2rem)] sm:max-w-[300px]">
                            <SelectItem value="all">-- Semua Mata Kuliah --</SelectItem>
                            {subjects.map(s => (
                                <SelectItem key={s.id} value={s.id}>
                                    <span className="truncate block pr-4">{s.code} - {s.title}</span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Filter 2: Course (Jadwal/Kelas Pararel) */}
                    <Select value={selectedCourseId} onValueChange={setSelectedCourseId} disabled={availableCourses.length === 0}>
                        <SelectTrigger className="w-full sm:w-[220px] overflow-hidden text-left">
                            <span className="truncate block">
                                <SelectValue placeholder="Semua Jadwal/Kelas" />
                            </span>
                        </SelectTrigger>
                        <SelectContent className="max-w-[calc(100vw-2rem)] sm:max-w-[300px]">
                            <SelectItem value="all">-- Semua Jadwal/Kelas --</SelectItem>
                            {availableCourses.map(c => (
                                <SelectItem key={c.id} value={c.id}>
                                    <span className="truncate block pr-4">
                                        {c.classCode ? c.classCode : c.title} {c.schedule ? `(${c.schedule})` : ''}
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]"></TableHead>
                            <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('title')}>
                                <div className="flex items-center gap-1">
                                    Judul Tugas
                                    {sortConfig.key === 'title' ? (sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 text-muted-foreground/30" />}
                                </div>
                            </TableHead>
                            <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('course')}>
                                <div className="flex items-center gap-1">
                                    Kelas
                                    {sortConfig.key === 'course' ? (sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 text-muted-foreground/30" />}
                                </div>
                            </TableHead>
                            <TableHead>CLO</TableHead>
                            <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('dueDate')}>
                                <div className="flex items-center gap-1">
                                    Tenggat Waktu
                                    {sortConfig.key === 'dueDate' ? (sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 text-muted-foreground/30" />}
                                </div>
                            </TableHead>
                            <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('submissions')}>
                                <div className="flex items-center gap-1">
                                    Pengumpulan
                                    {sortConfig.key === 'submissions' ? (sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 text-muted-foreground/30" />}
                                </div>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedAssessments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                    <div className="flex flex-col items-center gap-2">
                                        <BookOpen className="h-8 w-8 opacity-40" />
                                        <span>Belum ada tugas yang dibuat.</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            sortedAssessments.map((assessment: any) => {
                                const isExpanded = expandedAssessments.has(assessment.id);
                                const hasSubmissions = assessment.submissions && assessment.submissions.length > 0;
                                
                                return (
                                <React.Fragment key={assessment.id}>
                                    <TableRow 
                                        className={`hover:bg-muted/40 transition-colors ${isExpanded ? 'bg-muted/20' : ''}`}
                                    >
                                        <TableCell>
                                            {hasSubmissions && (
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 rounded-full"
                                                    onClick={() => toggleExpand(assessment.id)}
                                                >
                                                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                                </Button>
                                            )}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {assessment.title}
                                            {assessment.description && (
                                                <p className="text-xs text-muted-foreground max-w-[250px] truncate mt-1">
                                                    {assessment.description}
                                                </p>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1 items-start">
                                                <Badge variant="outline">
                                                    {assessment.course?.subject?.code} - {assessment.course?.subject?.title}
                                                </Badge>
                                                {(assessment.course?.classCode || assessment.course?.schedule) && (
                                                    <span className="text-xs text-muted-foreground font-medium pl-1">
                                                        {assessment.course?.classCode || ''}
                                                        {assessment.course?.classCode && assessment.course?.schedule ? ' • ' : ''}
                                                        {assessment.course?.schedule || ''}
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {assessment.assessmentClos.map((ac: any) => (
                                                    <Badge
                                                        key={ac.cloId}
                                                        variant="outline"
                                                        className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/30"
                                                    >
                                                        {ac.clo.code} ({ac.weight}%)
                                                    </Badge>
                                                ))}
                                                {assessment.assessmentClos.length === 0 && (
                                                    <span className="text-xs text-muted-foreground">—</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className={new Date(assessment.dueDate) < new Date() ? 'text-red-500 font-medium' : ''}>
                                                {new Date(assessment.dueDate).toLocaleString('id-ID', {
                                                    dateStyle: 'medium',
                                                    timeStyle: 'short'
                                                })}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={hasSubmissions ? 'default' : 'secondary'}>
                                                {assessment._count?.submissions || 0} Pengumpulan
                                            </Badge>
                                        </TableCell>
                                    </TableRow>

                                    {/* Nested Submissions List */}
                                    {isExpanded && hasSubmissions && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="p-0 border-b">
                                                <div className="bg-muted/20 p-4 pl-12 border-l-4 border-l-primary">
                                                    <h4 className="text-sm font-semibold mb-2 text-foreground">Daftar Pengumpulan Mahasiswa:</h4>
                                                    <div className="space-y-2">
                                                        {assessment.submissions.map((sub: any) => (
                                                            <div key={sub.id} className="flex items-center justify-between bg-card p-3 rounded border border-border text-sm">
                                                                <div className="flex flex-col gap-1">
                                                                    <span className="font-medium">{sub.student.name}</span>
                                                                    <a href={sub.content ?? '#'} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs">
                                                                        Lihat File
                                                                    </a>
                                                                </div>

                                                                {/* Per-CLO score breakdown */}
                                                                {sub.cloScores && sub.cloScores.length > 0 && (
                                                                    <div className="flex flex-wrap gap-1 max-w-[300px]">
                                                                        {sub.cloScores.map((cs: any) => (
                                                                            <Badge
                                                                                key={cs.cloId}
                                                                                variant="outline"
                                                                                className="text-xs bg-green-500/10 text-green-400 border-green-500/30"
                                                                            >
                                                                                {cs.clo.code}: {formatScore(cs.score)}
                                                                            </Badge>
                                                                        ))}
                                                                    </div>
                                                                )}

                                                                <div className="flex items-center gap-4">
                                                                    <span className="text-muted-foreground text-xs">
                                                                        {new Date(sub.submittedAt).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                                                                    </span>
                                                                    {sub.score !== null && sub.score !== undefined ? (
                                                                        <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">
                                                                            Nilai: {formatScore(sub.score)}
                                                                        </Badge>
                                                                    ) : (
                                                                        <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-100">
                                                                            Belum Dinilai
                                                                        </Badge>
                                                                    )}
                                                                    <GradeSubmissionDialog
                                                                        submissionId={sub.id}
                                                                        studentName={sub.student.name}
                                                                        currentScore={formatScore(sub.score) ?? undefined}
                                                                        currentFeedback={sub.feedback}
                                                                        assessmentClos={assessment.assessmentClos}
                                                                        existingCloScores={sub.cloScores}
                                                                    />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </React.Fragment>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
