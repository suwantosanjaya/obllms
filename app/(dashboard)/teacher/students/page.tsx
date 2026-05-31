import { getSessionUser } from '@/app/actions/userActions'
import { getInstructorCourses } from '@/app/actions/courseActions'
import { redirect } from 'next/navigation'
import TeacherStudentsClient from '@/app/components/teacher/TeacherStudentsClient'

export default async function TeacherStudentsPage() {
    const session = await getSessionUser()
    if (!session || !session.roles?.includes('teacher')) {
        redirect('/')
    }

    const coursesRes = await getInstructorCourses(session.id, session.activeDepartmentId)
    const courses = coursesRes.success ? (coursesRes.courses || []) : []

    // Map course data to match what the client component needs
    const simplifiedCourses = courses.map((c: any) => ({
        id: c.id,
        name: `${c.subject?.code} - ${c.subject?.title} (${c.classCode || 'Reguler'})`,
        semester: c.semester,
        academicYear: c.academicYear,
    }))

    return (
        <div className="flex flex-col gap-6 w-full max-w-full">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Analitik Mahasiswa</h1>
                <p className="text-muted-foreground mt-1">Pemantauan progres dan risiko gagal (At-Risk) per kelas.</p>
            </div>
            
            <TeacherStudentsClient courses={simplifiedCourses} />
        </div>
    )
}

