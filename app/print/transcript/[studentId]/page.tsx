import { getStudentCloAnalytics } from '@/app/actions/qaAnalyticsActions'
import { PrintTranscriptClient } from './PrintTranscriptClient'

// Set dynamic to avoid static generation caching issues since data changes
export const dynamic = 'force-dynamic'

export default async function TranscriptPrintPage({
    params
}: {
    params: Promise<{ studentId: string }>
}) {
    const { studentId } = await params
    
    const analyticsResult = await getStudentCloAnalytics(studentId)

    if (!analyticsResult.success || !analyticsResult.student) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen font-sans">
                <h1 className="text-2xl font-bold mb-4">Gagal memuat transkrip</h1>
                <p>{analyticsResult.error || 'Mahasiswa tidak ditemukan'}</p>
                <p className="mt-6 text-sm text-gray-500">Silakan tutup tab ini.</p>
            </div>
        )
    }

    const { student, clos, plos } = analyticsResult

    return (
        <PrintTranscriptClient 
            student={student} 
            plos={plos || []} 
            clos={clos || []} 
        />
    )
}
