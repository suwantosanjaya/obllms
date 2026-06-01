import prisma from '@/lib/db'
import { getSubjects } from '@/app/actions/courseActions'
import { CreateSubjectDialog } from '@/app/components/qa/CreateSubjectDialog'
import { getSessionUser } from '@/app/actions/userActions'
import { SubjectTableClient } from '@/app/components/qa/SubjectTableClient'

export default async function AdminSubjectsPage() {
    const user = await getSessionUser()
    const departmentId = user?.activeDepartmentId || undefined
    const isLocked = user?.activeRole !== 'super_admin'
    
    // Find the facultyId of the active department directly from db to ensure it exists
    let facultyId = undefined
    if (departmentId) {
        const dept = await prisma.department.findUnique({ where: { id: departmentId }, select: { facultyId: true }})
        facultyId = dept?.facultyId || undefined
    }
    
    const res = await getSubjects(departmentId)
    const subjects = res.success ? (res.subjects ?? []) : []

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Katalog Mata Kuliah</h1>
                    <p className="text-muted-foreground mt-1">Kelola master mata kuliah yang tersedia di departemen.</p>
                </div>
                <CreateSubjectDialog defaultFacultyId={facultyId} defaultDepartmentId={departmentId} isLocked={isLocked} />
            </div>

            <SubjectTableClient subjects={subjects} isLocked={isLocked} defaultFacultyId={facultyId} defaultDepartmentId={departmentId} />
        </div>
    )
}
