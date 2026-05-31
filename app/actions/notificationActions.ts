'use server'

import prisma from '@/lib/db'

export type NotificationItem = {
    id: string
    type: 'assignment' | 'forum' | 'risk' | 'announcement'
    title: string
    message: string
    date: Date
    href: string
    isNew?: boolean
}

export async function getStudentNotifications(studentId: string, departmentId: string | null) {
    try {
        const notifications: NotificationItem[] = []
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        // 1. Get Enrollments
        const enrollments = await prisma.enrollment.findMany({
            where: { studentId },
            include: { course: true }
        })
        const courseIds = enrollments.map(e => e.courseId)

        // 2. Pending / New Assignments
        const assessments = await prisma.assessment.findMany({
            where: {
                courseId: { in: courseIds },
                isPublished: true,
            },
            include: {
                course: { include: { subject: true } },
                submissions: { where: { studentId } }
            }
        })

        assessments.forEach(a => {
            const hasSubmission = a.submissions.length > 0
            if (!hasSubmission) {
                const isNew = a.dueDate ? new Date(a.dueDate) >= sevenDaysAgo : false
                notifications.push({
                    id: `ass-${a.id}`,
                    type: 'assignment',
                    title: isNew ? 'Tugas Baru' : 'Tugas Belum Dikerjakan',
                    message: `${a.course.subject.title}: ${a.title}`,
                    date: a.dueDate || new Date(),
                    href: `/student/course/${a.courseId}/assessment/${a.id}/take`,
                    isNew
                })
            } else {
                // 3. At-Risk Scores (< 60)
                const sub = a.submissions[0]
                if (sub.score !== null && sub.score < 60) {
                    notifications.push({
                        id: `risk-${a.id}`,
                        type: 'risk',
                        title: 'Nilai Berisiko',
                        message: `Anda mendapat nilai ${sub.score} pada ${a.title} (${a.course.subject.title})`,
                        date: sub.submittedAt,
                        href: `/student/course/${a.courseId}`,
                    })
                }
            }
        })

        // 4. Forum Threads (Last 7 Days)
        const threads = await prisma.forumThread.findMany({
            where: {
                courseId: { in: courseIds },
                createdAt: { gte: sevenDaysAgo }
            },
            include: {
                course: { include: { subject: true } },
                author: true
            }
        })

        threads.forEach(t => {
            // Don't notify if the student themselves created it
            if (t.authorId !== studentId) {
                notifications.push({
                    id: `forum-${t.id}`,
                    type: 'forum',
                    title: 'Diskusi Baru',
                    message: `${t.author.name} memulai diskusi di ${t.course.subject.title}`,
                    date: t.createdAt,
                    href: `/student/course/${t.courseId}` // Usually handled in tabs on course page
                })
            }
        })

        // 5. Announcements (Last 7 Days)
        const announcements = await prisma.announcement.findMany({
            where: {
                isActive: true,
                createdAt: { gte: sevenDaysAgo },
                OR: [
                    { scope: 'global' },
                    { departmentId: departmentId || undefined }
                ]
            }
        })

        announcements.forEach(ann => {
            notifications.push({
                id: `ann-${ann.id}`,
                type: 'announcement',
                title: `Pengumuman: ${ann.tag}`,
                message: ann.title,
                date: ann.createdAt,
                href: '/student/community'
            })
        })

        // Sort by date descending
        notifications.sort((a, b) => b.date.getTime() - a.date.getTime())

        return { success: true, notifications }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}
