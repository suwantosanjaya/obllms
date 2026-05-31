'use server'

import prisma from '@/lib/db'

export async function getCourseStudentAnalytics(courseId: string) {
    try {
        // 1. Get total published assessments for this course
        const totalAssessments = await prisma.assessment.count({
            where: {
                courseId: courseId,
                isPublished: true
            }
        })

        // 2. Get all active enrollments for this course
        const enrollments = await prisma.enrollment.findMany({
            where: {
                courseId: courseId,
                status: 'active'
            },
            include: {
                student: {
                    select: {
                        id: true,
                        name: true,
                        studentProfile: {
                            select: {
                                nim: true
                            }
                        }
                    }
                }
            }
        })

        if (enrollments.length === 0) {
            return { success: true, students: [], totalAssessments }
        }

        const studentIds = enrollments.map(e => e.student.id)

        // 3. Get all submissions for these students in this course's assessments
        const submissions = await prisma.submission.findMany({
            where: {
                studentId: { in: studentIds },
                assessment: {
                    courseId: courseId,
                    isPublished: true
                }
            },
            select: {
                studentId: true,
                score: true
            }
        })

        // 4. Aggregate data per student
        const studentAnalytics = enrollments.map(enrollment => {
            const studentId = enrollment.student.id
            const studentSubmissions = submissions.filter(s => s.studentId === studentId)
            
            const submittedCount = studentSubmissions.length
            
            // Calculate average score. Treat missing submissions as 0 if they should have been submitted?
            // For now, we calculate average based on what they HAVE submitted, 
            // OR we can calculate based on total assessments. Let's do average of submitted for now, 
            // but if submitted is 0, average is 0.
            let totalScore = 0;
            let scoredCount = 0;
            
            studentSubmissions.forEach(sub => {
                if (sub.score !== null && sub.score !== undefined) {
                    totalScore += sub.score;
                    scoredCount++;
                }
            });

            const averageScore = scoredCount > 0 ? (totalScore / scoredCount) : 0;
            const progress = totalAssessments > 0 ? (submittedCount / totalAssessments) * 100 : 0;

            return {
                id: studentId,
                name: enrollment.student.name,
                nim: enrollment.student.studentProfile?.nim || '-',
                submittedCount,
                totalAssessments,
                progress,
                averageScore,
            }
        })

        // Sort by name
        studentAnalytics.sort((a, b) => a.name.localeCompare(b.name))

        return { 
            success: true, 
            students: studentAnalytics, 
            totalAssessments 
        }

    } catch (error: any) {
        console.error('[getCourseStudentAnalytics error]', error)
        return { success: false, error: error.message }
    }
}
