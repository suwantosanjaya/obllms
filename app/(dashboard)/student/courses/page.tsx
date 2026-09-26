/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StudentCoursesList } from '@/app/components/student/StudentCoursesList'
import { getStudentCourses, getAvailableCourses } from '@/app/actions/courseActions'
import { getSessionUser } from '@/app/actions/userActions'
import { redirect } from 'next/navigation'

export default async function MahasiswaCoursesPage() {
    const mhsUser = await getSessionUser()

    if (!mhsUser || !mhsUser.roles?.includes('student')) {
        redirect('/')
    }

    const enrolledRes = await getStudentCourses(mhsUser.id, mhsUser.activeDepartmentId)
    const availableRes = await getAvailableCourses(mhsUser.id, mhsUser.activeDepartmentId)

    const enrolledCourses = enrolledRes.success ? enrolledRes.enrollments || [] : []
    const availableCourses = availableRes.success ? availableRes.courses || [] : []
    
    const now = new Date()

    return (
        <div className="flex flex-col gap-8">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Eksplorasi Kelas</h1>
                <p className="text-muted-foreground mt-1">Daftar kelas baru dan lihat kelas yang sedang Anda ambil.</p>
            </div>

            <StudentCoursesList enrolledCourses={enrolledCourses} availableCourses={availableCourses} studentId={mhsUser.id} />
        </div>
    )
}
