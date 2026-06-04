import { getSessionUser } from '@/app/actions/userActions'
import { redirect } from 'next/navigation'
import { getDepartmentStudents, getFacultyStudents } from '@/app/actions/qaStudentActions'
import { StudentTableClient } from '@/app/components/qa/StudentTableClient'
import prisma from '@/lib/db'

export default async function QaStudentsPage() {
    const sessionUser = await getSessionUser()
    if (!sessionUser || !['qa', 'head_of_department', 'dean'].includes(sessionUser.activeRole)) {
        redirect('/')
    }

    const { activeDepartmentId, activeRole } = sessionUser

    let students: any[] = []
    let facultyDepartments: any[] = []
    
    if (activeRole === 'dean') {
        const faculty = await prisma.faculty.findFirst({
            where: { activeDeanId: sessionUser.id },
            include: { departments: { select: { id: true, name: true, code: true } } }
        })
        if (!faculty) {
            return <div className="p-8 text-center text-muted-foreground">Fakultas tidak ditemukan untuk Dekan ini.</div>
        }
        facultyDepartments = faculty.departments || []
        const res = await getFacultyStudents(faculty.id)
        students = res.success ? (res.students || []) : []
    } else {
        if (!activeDepartmentId) {
            return <div className="p-8 text-center text-muted-foreground">Pilih Program Studi terlebih dahulu.</div>
        }
        const res = await getDepartmentStudents(activeDepartmentId)
        students = res.success ? (res.students || []) : []
    }

    return (
        <div className="flex flex-col gap-6 w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Daftar Mahasiswa</h1>
                    <p className="text-muted-foreground mt-1">Kelola data profil, angkatan, dan detail mahasiswa.</p>
                </div>
            </div>

            <StudentTableClient students={students} facultyDepartments={facultyDepartments} />
        </div>
    )
}
