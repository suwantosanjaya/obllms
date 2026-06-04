import prisma from '@/lib/db'
import { getSessionUser } from '@/app/actions/userActions'
import { redirect } from 'next/navigation'
import { TrainingManagementClient } from '@/app/components/qa/TrainingManagementClient'

export default async function QATrainingPage() {
    const user = await getSessionUser()
    if (!user || !user.roles?.includes('qa')) {
        redirect('/')
    }

    const modules = await prisma.trainingModule.findMany({
        orderBy: { createdAt: 'desc' },
        include: { category: true }
    })

    const categories = await prisma.trainingCategory.findMany({
        orderBy: { name: 'asc' }
    })

    return (
        <TrainingManagementClient initialModules={modules} initialCategories={categories} />
    )
}
