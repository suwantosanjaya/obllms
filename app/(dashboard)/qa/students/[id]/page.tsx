import { redirect } from 'next/navigation'
import { getSessionUser } from '@/app/actions/userActions'
import { getStudentCloAnalytics } from '@/app/actions/qaAnalyticsActions'
import { StudentAnalyticsClient } from '@/app/components/qa/StudentAnalyticsClient'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function QaStudentAnalyticsPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const sessionUser = await getSessionUser()
    
    if (!sessionUser || !['qa', 'head_of_department', 'dean'].includes(sessionUser.activeRole)) {
        redirect('/')
    }

    const analyticsResult = await getStudentCloAnalytics(id)

    if (!analyticsResult.success || !analyticsResult.student) {
        return <div className="p-8 text-center text-red-500">Gagal memuat analitik: {analyticsResult.error || 'Mahasiswa tidak ditemukan'}</div>
    }

    const { student, clos, plos, sclAssessments } = analyticsResult

    return (
        <div className="flex flex-col gap-6 max-w-5xl">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/qa/students">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Transkrip Capaian</h1>
                    <p className="text-muted-foreground mt-1">
                        {student.name} ({student.studentProfile?.nim}) - Angkatan {student.studentProfile?.angkatan}
                    </p>
                </div>
            </div>

            <div className="bg-card p-6 rounded-lg border shadow-sm">
                <StudentAnalyticsClient plos={plos || []} clos={clos || []} sclAssessments={sclAssessments || []} studentId={student.id} />
            </div>
        </div>
    )
}
