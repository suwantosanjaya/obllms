import { getSessionUser } from '@/app/actions/userActions'
import { redirect } from 'next/navigation'
import { getDepartmentStudents } from '@/app/actions/qaStudentActions'
import { StudentTableClient } from '@/app/components/qa/StudentTableClient'

export default async function QaStudentsPage() {
    const sessionUser = await getSessionUser()
    if (!sessionUser || !['qa'].includes(sessionUser.activeRole)) {
        redirect('/')
    }

    const { activeDepartmentId } = sessionUser

    if (!activeDepartmentId) {
        return <div className="p-8 text-center text-muted-foreground">Pilih Departemen terlebih dahulu.</div>
    }

    const res = await getDepartmentStudents(activeDepartmentId)
    const students = res.success ? (res.students || []) : []

    return (
        <div className="flex flex-col gap-6 w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Daftar Mahasiswa</h1>
                    <p className="text-muted-foreground mt-1">Kelola data profil, angkatan, dan detail mahasiswa di departemen Anda.</p>
                </div>
            </div>

            <StudentTableClient students={students} />
        </div>
    )
}
