'use server'

import prisma from '@/lib/db'

// Helper function to get course IDs for a department
async function getDepartmentCourseIds(departmentId: string, curriculumYearId?: string) {
    const where: any = {}
    if (departmentId) {
        where.departmentId = departmentId
    }
    if (curriculumYearId) {
        where.curriculumYearId = curriculumYearId
    }
    
    // Also include subjects that belong to this department
    const courses = await prisma.course.findMany({
        where: {
            OR: [
                { departmentId: departmentId },
                { subject: { departmentId: departmentId } }
            ],
            ...(curriculumYearId ? { curriculumYearId } : {})
        },
        select: { id: true, subjectId: true }
    })
    
    // Filter out excluded subjects if curriculumYearId is provided
    let excludedSubjectIds: string[] = []
    if (curriculumYearId) {
        const excluded = await prisma.curriculumSubject.findMany({
            where: { curriculumYearId, includeInAnalytics: false },
            select: { subjectId: true }
        })
        excludedSubjectIds = excluded.map(e => e.subjectId)
    }

    const filteredCourseIds = courses
        .filter(c => !excludedSubjectIds.includes(c.subjectId))
        .map(c => c.id)

    return filteredCourseIds
}

export async function getDepartmentFeedbackStats(departmentId: string, curriculumYearId?: string) {
    try {
        const courseIds = await getDepartmentCourseIds(departmentId, curriculumYearId)
        
        if (courseIds.length === 0) {
            return { success: true, averageRating: 0, totalFeedback: 0 }
        }

        const feedbacks = await prisma.feedback.findMany({
            where: {
                targetType: 'course',
                targetId: { in: courseIds },
                rating: { not: null }
            },
            select: { rating: true }
        })

        const totalFeedback = feedbacks.length
        const totalRating = feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0)
        const averageRating = totalFeedback > 0 ? totalRating / totalFeedback : 0

        // Calculate rating distribution
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        feedbacks.forEach(f => {
            if (f.rating && f.rating >= 1 && f.rating <= 5) {
                distribution[f.rating as keyof typeof distribution]++
            }
        })

        return { success: true, averageRating, totalFeedback, distribution }
    } catch (error) {
        console.error('Error fetching feedback stats:', error)
        return { success: false, error: 'Gagal mengambil metrik umpan balik' }
    }
}

export async function getCourseFeedbackAggregates(departmentId: string, curriculumYearId?: string) {
    try {
        const courseIds = await getDepartmentCourseIds(departmentId, curriculumYearId)
        
        if (courseIds.length === 0) {
            return { success: true, courseAggregates: [] }
        }

        const feedbacks = await prisma.feedback.findMany({
            where: {
                targetType: 'course',
                targetId: { in: courseIds }
            },
            include: {
                // targetId is a course ID, but prisma schema doesn't have the relation directly.
                // We'll map it manually.
            }
        })

        // Fetch the corresponding courses to get their subject details
        const feedbackCourseIds = Array.from(new Set(feedbacks.map(f => f.targetId)))
        const courses = await prisma.course.findMany({
            where: { id: { in: feedbackCourseIds } },
            include: { subject: true }
        })

        const courseMap = new Map(courses.map(c => [c.id, c]))

        // Aggregate by Subject ID (Master Course)
        const subjectAggregates = new Map<string, { subject: any, totalRating: number, count: number }>()

        feedbacks.forEach(f => {
            if (!f.rating) return;
            
            const course = courseMap.get(f.targetId)
            if (!course) return;

            const subjectId = course.subjectId
            if (!subjectAggregates.has(subjectId)) {
                subjectAggregates.set(subjectId, {
                    subject: course.subject,
                    totalRating: 0,
                    count: 0
                })
            }

            const agg = subjectAggregates.get(subjectId)!
            agg.totalRating += f.rating
            agg.count++
        })

        const result = Array.from(subjectAggregates.values()).map(agg => ({
            subject: agg.subject,
            averageRating: agg.totalRating / agg.count,
            totalFeedback: agg.count
        }))

        // Sort by lowest rating first (critical)
        result.sort((a, b) => a.averageRating - b.averageRating)

        return { success: true, courseAggregates: result }
    } catch (error) {
        console.error('Error fetching course aggregates:', error)
        return { success: false, error: 'Gagal mengambil agregat mata kuliah' }
    }
}

export async function getDetailedFeedbackList(departmentId: string, curriculumYearId?: string, subjectId?: string) {
    try {
        let courseIds = await getDepartmentCourseIds(departmentId, curriculumYearId)
        
        if (subjectId) {
            // Further filter courseIds to only those belonging to this subject
            const subjectCourses = await prisma.course.findMany({
                where: { id: { in: courseIds }, subjectId },
                select: { id: true }
            })
            courseIds = subjectCourses.map(c => c.id)
        }

        if (courseIds.length === 0) {
            return { success: true, feedbacks: [] }
        }

        const rawFeedbacks = await prisma.feedback.findMany({
            where: {
                targetType: 'course',
                targetId: { in: courseIds }
            },
            include: {
                user: {
                    include: {
                        studentProfile: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        // Fetch courses to get subject details
        const feedbackCourseIds = Array.from(new Set(rawFeedbacks.map(f => f.targetId)))
        const courses = await prisma.course.findMany({
            where: { id: { in: feedbackCourseIds } },
            include: { subject: true }
        })
        const courseMap = new Map(courses.map(c => [c.id, c]))

        // Map and anonymize data based on user preference
        const feedbacks = rawFeedbacks.map(f => {
            const course = courseMap.get(f.targetId)
            
            // Masking name: Show first letter, mask the rest, keep last word if available
            // E.g. "Budi Santoso" -> "B*** S******"
            // For simplicity, just "Mahasiswa [Angkatan]" if preferred, but user said "anonim atau di blur"
            const name = f.user.name || 'Anonim'
            const blurredName = name.charAt(0) + '*****'

            return {
                id: f.id,
                rating: f.rating,
                content: f.content,
                createdAt: f.createdAt,
                subjectCode: course?.subject?.code || '-',
                subjectTitle: course?.subject?.title || 'Unknown Course',
                angkatan: f.user.studentProfile?.angkatan || '-',
                blurredName: blurredName
            }
        })

        return { success: true, feedbacks }
    } catch (error) {
        console.error('Error fetching detailed feedback:', error)
        return { success: false, error: 'Gagal mengambil rincian umpan balik' }
    }
}

// Check if a student has already submitted feedback for a course
export async function getMyCourseFeedback(userId: string, courseId: string) {
    try {
        const existing = await prisma.feedback.findFirst({
            where: {
                userId,
                targetId: courseId,
                targetType: 'course',
            }
        })
        return { success: true, feedback: existing }
    } catch (error) {
        return { success: false, feedback: null }
    }
}

// Submit feedback for a course from a student
export async function submitCourseFeedback(userId: string, courseId: string, rating: number, content: string) {
    try {
        if (rating < 1 || rating > 5) {
            return { success: false, error: 'Rating harus antara 1 dan 5' }
        }
        if (!content.trim()) {
            return { success: false, error: 'Komentar tidak boleh kosong' }
        }

        // Check if already submitted
        const existing = await prisma.feedback.findFirst({
            where: { userId, targetId: courseId, targetType: 'course' }
        })
        if (existing) {
            return { success: false, error: 'Anda sudah pernah memberikan umpan balik untuk mata kuliah ini.' }
        }

        await prisma.feedback.create({
            data: {
                userId,
                targetId: courseId,
                targetType: 'course',
                rating,
                content: content.trim(),
            }
        })

        return { success: true }
    } catch (error) {
        console.error('Error submitting feedback:', error)
        return { success: false, error: 'Gagal mengirim umpan balik. Coba lagi nanti.' }
    }
}
