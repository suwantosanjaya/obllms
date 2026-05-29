import { redirect } from 'next/navigation'
import prisma from '@/lib/db'
import { QuizBuilderClient } from '@/app/components/dosen/QuizBuilderClient'

export default async function QuizBuilderPage({ params }: { params: Promise<{ courseId: string, assessmentId: string }> }) {
    const resolvedParams = await params;
    const assessment = await prisma.assessment.findUnique({
        where: { id: resolvedParams.assessmentId },
        include: {
            assessmentClos: {
                include: { clo: true }
            },
            questions: {
                include: { options: true, clo: true }
            }
        }
    })

    if (!assessment) {
        redirect(`/teacher/course/${resolvedParams.courseId}`)
    }

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <QuizBuilderClient assessment={assessment} courseId={resolvedParams.courseId} />
        </div>
    )
}
