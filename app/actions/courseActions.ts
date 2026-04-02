'use server'

import prisma from '@/lib/db'
import { revalidatePath } from 'next/cache'

// DOSEN ACTIONS
export async function getSubjects() {
    try {
        const subjects = await prisma.subject.findMany({
            orderBy: { title: 'asc' },
            include: {
                prodi: { include: { fakultas: true } },
                fakultas: true,
            }
        })
        return { success: true, subjects }
    } catch (error) {
        console.error("FAILED TO FETCH SUBJECTS:", error)
        return { success: false, error: "Failed to fetch subjects" }
    }
}

export async function createCourse(data: {
    subjectId: string;
    semester: string;
    academicYear: string;
    instructorId: string;
    isSrlEnabled?: boolean;
    isGamificationEnabled?: boolean;
    isForumEnabled?: boolean;
    isReflectionsEnabled?: boolean;
    isAnalyticsEnabled?: boolean;
}) {
    try {
        const course = await prisma.course.create({
            data: {
                subjectId: data.subjectId,
                semester: data.semester,
                academicYear: data.academicYear,
                instructorId: data.instructorId,
                config: {
                    create: {
                        isSrlEnabled: data.isSrlEnabled ?? true,
                        isGamificationEnabled: data.isGamificationEnabled ?? true,
                        isForumEnabled: data.isForumEnabled ?? true,
                        isReflectionsEnabled: data.isReflectionsEnabled ?? true,
                        isAnalyticsEnabled: data.isAnalyticsEnabled ?? true,
                    }
                }
            }
        })
        revalidatePath('/dosen')
        return { success: true, course }
    } catch (error) {
        console.error("Failed to create course", error)
        return { success: false, error: "Failed to create course" }
    }
}

export async function getInstructorCourses(instructorId: string) {
    try {
        const courses = await prisma.course.findMany({
            where: { instructorId },
            include: {
                subject: true,
                _count: {
                    select: { enrollments: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        })
        return { success: true, courses }
    } catch (error) {
        return { success: false, error: "Failed to fetch courses" }
    }
}

// MAHASISWA ACTIONS
export async function getStudentCourses(studentId: string) {
    try {
        const enrollments = await prisma.enrollment.findMany({
            where: { studentId },
            include: {
                course: {
                    include: {
                        subject: true,
                        instructor: { select: { id: true, name: true } },
                    }
                }
            },
        })
        return { success: true, enrollments }
    } catch (error) {
        return { success: false, error: "Failed to fetch student enrollments" }
    }
}

export async function enrollStudent(studentId: string, courseId: string) {
    try {
        const enrollment = await prisma.enrollment.create({
            data: {
                studentId,
                courseId
            }
        })
        revalidatePath('/mahasiswa')
        revalidatePath('/dosen')
        return { success: true, enrollment }
    } catch (error) {
        return { success: false, error: "Failed to enroll student" }
    }
}

export async function getAvailableCourses(studentId: string) {
    try {
        const courses = await prisma.course.findMany({
            where: {
                enrollments: {
                    none: {
                        studentId: studentId
                    }
                }
            },
            include: {
                subject: true,
                instructor: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                _count: {
                    select: { enrollments: true }
                }
            }
        })
        return { success: true, courses }
    } catch (error) {
        return { success: false, error: "Failed to fetch available courses" }
    }
}

// COURSE DETAILS & MODULES ACTIONS
export async function getCourseDetails(courseId: string) {
    try {
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            include: {
                subject: true,
                instructor: {
                    select: { id: true, name: true }
                },
                config: true,
                clos: true,
                modules: {
                    include: { clo: true },
                    orderBy: { weekNumber: 'asc' }
                },
                enrollments: {
                    include: { student: true }
                },
                _count: {
                    select: { enrollments: true, assessments: true }
                }
            }
        })
        if (!course) return { success: false, error: "Course not found" }
        return { success: true, course }
    } catch (error) {
        return { success: false, error: "Failed to fetch course details" }
    }
}

export async function createCourseModule(data: {
    courseId: string;
    title: string;
    content: string;
    weekNumber: number;
    cloId?: string;
}) {
    try {
        const payload: any = {
            courseId: data.courseId,
            title: data.title,
            content: data.content,
            weekNumber: data.weekNumber,
        }

        // Only link CLO if provided and not empty
        if (data.cloId && data.cloId !== "") {
            payload.cloId = data.cloId
        }

        const module = await prisma.courseModule.create({
            data: payload
        })
        revalidatePath(`/dosen/course/${data.courseId}`)
        return { success: true, module }
    } catch (error) {
        console.error("Failed to create course module", error)
        return { success: false, error: "Failed to create course module" }
    }
}

export async function deleteCourseModule(moduleId: string, courseId: string) {
    try {
        await prisma.courseModule.delete({
            where: { id: moduleId }
        })
        revalidatePath(`/dosen/course/${courseId}`)
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to delete module" }
    }
}

export async function updateCourseConfig(courseId: string, data: {
    isSrlEnabled: boolean;
    isGamificationEnabled: boolean;
    isForumEnabled: boolean;
    isReflectionsEnabled: boolean;
}) {
    try {
        // Upsert because it could potentially not exist for older seeded courses
        await prisma.courseConfig.upsert({
            where: { courseId },
            update: {
                isSrlEnabled: data.isSrlEnabled,
                isGamificationEnabled: data.isGamificationEnabled,
                isForumEnabled: data.isForumEnabled,
                isReflectionsEnabled: data.isReflectionsEnabled,
            },
            create: {
                courseId,
                isSrlEnabled: data.isSrlEnabled,
                isGamificationEnabled: data.isGamificationEnabled,
                isForumEnabled: data.isForumEnabled,
                isReflectionsEnabled: data.isReflectionsEnabled,
                isAnalyticsEnabled: true,
                difficulty: 'Basic'
            }
        })

        revalidatePath(`/dosen/course/${courseId}`)
        return { success: true }
    } catch (error) {
        console.error("Failed to update config", error)
        return { success: false, error: "Failed to update configuration" }
    }
}

export async function getStudentDashboardMetrics(studentId: string) {
    try {
        // 1. Fetch upcoming assessments (deadlines)
        const upcomingAssessments = await prisma.assessment.findMany({
            where: {
                course: { enrollments: { some: { studentId } } },
                dueDate: { gte: new Date() } // Future due dates
            },
            include: { course: true, assessmentClos: { include: { clo: true } } },
            orderBy: { dueDate: 'asc' },
            take: 3
        })

        // 2. Fetch SRL Metrics
        const enrollments = await prisma.enrollment.findMany({
            where: { studentId }
        })
        const srlTarget = enrollments.reduce((acc, curr) => acc + curr.srlTarget, 0)

        const reflections = await prisma.srlReflection.findMany({
            where: {
                enrollment: { studentId },
                targetMet: true
            }
        })
        const srlAchieved = reflections.length

        // 3. Calculate Study Time (from ActivityLog VIEW_MATERIAL details JSON)
        const activityLogs = await prisma.activityLog.findMany({
            where: { userId: studentId, action: 'VIEW_MATERIAL' }
        })
        let totalSeconds = 0;
        activityLogs.forEach(log => {
            if (log.details) {
                try {
                    const parsed = JSON.parse(log.details)
                    if (parsed.timeSpentSeconds) {
                        totalSeconds += parsed.timeSpentSeconds
                    }
                } catch (e) { }
            }
        })
        const studyTimeHours = Math.round(totalSeconds / 3600)

        // 4. recent activity check (last 5 days)
        const fiveDaysAgo = new Date();
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
        const recentLogsCount = await prisma.activityLog.count({
            where: {
                userId: studentId,
                timestamp: { gte: fiveDaysAgo }
            }
        })

        let activityLevel = 'Rendah'
        if (recentLogsCount > 10) activityLevel = 'Tinggi'
        else if (recentLogsCount > 3) activityLevel = 'Sedang'

        // 5. Progress Materi (simplification: completed courses / enrolled courses)
        const completedEnrollments = await prisma.enrollment.count({
            where: { studentId, status: 'completed' }
        })
        const totalEnroll = enrollments.length;
        const progressMateri = totalEnroll > 0 ? Math.round((completedEnrollments / totalEnroll) * 100) + "%" : "0%"

        return {
            success: true,
            srlTarget: srlTarget || 10, // fallback if zero
            srlAchieved,
            studyTimeHours,
            activityLevel,
            progressMateri,
            upcomingAssessments,
            totalEnroll
        }
    } catch (error) {
        console.error("Failed to fetch dashboard metrics", error)
        return { success: false, error: "Failed to fetch metrics" }
    }
}

export async function getInstructorDashboardMetrics(instructorId: string) {
    try {
        // 1. Fetch courses owned by this instructor
        const courses = await prisma.course.findMany({
            where: { instructorId },
            include: {
                _count: { select: { enrollments: true } },
                assessments: {
                    include: {
                        submissions: true
                    }
                }
            }
        })

        const totalCourses = courses.length;

        // Count unique students enrolled in any of this instructor's courses
        const uniqueStudents = await prisma.enrollment.findMany({
            where: { courseId: { in: courses.map(c => c.id) } },
            select: { studentId: true },
            distinct: ['studentId']
        });
        const totalStudents = uniqueStudents.length;

        // 2. Calculate Unassessed submissions
        let unassessedCount = 0;
        let totalAssessments = 0;
        courses.forEach(course => {
            course.assessments.forEach(ass => {
                totalAssessments++;
                ass.submissions.forEach(sub => {
                    if (sub.score === null || sub.score === undefined) {
                        unassessedCount++;
                    }
                })
            })
        });

        // 3. Average OBL Achieved (Dummy simplified logic based on completed enrollments or scores)
        // For simplicity, let's just use average score if available, else 0.
        let totalScores = 0;
        let scoreCount = 0;
        courses.forEach(course => {
            course.assessments.forEach(ass => {
                ass.submissions.forEach(sub => {
                    if (sub.score !== null && sub.score !== undefined) {
                        totalScores += sub.score
                        scoreCount++;
                    }
                })
            })
        });
        const averageOBL = scoreCount > 0 ? Math.round(totalScores / scoreCount) : 0;

        // 4. At-risk students (Students with < 50 average score, or no activity)
        // We will fetch submissions from all students in these courses
        const allStudentsInCourses = await prisma.enrollment.findMany({
            where: { courseId: { in: courses.map(c => c.id) } },
            include: { student: true, course: true }
        })

        const studentPerformances = new Map<string, { student: any, course: any, totalScore: number, subCount: number }>();

        allStudentsInCourses.forEach(enroll => {
            studentPerformances.set(enroll.id, { student: enroll.student, course: enroll.course, totalScore: 0, subCount: 0 })
        })

        const allSubmissions = await prisma.submission.findMany({
            where: {
                assessment: { courseId: { in: courses.map(c => c.id) } }
            },
            include: { assessment: true }
        })

        allSubmissions.forEach(sub => {
            const enroll = allStudentsInCourses.find(e => e.studentId === sub.studentId && e.courseId === sub.assessment.courseId)
            if (enroll && enroll.id && studentPerformances.has(enroll.id)) {
                const perf = studentPerformances.get(enroll.id)!;
                if (sub.score !== null) {
                    perf.totalScore += sub.score;
                    perf.subCount++;
                }
            }
        })

        const atRiskStudents: any[] = [];
        studentPerformances.forEach((perf) => {
            const avg = perf.subCount > 0 ? perf.totalScore / perf.subCount : 0;
            // consider at risk if they have no submissions yet but there are assessments, or average < 50
            // simplification: just average < 50 and they submitted something, OR they submitted nothing.
            if ((perf.subCount > 0 && avg < 60) || perf.subCount === 0) {
                atRiskStudents.push({
                    studentName: perf.student.name,
                    courseName: perf.course.title,
                    reason: perf.subCount === 0 ? "Belum ada nilai tugas" : `Nilai rata-rata rendah (${Math.round(avg)})`
                });
            }
        });

        // Limit to 3 for UI
        const limitedAtRisk = atRiskStudents.slice(0, 3)

        return {
            success: true,
            metrics: {
                totalCourses,
                totalStudents,
                unassessedCount,
                totalAssessments,
                averageOBL,
                atRiskStudents: limitedAtRisk
            }
        }
    } catch (error) {
        console.error("Failed to fetch instructor dashboard metrics", error)
        return { success: false, error: "Failed to fetch metrics" }
    }
}
