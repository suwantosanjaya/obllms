import { getSessionUser } from '@/app/actions/userActions'
import { redirect } from 'next/navigation'
import MetricsDashboardClient from '@/app/components/qa/metrics/MetricsDashboardClient'

export default async function MetricsPage() {
    const session = await getSessionUser()
    
    if (!session || !session.activeDepartmentId) {
        redirect('/')
    }

    return (
        <div className="w-full">
            <MetricsDashboardClient departmentId={session.activeDepartmentId} />
        </div>
    )
}
