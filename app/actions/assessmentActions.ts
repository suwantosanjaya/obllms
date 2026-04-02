'use server'

import prisma from '@/lib/db'
import { revalidatePath } from 'next/cache'

// DOSEN ACTIONS
export async function createAssessment(data: {
    title: string;
    description: string;
    dueDate: Date;
    courseId: string;
    clos: { cloId: string; weight: number }[]; // Multi-CLO with weights (must sum to 100)
}) {
    try {
        const assessment = await prisma.assessment.create({
            data: {
                title: data.title,
                description: data.description,
                type: 'assignment',
                dueDate: data.dueDate,
                courseId: data.courseId,
                assessmentClos: {
                    create: data.clos.map(c => ({
                        cloId: c.cloId,
                        weight: c.weight,
                    }))
                }
            }
        })
        revalidatePath('/dosen/assessments')
        return { success: true, assessment }
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message }
    }
}

export async function getAssessmentsByInstructor(instructorId: string) {
    try {
        const assessments = await prisma.assessment.findMany({
            where: {
                course: { instructorId }
            },
            include: {
                course: {
                    include: { subject: true }
                },
                assessmentClos: {
                    include: { clo: true }
                },
                _count: { select: { submissions: true } },
                submissions: {
                    include: {
                        student: true,
                        cloScores: {
                            include: { clo: true }
                        }
                    }
                }
            },
            orderBy: { dueDate: 'asc' }
        })
        return { success: true, assessments }
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message }
    }
}

export async function gradeSubmission(
    submissionId: string,
    cloScores: { cloId: string; score: number }[],
    feedback: string
) {
    try {
        // Upsert per-CLO scores
        for (const { cloId, score } of cloScores) {
            await prisma.submissionCLOScore.upsert({
                where: { submissionId_cloId: { submissionId, cloId } },
                update: { score },
                create: { submissionId, cloId, score },
            })
        }

        // Compute weighted average using assessment weights
        const submission = await prisma.submission.findUnique({
            where: { id: submissionId },
            include: {
                assessment: {
                    include: { assessmentClos: true }
                },
                cloScores: true,
            }
        })

        let weightedAvg = 0
        if (submission) {
            const weights = submission.assessment.assessmentClos
            for (const acs of weights) {
                const cloScore = submission.cloScores.find(s => s.cloId === acs.cloId)
                if (cloScore) {
                    weightedAvg += (cloScore.score * acs.weight) / 100
                }
            }
        }

        const updated = await prisma.submission.update({
            where: { id: submissionId },
            data: {
                score: Math.round(weightedAvg * 10) / 10,
                feedback,
            }
        })

        revalidatePath('/dosen/assessments')
        return { success: true, submission: updated }
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message }
    }
}

// MAHASISWA ACTIONS
export async function getStudentAssessments(studentId: string) {
    try {
        const enrollments = await prisma.enrollment.findMany({
            where: { studentId },
            select: { courseId: true }
        })

        const courseIds = enrollments.map((e: { courseId: string }) => e.courseId)

        const assessments = await prisma.assessment.findMany({
            where: { courseId: { in: courseIds } },
            include: {
                course: {
                    include: { subject: true }
                },
                assessmentClos: {
                    include: { clo: true }
                },
                submissions: {
                    where: { studentId },
                    include: {
                        cloScores: { include: { clo: true } }
                    }
                }
            },
            orderBy: { dueDate: 'asc' }
        })

        return { success: true, assessments }
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message }
    }
}

export async function submitAssessment(assessmentId: string, studentId: string, fileUrl: string) {
    try {
        const submission = await prisma.submission.upsert({
            where: {
                studentId_assessmentId: {
                    assessmentId,
                    studentId
                }
            },
            update: {
                content: fileUrl,
                submittedAt: new Date()
            },
            create: {
                assessmentId,
                studentId,
                content: fileUrl
            }
        })
        revalidatePath('/mahasiswa/assessments')
        return { success: true, submission }
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message }
    }
}
