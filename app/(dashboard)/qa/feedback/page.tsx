import { getSessionUser } from '@/app/actions/userActions'
import { getCurriculumYears } from '@/app/actions/obeActions'
import { getDepartmentFeedbackStats, getCourseFeedbackAggregates, getDetailedFeedbackList } from '@/app/actions/qaFeedbackActions'
import { QAAnalyticsFilter } from '@/app/components/qa/QAAnalyticsFilter'
import { FeedbackDashboardClient } from '@/app/components/qa/FeedbackDashboardClient'

export default async function QaFeedbackPage({
    searchParams,
}: {
    searchParams: Promise<{ curriculumId?: string }>
}) {
    const params = await searchParams
    const sessionUser = await getSessionUser()
    const departmentId = sessionUser?.activeDepartmentId

    if (!departmentId) {
        return <div className="p-8 text-center text-muted-foreground">Pilih Departemen terlebih dahulu.</div>
    }

    const curriculumYears = await getCurriculumYears(departmentId) || []
    
    // Default to active curriculum, or most recent if none active
    const activeCurriculum = curriculumYears.find((c: any) => c.isActive) || curriculumYears[0]
    const activeCurriculumId = params.curriculumId || (activeCurriculum ? activeCurriculum.id : undefined)

    // Fetch data concurrently
    const [statsRes, aggregatesRes, detailedRes] = await Promise.all([
        getDepartmentFeedbackStats(departmentId, activeCurriculumId),
        getCourseFeedbackAggregates(departmentId, activeCurriculumId),
        getDetailedFeedbackList(departmentId, activeCurriculumId)
    ])

    if (!statsRes.success || !aggregatesRes.success || !detailedRes.success) {
        return <div className="p-8 text-center text-red-500">Gagal memuat data umpan balik.</div>
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Umpan Balik Mahasiswa</h1>
                    <p className="text-muted-foreground mt-1">Evaluasi kualitas pengajaran dan materi berdasarkan umpan balik mahasiswa.</p>
                </div>
                {/* We pass empty angkatanList because feedback filter is curriculum-based for now */}
                <QAAnalyticsFilter curriculumYears={curriculumYears} angkatanList={[]} activeCurriculumId={activeCurriculumId} />
            </div>

            <FeedbackDashboardClient 
                stats={{
                    averageRating: statsRes.averageRating || 0,
                    totalFeedback: statsRes.totalFeedback || 0,
                    distribution: statsRes.distribution || {}
                }} 
                courseAggregates={aggregatesRes.courseAggregates || []} 
                detailedFeedbacks={detailedRes.feedbacks || []} 
            />
        </div>
    )
}
