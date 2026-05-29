import { redirect } from 'next/navigation'
import prisma from '@/lib/db'
import { QuizTakerClient } from '@/app/components/student/QuizTakerClient'
import { getSessionUser } from '@/app/actions/userActions'

export default async function TakeQuizPage(props: { params: Promise<{ courseId: string, assessmentId: string }> }) {
    const params = await props.params
    const user = await getSessionUser()
    if (!user || user.role !== 'student') {
        redirect('/login')
    }

    const assessment = await prisma.assessment.findUnique({
        where: { id: params.assessmentId },
        include: {
            questions: {
                include: { options: true }
            },
            submissions: {
                where: { studentId: 'student-1' } // Assuming mock user for now, but should ideally come from session
            }
        }
    })

    if (!assessment || !assessment.isPublished) {
        redirect(`/student/course/${params.courseId}`)
    }

    const studentId = user.id
    
    // Check if already submitted
    const existingSubmission = await prisma.submission.findUnique({
        where: {
            studentId_assessmentId: {
                studentId,
                assessmentId: params.assessmentId
            }
        },
        include: {
            answers: true
        }
    })

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <QuizTakerClient 
                assessment={assessment} 
                courseId={params.courseId} 
                studentId={studentId}
                existingSubmission={existingSubmission}
            />
        </div>
    )
}
