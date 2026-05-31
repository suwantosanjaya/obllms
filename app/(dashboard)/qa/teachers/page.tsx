import { getSessionUser } from '@/app/actions/userActions'
import { redirect } from 'next/navigation'
import { getDepartmentTeachers } from '@/app/actions/qaTeacherActions'
import { TeacherTableClient } from '@/app/components/qa/TeacherTableClient'

export default async function QaTeachersPage() {
    const sessionUser = await getSessionUser()
    if (!sessionUser || !['qa'].includes(sessionUser.activeRole)) {
        redirect('/')
    }

    const { activeDepartmentId } = sessionUser

    if (!activeDepartmentId) {
        return <div className="p-8 text-center text-muted-foreground">Pilih Departemen terlebih dahulu.</div>
    }

    const res = await getDepartmentTeachers(activeDepartmentId)
    const teachers = res.success ? (res.teachers || []) : []

    return (
        <div className="flex flex-col gap-6 w-full">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Daftar Dosen</h1>
                <p className="text-muted-foreground mt-1">Kelola data dosen dan tambahkan akun dosen baru di departemen Anda.</p>
            </div>
            <TeacherTableClient teachers={teachers} departmentId={activeDepartmentId} />
        </div>
    )
}
