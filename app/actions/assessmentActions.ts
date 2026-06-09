'use server'

import prisma from '@/lib/db'
import { revalidatePath } from 'next/cache'

// DOSEN ACTIONS
export async function createAssessment(data: {
    title: string;
    description: string;
    type: string;
    dueDate: Date;
    courseId: string;
    clos: { cloId: string; weight: number }[]; // Multi-CLO with weights (must sum to 100)
    format?: string; // 'upload' or 'quiz'
    allowReview?: boolean;
    shuffleQuestions?: boolean;
    timeLimit?: number | null;
}) {
    try {
        const assessment = await prisma.assessment.create({
            data: {
                title: data.title,
                description: data.description,
                type: data.type,
                format: data.format || 'upload',
                allowReview: data.allowReview ?? false,
                shuffleQuestions: data.shuffleQuestions ?? false,
                timeLimit: data.timeLimit || null,
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
        revalidatePath('/teacher/assessments')
        return { success: true, assessmentId: assessment.id, assessment }
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message }
    }
}

export async function updateAssessment(data: {
    id: string;
    title: string;
    description: string;
    type: string;
    dueDate: Date;
    courseId: string;
    clos?: { cloId: string; weight: number }[]; // Optional if not allowed to change
    allowReview?: boolean;
    shuffleQuestions?: boolean;
    timeLimit?: number | null;
}) {
    try {
        // Find existing assessment and check submissions
        const existing = await prisma.assessment.findUnique({
            where: { id: data.id },
            include: {
                submissions: {
                    select: { score: true }
                }
            }
        })

        if (!existing) return { success: false, error: 'Penugasan tidak ditemukan.' }

        const hasGradedSubmissions = existing.submissions.some(s => s.score !== null)

        await prisma.$transaction(async (tx: any) => {
            // Update basic fields
            await tx.assessment.update({
                where: { id: data.id },
                data: {
                    title: data.title,
                    description: data.description,
                    dueDate: data.dueDate,
                    allowReview: data.allowReview ?? false,
                    ...(data.shuffleQuestions !== undefined ? { shuffleQuestions: data.shuffleQuestions } : {}),
                    ...(data.timeLimit !== undefined ? { timeLimit: data.timeLimit } : {}),
                    // Only update type if not graded
                    ...(hasGradedSubmissions ? {} : { type: data.type })
                }
            })

            // Only update CLOs if not graded and clos is provided
            if (!hasGradedSubmissions && data.clos) {
                // Delete old mappings
                await tx.assessmentCLO.deleteMany({
                    where: { assessmentId: data.id }
                })
                // Create new mappings
                await tx.assessmentCLO.createMany({
                    data: data.clos.map(c => ({
                        assessmentId: data.id,
                        cloId: c.cloId,
                        weight: c.weight
                    }))
                })
            }
        })

        revalidatePath('/teacher/assessments')
        revalidatePath(`/teacher/course/${data.courseId}`)
        return { success: true }
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

export async function getAssessmentsForCourse(courseId: string) {
    try {
        const assessments = await prisma.assessment.findMany({
            where: { courseId },
            include: {
                course: {
                    include: { subject: true }
                },
                assessmentClos: {
                    include: { clo: true }
                },
                questions: {
                    include: { options: true }
                },
                _count: { select: { submissions: true } },
                submissions: {
                    include: {
                        student: true,
                        cloScores: {
                            include: { clo: true }
                        },
                        answers: {
                            include: { 
                                question: {
                                    include: { options: true }
                                }
                            }
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

export async function getCourseGradebookData(courseId: string) {
    try {
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            include: {
                subject: true,
                enrollments: {
                    include: {
                        student: {
                            include: { studentProfile: true }
                        }
                    },
                    orderBy: {
                        student: { name: 'asc' }
                    }
                },
                assessments: {
                    orderBy: { dueDate: 'asc' },
                    include: {
                        assessmentClos: {
                            include: { clo: true }
                        }
                    }
                }
            }
        })

        if (!course) throw new Error("Course not found")

        const submissions = await prisma.submission.findMany({
            where: {
                assessmentId: { in: course.assessments.map(a => a.id) }
            },
            include: {
                cloScores: {
                    include: { clo: true }
                }
            }
        })

        let subjectClos = await prisma.subjectCLO.findMany({
            where: { subjectId: course.subjectId },
            include: { clo: true, techniques: true, plo: true }
        })

        // Filter CLOs by the course's curriculum year (to avoid showing legacy CLOs)
        if (course.curriculumYearId) {
            subjectClos = subjectClos.filter(sc => sc.clo.curriculumYearId === course.curriculumYearId)
        }

        return { success: true, course, submissions, subjectClos }
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message }
    }
}

export async function gradeSubmission(
    submissionId: string,
    cloScores: { cloId: string; score: number }[],
    feedback: string,
    essayScores?: { answerId: string; points: number }[]
) {
    try {
        let hasValidScores = false

        if (essayScores) {
            // Update the points in StudentAnswer for essay questions
            for (const es of essayScores) {
                if (!isNaN(es.points) && es.points !== null) {
                    await prisma.studentAnswer.update({
                        where: { id: es.answerId },
                        data: { points: es.points }
                    })
                }
            }
            
            // Re-fetch submission with updated answers to calculate CLO scores
            const submissionWithAnswers = await prisma.submission.findUnique({
                where: { id: submissionId },
                include: {
                    answers: { include: { question: true } },
                    assessment: { include: { assessmentClos: true } }
                }
            })
            
            if (submissionWithAnswers) {
                cloScores = []
                const assessmentClos = submissionWithAnswers.assessment.assessmentClos
                
                for (const ac of assessmentClos) {
                    // Specific to this CLO
                    const cloAnswers = submissionWithAnswers.answers.filter(ans => ans.question.cloId === ac.cloId)
                    let earned = 0
                    let possible = 0
                    for (const ans of cloAnswers) {
                        if (ans.points !== null) earned += ans.points
                        possible += ans.question.points
                    }
                    
                    // Legacy: General questions without specific CLO mapping
                    const generalAnswers = submissionWithAnswers.answers.filter(ans => ans.question.cloId === null)
                    let genEarned = 0
                    let genPossible = 0
                    for (const ans of generalAnswers) {
                         if (ans.points !== null) genEarned += ans.points
                         genPossible += ans.question.points
                    }
                    
                    let totalEarned = earned + (genEarned * (ac.weight / 100))
                    let totalPossible = possible + (genPossible * (ac.weight / 100))
                    
                    let finalCloScore = totalPossible > 0 ? (totalEarned / totalPossible) * 100 : 0
                    
                    cloScores.push({ cloId: ac.cloId, score: finalCloScore })
                }
            }
        }

        // Upsert per-CLO scores
        for (const { cloId, score } of cloScores) {
            if (!isNaN(score) && score !== null) {
                hasValidScores = true
                await prisma.submissionCLOScore.upsert({
                    where: { submissionId_cloId: { submissionId, cloId } },
                    update: { score },
                    create: { submissionId, cloId, score },
                })
            }
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
                score: hasValidScores ? Math.round(weightedAvg * 10) / 10 : null,
                feedback,
            }
        })

        revalidatePath('/teacher/assessments')
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
            where: { courseId: { in: courseIds }, isPublished: true },
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
        revalidatePath('/student/assessments')
        return { success: true, submission }
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message }
    }
}

// ----------------------------------------------------
// QUIZ ENGINE ACTIONS
// ----------------------------------------------------

export async function addQuizQuestion(data: {
    assessmentId: string
    text: string
    type: string
    points: number
    cloId?: string
    options: { text: string, isCorrect: boolean }[]
}) {
    try {
        const question = await prisma.assessmentQuestion.create({
            data: {
                assessmentId: data.assessmentId,
                text: data.text,
                type: data.type,
                points: data.points,
                cloId: data.cloId,
                options: data.type === 'MULTIPLE_CHOICE' ? {
                    create: data.options.map(o => ({
                        text: o.text,
                        isCorrect: o.isCorrect
                    }))
                } : undefined
            },
            include: { options: true, clo: true }
        })
        revalidatePath(`/teacher/course/[courseId]/assessment/${data.assessmentId}/builder`, 'page')
        return { success: true, question }
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message }
    }
}

export async function deleteQuizQuestion(id: string) {
    try {
        await prisma.assessmentQuestion.delete({ where: { id } })
        return { success: true }
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message }
    }
}

export async function updateQuizQuestion(data: {
    id: string
    text: string
    type: string
    points: number
    cloId: string
    options: { text: string; isCorrect: boolean }[]
}) {
    try {
        const question = await prisma.$transaction(async (tx: any) => {
            const q = await tx.assessmentQuestion.update({
                where: { id: data.id },
                data: {
                    text: data.text,
                    type: data.type,
                    points: data.points,
                    cloId: data.cloId
                }
            })

            await tx.assessmentQuestionOption.deleteMany({
                where: { questionId: data.id }
            })

            if (data.type === 'MULTIPLE_CHOICE' && data.options.length > 0) {
                await tx.assessmentQuestionOption.createMany({
                    data: data.options.map(opt => ({
                        questionId: data.id,
                        text: opt.text,
                        isCorrect: opt.isCorrect
                    }))
                })
            }

            return tx.assessmentQuestion.findUnique({
                where: { id: data.id },
                include: { options: true, clo: true }
            })
        })

        return { success: true, question }
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message }
    }
}

export async function submitQuizAnswers(data: {
    assessmentId: string
    studentId: string
    answers: { questionId: string, selectedOptionId?: string, textResponse?: string }[]
}) {
    try {
        const assessment = await prisma.assessment.findUnique({
            where: { id: data.assessmentId },
            include: { questions: { include: { options: true } }, assessmentClos: true }
        })

        if (!assessment) throw new Error("Kuis tidak ditemukan")

        let totalScoreEarned = 0
        let totalPossibleScore = 0
        let hasEssays = false

        const answerRecords = data.answers.map(ans => {
            const question = assessment.questions.find(q => q.id === ans.questionId)
            if (!question) throw new Error("Soal tidak valid")
            
            let pointsEarned = null
            totalPossibleScore += question.points

            if (question.type === 'MULTIPLE_CHOICE') {
                const correctOption = question.options.find(o => o.isCorrect)
                if (correctOption && correctOption.id === ans.selectedOptionId) {
                    pointsEarned = question.points
                    totalScoreEarned += pointsEarned
                } else {
                    pointsEarned = 0
                }
            } else if (question.type === 'ESSAY') {
                hasEssays = true
            }

            return {
                questionId: ans.questionId,
                selectedOptionId: ans.selectedOptionId,
                textResponse: ans.textResponse,
                points: pointsEarned
            }
        })

        let finalScore = null
        let cloScoresData = null
        
        if (!hasEssays && totalPossibleScore > 0) {
            finalScore = (totalScoreEarned / totalPossibleScore) * 100
            
            // Automatically calculate per-CLO scores
            if (assessment.assessmentClos.length > 0) {
                const cloScores = []
                for (const ac of assessment.assessmentClos) {
                    const cloAnswers = answerRecords.filter(ans => {
                        const q = assessment.questions.find(q => q.id === ans.questionId)
                        return q?.cloId === ac.cloId
                    })
                    let earned = 0
                    let possible = 0
                    for (const ans of cloAnswers) {
                        if (ans.points !== null) earned += ans.points
                        const q = assessment.questions.find(q => q.id === ans.questionId)
                        if (q) possible += q.points
                    }
                    
                    const generalAnswers = answerRecords.filter(ans => {
                        const q = assessment.questions.find(q => q.id === ans.questionId)
                        return q?.cloId === null
                    })
                    let genEarned = 0
                    let genPossible = 0
                    for (const ans of generalAnswers) {
                        if (ans.points !== null) genEarned += ans.points
                        const q = assessment.questions.find(q => q.id === ans.questionId)
                        if (q) genPossible += q.points
                    }
                    
                    let totalEarned = earned + (genEarned * (ac.weight / 100))
                    let totalPossible = possible + (genPossible * (ac.weight / 100))
                    let finalCloScore = totalPossible > 0 ? (totalEarned / totalPossible) * 100 : 0
                    
                    cloScores.push({ cloId: ac.cloId, score: finalCloScore })
                }
                
                cloScoresData = cloScores
            }
        }

        const submission = await prisma.submission.upsert({
            where: {
                studentId_assessmentId: {
                    assessmentId: data.assessmentId,
                    studentId: data.studentId
                }
            },
            update: {
                submittedAt: new Date(),
                score: finalScore,
                answers: {
                    deleteMany: {},
                    create: answerRecords
                },
                cloScores: cloScoresData ? {
                    deleteMany: {},
                    create: cloScoresData
                } : undefined
            },
            create: {
                assessmentId: data.assessmentId,
                studentId: data.studentId,
                score: finalScore,
                answers: {
                    create: answerRecords
                },
                cloScores: cloScoresData ? {
                    create: cloScoresData
                } : undefined
            }
        })

        const { revalidatePath } = require('next/cache')
        revalidatePath(`/student/course/[courseId]/assessment/[assessmentId]/take`, 'page')
        revalidatePath(`/student/course/[courseId]`, 'page')
        
        return { success: true, submission }
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message }
    }
}

export async function togglePublishAssessment(assessmentId: string, isPublished: boolean, force: boolean = false) {
    try {
        if (!isPublished) {
            // Check if there are any submissions
            const submissions = await prisma.submission.findMany({
                where: { assessmentId },
                select: { id: true, score: true }
            })
            
            if (submissions.length > 0) {
                // If not graded but submitted, or even graded, require force flag
                if (!force) {
                    const hasGraded = submissions.some(s => s.score !== null)
                    let warningText = 'Sudah ada mahasiswa yang mengumpulkan tugas. Jika Anda meng-unpublish, tugas akan tersembunyi dari mereka. Lanjutkan?'
                    if (hasGraded) {
                        warningText = 'PERINGATAN: Sudah ada mahasiswa yang mengumpulkan DAN memiliki nilai pada tugas ini. Jika Anda meng-unpublish (kembali ke draft), tugas beserta nilainya akan tersembunyi dari mereka dan ini berpotensi membingungkan mahasiswa. Lanjutkan?'
                    }
                    return { 
                        success: false, 
                        warning: true,
                        error: warningText 
                    }
                }
            }
        }

        const updated = await prisma.assessment.update({
            where: { id: assessmentId },
            data: { isPublished }
        })

        const { revalidatePath } = require('next/cache')
        revalidatePath('/teacher/assessments')
        revalidatePath(`/teacher/course/${updated.courseId}`)
        return { success: true, assessment: updated }
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message }
    }
}

export async function deleteAssessment(assessmentId: string) {
    try {
        const assessment = await prisma.assessment.findUnique({
            where: { id: assessmentId },
            select: { isPublished: true }
        })

        if (!assessment) {
            return { success: false, error: 'Penugasan tidak ditemukan.' }
        }

        if (assessment.isPublished) {
            return { success: false, error: 'Penugasan harus diubah ke status Draft (Unpublished) terlebih dahulu sebelum dapat dihapus.' }
        }

        const deleted = await prisma.assessment.delete({
            where: { id: assessmentId }
        })

        const { revalidatePath } = require('next/cache')
        revalidatePath('/teacher/assessments')
        revalidatePath(`/teacher/course/${deleted.courseId}`)
        return { success: true }
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message }
    }
}

export async function resetSubmissionGrade(submissionId: string, rejectReason?: string) {
    try {
        // Find submission first to get assessment and student info for revalidation
        const submission = await prisma.submission.findUnique({
            where: { id: submissionId },
            include: { assessment: true }
        })

        if (!submission) {
            return { success: false, error: 'Pengumpulan tidak ditemukan.' }
        }

        // We use a transaction to ensure data integrity
        await prisma.$transaction(async (tx: any) => {
            // Delete all CLO scores
            await tx.submissionCLOScore.deleteMany({
                where: { submissionId }
            })

            if (submission.assessment.format === 'quiz' && !rejectReason) {
                // For CBT without reason, completely delete the submission to allow retaking
                await tx.studentAnswer.deleteMany({
                    where: { submissionId }
                })
                await tx.submission.delete({
                    where: { id: submissionId }
                })
            } else {
                // For assignments (or CBT with explicit reject reason), we update instead
                await tx.submission.update({
                    where: { id: submissionId },
                    data: {
                        score: null,
                        content: 'DITOLAK',
                        feedback: rejectReason || 'Tugas dikembalikan oleh dosen. Silakan kumpulkan ulang.'
                    }
                })
            }
        })

        const { revalidatePath } = require('next/cache')
        revalidatePath(`/teacher/course/${submission.assessment.courseId}`)
        return { success: true }
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message }
    }
}

export async function getAssessmentsBySubject(subjectId: string, currentCourseId: string) {
    try {
        const assessments = await prisma.assessment.findMany({
            where: {
                course: {
                    subjectId: subjectId
                },
                courseId: {
                    not: currentCourseId
                }
            },
            include: {
                course: {
                    include: {
                        instructor: true
                    }
                },
                questions: true,
                assessmentClos: {
                    include: { clo: true }
                }
            },
            orderBy: {
                course: { createdAt: 'desc' }
            }
        })
        return { success: true, assessments }
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message }
    }
}

export async function duplicateAssessment(assessmentId: string, targetCourseId: string) {
    try {
        const assessment = await prisma.assessment.findUnique({
            where: { id: assessmentId },
            include: {
                assessmentClos: true,
                questions: {
                    include: { options: true }
                }
            }
        })

        if (!assessment) return { success: false, error: 'Asesmen tidak ditemukan' }

        const result = await prisma.$transaction(async (tx: any) => {
            // 1. Create new Assessment
            const newAssessment = await tx.assessment.create({
                data: {
                    courseId: targetCourseId,
                    title: assessment.title + ' (Copy)',
                    description: assessment.description,
                    type: assessment.type,
                    format: assessment.format,
                    isPublished: false,
                    dueDate: assessment.dueDate,
                    maxScore: assessment.maxScore,
                    allowReview: assessment.allowReview,
                    timeLimit: assessment.timeLimit,
                }
            })

            // 2. Copy Assessment CLOs
            if (assessment.assessmentClos.length > 0) {
                await tx.assessmentCLO.createMany({
                    data: assessment.assessmentClos.map((clo: any) => ({
                        assessmentId: newAssessment.id,
                        cloId: clo.cloId,
                        weight: clo.weight
                    }))
                })
            }

            // 3. Copy Questions & Options
            for (const q of assessment.questions) {
                const newQ = await tx.assessmentQuestion.create({
                    data: {
                        assessmentId: newAssessment.id,
                        text: q.text,
                        type: q.type,
                        points: q.points,
                        cloId: q.cloId
                    }
                })

                if (q.options.length > 0) {
                    await tx.assessmentQuestionOption.createMany({
                        data: q.options.map((opt: any) => ({
                            questionId: newQ.id,
                            text: opt.text,
                            isCorrect: opt.isCorrect
                        }))
                    })
                }
            }

            return newAssessment
        })
        
        const { revalidatePath } = require('next/cache')
        revalidatePath(`/teacher/course/${targetCourseId}`)
        
        return { success: true, assessment: result }
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message }
    }
}

export async function getQuestionBankBySubject(subjectId: string) {
    try {
        const assessments = await prisma.assessment.findMany({
            where: {
                course: {
                    subjectId: subjectId
                }
            },
            select: { id: true }
        })
        const assessmentIds = assessments.map(a => a.id)

        if (assessmentIds.length === 0) return { success: true, questions: [] }

        const questions = await prisma.assessmentQuestion.findMany({
            where: {
                assessmentId: { in: assessmentIds }
            },
            include: {
                options: true,
                clo: true,
                assessment: {
                    include: {
                        course: {
                            include: { instructor: true }
                        }
                    }
                }
            },
        })

        // Remove exact text duplicates to make it cleaner
        const uniqueQuestions = []
        const seenTexts = new Set()
        for (const q of questions) {
            // Strip HTML tags for comparison or just use exact string
            if (!seenTexts.has(q.text)) {
                seenTexts.add(q.text)
                uniqueQuestions.push(q)
            }
        }

        return { success: true, questions: uniqueQuestions }
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message }
    }
}

export async function copyQuestionsToAssessment(questionIds: string[], targetAssessmentId: string) {
    try {
        await prisma.$transaction(async (tx: any) => {
            for (const id of questionIds) {
                const q = await tx.assessmentQuestion.findUnique({
                    where: { id },
                    include: { options: true }
                })
                if (!q) continue

                const newQ = await tx.assessmentQuestion.create({
                    data: {
                        assessmentId: targetAssessmentId,
                        text: q.text,
                        type: q.type,
                        points: q.points,
                        cloId: q.cloId
                    }
                })

                if (q.options.length > 0) {
                    await tx.assessmentQuestionOption.createMany({
                        data: q.options.map((opt: any) => ({
                            questionId: newQ.id,
                            text: opt.text,
                            isCorrect: opt.isCorrect
                        }))
                    })
                }
            }
        })
        
        return { success: true }
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message }
    }
}
