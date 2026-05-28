'use server'

import prisma from '@/lib/db'
import { revalidatePath } from 'next/cache'

// DOSEN ACTIONS
export async function getSubjects(departmentId?: string | null) {
    try {
        const whereClause = departmentId ? {
            OR: [
                { departmentId: departmentId },
                { scope: 'universitas' }
            ]
        } : {}

        const subjects = await prisma.subject.findMany({
            where: whereClause,
            orderBy: { title: 'asc' },
            include: {
                department: { include: { faculty: true } },
                faculty: true,
            }
        })
        return { success: true, subjects }
    } catch (error) {
        console.error("FAILED TO FETCH SUBJECTS:", error)
        return { success: false, error: "Failed to fetch subjects" }
    }
}

export async function getSubjectsByCurriculum(departmentId: string, curriculumYearId: string) {
    try {
        const subjects = await prisma.subject.findMany({
            where: {
                subjectClos: {
                    some: {
                        clo: {
                            curriculumYearId: curriculumYearId
                        }
                    }
                },
                OR: [
                    { departmentId: departmentId },
                    { scope: 'universitas' }
                ]
            },
            orderBy: { code: 'asc' },
            include: {
                department: { include: { faculty: true } },
                faculty: true,
            }
        })
        return { success: true, subjects }
    } catch (error) {
        console.error("FAILED TO FETCH SUBJECTS BY CURRICULUM:", error)
        return { success: false, error: "Failed to fetch subjects by curriculum" }
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
    schedule?: string;
    classCode?: string;
    departmentId?: string | null;
    curriculumYearId?: string | null;
}) {
    try {
        const course = await prisma.course.create({
            data: {
                subjectId: data.subjectId,
                semester: data.semester,
                academicYear: data.academicYear,
                classCode: data.classCode || "Kelas Reguler",
                instructorId: data.instructorId,
                schedule: data.schedule,
                departmentId: data.departmentId,
                curriculumYearId: data.curriculumYearId,
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
        revalidatePath('/teacher')
        revalidatePath('/qa/schedules')
        revalidatePath('/qa')
        return { success: true, course }
    } catch (error: any) {
        console.error("Failed to create course", error)
        return { success: false, error: error.message || "Failed to create course" }
    }
}

export async function deleteCourse(courseId: string) {
    try {
        await prisma.course.delete({
            where: { id: courseId }
        })
        revalidatePath('/teacher')
        revalidatePath('/qa/schedules')
        revalidatePath('/qa')
        return { success: true }
    } catch (error: any) {
        console.error("Failed to delete course", error)
        return { success: false, error: "Gagal menghapus kelas. Pastikan kelas ini belum memiliki mahasiswa yang terdaftar." }
    }
}

export async function updateCourseSchedule(courseId: string, schedule: string) {
    try {
        const course = await prisma.course.update({
            where: { id: courseId },
            data: { schedule }
        })
        revalidatePath('/qa')
        revalidatePath('/teacher/courses')
        return { success: true, course }
    } catch (error) {
        console.error("Failed to update course schedule", error)
        return { success: false, error: "Failed to update schedule" }
    }
}

export async function updateCourseDetails(courseId: string, data: {
    subjectId: string;
    semester: string;
    academicYear: string;
    instructorId: string;
    classCode: string;
    schedule: string;
    curriculumYearId: string | null;
}) {
    try {
        const course = await prisma.course.update({
            where: { id: courseId },
            data: {
                subjectId: data.subjectId,
                semester: data.semester,
                academicYear: data.academicYear,
                instructorId: data.instructorId,
                classCode: data.classCode,
                schedule: data.schedule,
                curriculumYearId: data.curriculumYearId
            },
            include: {
                subject: true,
                instructor: true,
                curriculumYear: true,
                _count: {
                    select: { enrollments: true }
                }
            }
        })
        revalidatePath('/qa/schedules')
        revalidatePath('/qa')
        revalidatePath('/teacher/courses')
        return { success: true, course }
    } catch (error: any) {
        console.error("Failed to update course details", error)
        return { success: false, error: error.message || "Failed to update course" }
    }
}

export async function getInstructorCourses(instructorId: string, activeProdiId?: string | null) {
    try {
        const whereClause: any = { instructorId }
        if (activeProdiId) {
            whereClause.departmentId = activeProdiId
        }
        
        const courses = await prisma.course.findMany({
            where: whereClause,
            include: {
                subject: true,
                config: true,
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
export async function getStudentCourses(studentId: string, activeProdiId?: string | null) {
    try {
        const whereClause: any = { studentId }
        if (activeProdiId) {
            whereClause.course = {
                departmentId: activeProdiId
            }
        }
        const enrollments = await prisma.enrollment.findMany({
            where: whereClause,
            include: {
                course: {
                    include: {
                        subject: true,
                        config: true,
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
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            include: { config: true }
        })
        
        if (!course) return { success: false, error: "Kelas tidak ditemukan" }
        if (!course.config?.isPublished) return { success: false, error: "Kelas belum dipublikasi" }
        
        if (course.config?.enrollmentDeadline && new Date() > course.config.enrollmentDeadline) {
            return { success: false, error: "Batas akhir pendaftaran untuk kelas ini telah berlalu." }
        }

        const enrollment = await prisma.enrollment.create({
            data: {
                studentId,
                courseId
            }
        })
        revalidatePath('/student')
        revalidatePath('/teacher')
        return { success: true, enrollment }
    } catch (error) {
        return { success: false, error: "Failed to enroll student" }
    }
}

export async function unenrollStudent(studentId: string, courseId: string) {
    try {
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            include: { config: true }
        })
        
        if (!course) return { success: false, error: "Kelas tidak ditemukan" }
        
        if (course.config?.enrollmentDeadline && new Date() > course.config.enrollmentDeadline) {
            return { success: false, error: "Batas akhir pembatalan pendaftaran telah berlalu." }
        }

        await prisma.enrollment.deleteMany({
            where: {
                studentId,
                courseId
            }
        })
        
        revalidatePath('/student')
        revalidatePath('/teacher')
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to unenroll student" }
    }
}

export async function removeStudentFromCourse(studentId: string, courseId: string) {
    try {
        await prisma.enrollment.deleteMany({
            where: {
                studentId,
                courseId
            }
        })
        
        revalidatePath('/teacher')
        revalidatePath(`/teacher/course/${courseId}`)
        return { success: true }
    } catch (error) {
        console.error("Failed to remove student from course:", error)
        return { success: false, error: "Gagal mengeluarkan mahasiswa dari kelas" }
    }
}

export async function getAvailableCourses(studentId: string, activeProdiId?: string | null) {
    try {
        const whereClause: any = {
            enrollments: {
                none: {
                    studentId: studentId
                }
            },
            config: {
                isPublished: true
            }
        }
        if (activeProdiId) {
            whereClause.departmentId = activeProdiId
        }
        
        const courses = await prisma.course.findMany({
            where: whereClause,
            include: {
                subject: true,
                config: true,
                instructor: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                config: true,
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
                subject: { include: { subjectClos: { include: { clo: true } } } },
                instructor: {
                    select: { id: true, name: true }
                },
                config: true,
                modules: {
                    include: {
                        clo: true,
                        moduleClos: { include: { clo: true } }
                    },
                    orderBy: { weekNumber: 'asc' }
                },
                enrollments: {
                    include: {
                        student: {
                            include: {
                                studentProfile: {
                                    select: { nim: true }
                                }
                            }
                        }
                    }
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
    cloIds?: string[]; // Multiple CLO IDs
}) {
    try {
        if (!data.cloIds || data.cloIds.length === 0) {
            return { success: false, error: "Harap pilih minimal satu CLO untuk topik ini." }
        }

        const module = await prisma.courseModule.create({
            data: {
                courseId: data.courseId,
                title: data.title,
                content: data.content,
                weekNumber: data.weekNumber,
                moduleClos: {
                    create: data.cloIds.map(cloId => ({ cloId }))
                }
            }
        })
        revalidatePath(`/teacher/course/${data.courseId}`)
        return { success: true, module }
    } catch (error) {
        console.error("Failed to create course module", error)
        return { success: false, error: "Failed to create course module" }
    }
}

export async function updateCourseModule(data: {
    moduleId: string;
    courseId: string;
    title: string;
    content: string;
    weekNumber: number;
    cloIds: string[];
}) {
    try {
        if (!data.cloIds || data.cloIds.length === 0) {
            return { success: false, error: "Harap pilih minimal satu CLO untuk topik ini." }
        }

        // Delete existing CLO mappings then recreate
        await prisma.courseModuleCLO.deleteMany({ where: { moduleId: data.moduleId } })

        await prisma.courseModule.update({
            where: { id: data.moduleId },
            data: {
                title: data.title,
                content: data.content,
                weekNumber: data.weekNumber,
                moduleClos: {
                    create: data.cloIds.map(cloId => ({ cloId }))
                }
            }
        })
        revalidatePath(`/teacher/course/${data.courseId}`)
        return { success: true }
    } catch (error) {
        console.error("Failed to update course module", error)
        return { success: false, error: "Gagal memperbarui modul" }
    }
}

export async function deleteCourseModule(moduleId: string, courseId: string) {
    try {
        await prisma.courseModule.delete({
            where: { id: moduleId }
        })
        revalidatePath(`/teacher/course/${courseId}`)
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
    isPublished?: boolean;
    enrollmentDeadline?: Date | null;
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
                ...(data.isPublished !== undefined && { isPublished: data.isPublished }),
                ...(data.enrollmentDeadline !== undefined && { enrollmentDeadline: data.enrollmentDeadline }),
            },
            create: {
                courseId,
                isSrlEnabled: data.isSrlEnabled,
                isGamificationEnabled: data.isGamificationEnabled,
                isForumEnabled: data.isForumEnabled,
                isReflectionsEnabled: data.isReflectionsEnabled,
                isPublished: data.isPublished ?? false,
                enrollmentDeadline: data.enrollmentDeadline ?? null,
                isAnalyticsEnabled: true,
                difficulty: 'Basic'
            }
        })

        revalidatePath(`/teacher/course/${courseId}`)
        return { success: true }
    } catch (error) {
        console.error("Failed to update config", error)
        return { success: false, error: "Failed to update configuration" }
    }
}

export async function getStudentDashboardMetrics(studentId: string, activeProdiId?: string | null) {
    try {
        const courseFilter = activeProdiId ? {
            subject: {
                OR: [
                    { departmentId: activeProdiId },
                    { scope: 'universitas' }
                ]
            }
        } : {}

        // 1. Fetch upcoming assessments (deadlines)
        const upcomingAssessments = await prisma.assessment.findMany({
            where: {
                course: { 
                    ...courseFilter,
                    enrollments: { some: { studentId } } 
                },
                dueDate: { gte: new Date() } // Future due dates
            },
            include: { course: true, assessmentClos: { include: { clo: true } } },
            orderBy: { dueDate: 'asc' },
            take: 3
        })

        // 2. Fetch SRL Metrics
        const enrollments = await prisma.enrollment.findMany({
            where: { 
                studentId,
                ...(activeProdiId ? { course: courseFilter } : {})
            }
        })
        const srlTarget = enrollments.reduce((acc, curr) => acc + curr.srlTarget, 0)

        const reflections = await prisma.srlReflection.findMany({
            where: {
                enrollment: { 
                    studentId,
                    ...(activeProdiId ? { course: courseFilter } : {})
                },
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
            where: { 
                studentId, 
                status: 'completed',
                ...(activeProdiId ? { course: courseFilter } : {})
            }
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

export async function getInstructorDashboardMetrics(instructorId: string, activeProdiId?: string | null) {
    try {
        const courseFilter = activeProdiId ? {
            subject: {
                OR: [
                    { departmentId: activeProdiId },
                    { scope: 'universitas' }
                ]
            }
        } : {}

        // 1. Fetch courses owned by this instructor
        const courses = await prisma.course.findMany({
            where: { 
                instructorId,
                ...courseFilter
            },
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
