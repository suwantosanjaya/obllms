/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { getAssessmentsByInstructor } from '@/app/actions/assessmentActions'
import { getInstructorCourses } from '@/app/actions/courseActions'
import prisma from '@/lib/db'
import { CreateAssessmentDialog } from '@/app/components/dosen/CreateAssessmentDialog'
import TeacherAssessmentsClient from '@/app/components/teacher/TeacherAssessmentsClient'
import { getSessionUser } from '@/app/actions/userActions'
import { redirect } from 'next/navigation'

export default async function DosenAssessmentsPage() {
    const session = await getSessionUser()
    if (!session || !session.roles?.includes('teacher')) {
        redirect('/')
    }
    const dosenUser = session;

    const coursesRes = await getInstructorCourses(dosenUser.id, dosenUser.activeDepartmentId)
    const assessmentsRes = await getAssessmentsByInstructor(dosenUser.id)

    const courses = coursesRes.success
        ? coursesRes.courses?.map((c: any) => ({ 
            id: c.id, 
            subjectId: c.subjectId, 
            subjectCode: c.subject.code,
            subjectTitle: c.subject.title,
            classCode: c.classCode,
            schedule: c.schedule,
            title: `${c.subject.code} - ${c.subject.title} (${c.semester} ${c.academicYear})${c.classCode ? ` - ${c.classCode}` : ''}`,
            curriculumYearId: c.curriculumYearId
        })) || []
        : []
    const assessments = assessmentsRes.success ? assessmentsRes.assessments || [] : []

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manajemen Tugas</h1>
                    <p className="text-muted-foreground mt-1">Buat tugas baru dan pantau pengumpulan dari mahasiswa.</p>
                </div>
                <CreateAssessmentDialog courses={courses} />
            </div>

            <TeacherAssessmentsClient courses={courses} assessments={assessments} />
        </div>
    )
}
