import { getSessionUser } from '@/app/actions/userActions'
import { getQAActiveCourses } from '@/app/actions/obeActions'
import { redirect } from 'next/navigation'
import { ScheduleManager } from '@/app/components/qa/ScheduleManager'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function QASchedulesPage() {
    const qaUser = await getSessionUser()
    if (!qaUser || !qaUser.roles?.includes('qa')) {
        redirect('/')
    }

    const coursesRes = await getQAActiveCourses(qaUser.activeDepartmentId)
    const courses = coursesRes.success ? coursesRes.courses : []

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/qa">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manajemen Jadwal Mata Kuliah</h1>
                    <p className="text-muted-foreground mt-1">Atur dan pantau jadwal kelas untuk semua dosen di program studi Anda.</p>
                </div>
            </div>

            <ScheduleManager courses={courses} departmentId={qaUser.activeDepartmentId} />
        </div>
    )
}
