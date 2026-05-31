import { redirect } from 'next/navigation'
import { getSessionUser } from '@/app/actions/userActions'
import { getStudentCloAnalytics } from '@/app/actions/qaAnalyticsActions'
import { StudentAnalyticsClient } from '@/app/components/qa/StudentAnalyticsClient'

export default async function StudentAnalyticsPage() {
    const sessionUser = await getSessionUser()
    
    if (sessionUser?.role !== 'student') {
        redirect('/login')
    }

    // A student can only view their own analytics
    const analyticsResult = await getStudentCloAnalytics(sessionUser.id)

    if (!analyticsResult.success || !analyticsResult.student) {
        return <div className="p-8 text-center text-red-500">Gagal memuat analitik: {analyticsResult.error || 'Data tidak ditemukan'}</div>
    }

    const { student, clos, plos } = analyticsResult

    return (
        <div className="flex flex-col gap-6 max-w-5xl">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Transkrip Capaian</h1>
                <p className="text-muted-foreground mt-1">
                    Pantau secara langsung sejauh mana Anda menguasai Capaian Pembelajaran yang ditargetkan oleh program studi.
                </p>
            </div>

            <div className="bg-card p-6 rounded-lg border shadow-sm">
                <div className="mb-6 pb-6 border-b">
                    <h2 className="text-lg font-semibold">{student.name}</h2>
                    <p className="text-sm text-muted-foreground">
                        NIM: {student.studentProfile?.nim} | Angkatan: {student.studentProfile?.angkatan}
                    </p>
                </div>
                <StudentAnalyticsClient plos={plos || []} clos={clos || []} studentId={student.id} />
            </div>
        </div>
    )
}
