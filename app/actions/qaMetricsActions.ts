'use server'

import prisma from '@/lib/db'

export async function getDepartmentPloMetrics(departmentId: string, academicYear?: string, semester?: string) {
    try {
        const activeCurriculum = await prisma.curriculumYear.findFirst({
            where: { 
                departmentId,
                isActive: true 
            }
        });

        // Find subjects that are explicitly EXCLUDED from analytics in the active curriculum
        const excludedSubjects = activeCurriculum ? await prisma.curriculumSubject.findMany({
            where: {
                curriculumYearId: activeCurriculum.id,
                includeInAnalytics: false
            },
            select: { subjectId: true }
        }) : [];
        const excludedSubjectIds = excludedSubjects.map(es => es.subjectId);

        const plos = await prisma.programLearningOutcome.findMany({
            where: { 
                departmentId,
                ...(activeCurriculum ? { curriculumYearId: activeCurriculum.id } : {})
            },
            include: {
                clos: {
                    include: {
                        submissionScores: {
                            where: {
                                submission: {
                                    assessment: {
                                        course: {
                                            ...(academicYear && { academicYear }),
                                            ...(semester && { semester }),
                                            departmentId: departmentId,
                                            ...(excludedSubjectIds.length > 0 && {
                                                subjectId: { notIn: excludedSubjectIds }
                                            })
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        const metrics = plos.map(plo => {
            let totalScore = 0;
            let totalScoresCount = 0;

            plo.clos.forEach(clo => {
                clo.submissionScores.forEach(score => {
                    if (score.score !== null) {
                        totalScore += score.score;
                        totalScoresCount++;
                    }
                });
            });

            const average = totalScoresCount > 0 ? totalScore / totalScoresCount : null;
            let status = 'Belum Ada Data';
            if (average !== null) {
                if (average < 50) status = 'Kurang';
                else if (average >= 70) status = 'Tercapai';
                else status = 'Sedang';
            }

            return {
                id: plo.id,
                code: plo.code,
                description: plo.description,
                average: average !== null ? Number(average.toFixed(2)) : null,
                status
            };
        });

        return { success: true, metrics };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getCriticalSubjectsMetrics(departmentId: string, academicYear?: string, semester?: string) {
    try {
        const activeCurriculum = await prisma.curriculumYear.findFirst({
            where: { departmentId, isActive: true }
        });
        const excludedSubjects = activeCurriculum ? await prisma.curriculumSubject.findMany({
            where: { curriculumYearId: activeCurriculum.id, includeInAnalytics: false },
            select: { subjectId: true }
        }) : [];
        const excludedSubjectIds = excludedSubjects.map(es => es.subjectId);

        // Find courses in this department with their submission scores
        const courses = await prisma.course.findMany({
            where: {
                departmentId,
                ...(academicYear && { academicYear }),
                ...(semester && { semester }),
                ...(excludedSubjectIds.length > 0 && { subjectId: { notIn: excludedSubjectIds } })
            },
            include: {
                subject: true,
                instructor: true,
                assessments: {
                    include: {
                        submissions: {
                            include: { cloScores: true }
                        }
                    }
                }
            }
        });

        const subjectScores = new Map<string, { subjectName: string, subjectCode: string, instructorName: string, totalScore: number, count: number }>();

        courses.forEach(course => {
            const key = course.id; // Or course.subjectId if we want to group by master subject
            if (!subjectScores.has(key)) {
                subjectScores.set(key, {
                    subjectName: course.subject.title,
                    subjectCode: course.subject.code,
                    instructorName: course.instructor.name,
                    totalScore: 0,
                    count: 0
                });
            }

            const data = subjectScores.get(key)!;

            course.assessments.forEach(assessment => {
                assessment.submissions.forEach(submission => {
                    submission.cloScores.forEach(score => {
                        data.totalScore += score.score;
                        data.count++;
                    });
                });
            });
        });

        const metrics = Array.from(subjectScores.values())
            .map(data => ({
                ...data,
                average: data.count > 0 ? Number((data.totalScore / data.count).toFixed(2)) : null
            }))
            .filter(data => data.average !== null && data.average < 70)
            .sort((a, b) => (a.average || 0) - (b.average || 0))
            .slice(0, 5); // Top 5 lowest that are below 70

        return { success: true, metrics };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getComplianceMetrics(departmentId: string, academicYear?: string, semester?: string) {
    try {
        const activeCurriculum = await prisma.curriculumYear.findFirst({
            where: { departmentId, isActive: true }
        });
        const excludedSubjects = activeCurriculum ? await prisma.curriculumSubject.findMany({
            where: { curriculumYearId: activeCurriculum.id, includeInAnalytics: false },
            select: { subjectId: true }
        }) : [];
        const excludedSubjectIds = excludedSubjects.map(es => es.subjectId);

        const courses = await prisma.course.findMany({
            where: {
                departmentId,
                ...(academicYear && { academicYear }),
                ...(semester && { semester }),
                ...(excludedSubjectIds.length > 0 && { subjectId: { notIn: excludedSubjectIds } })
            },
            include: {
                subject: true,
                instructor: true,
                department: true,
                assessments: {
                    include: {
                        submissions: {
                            take: 1
                        }
                    }
                }
            }
        });

        const compliantList: any[] = [];
        const nonCompliantList: any[] = [];

        courses.forEach(course => {
            const isCompliant = course.assessments.some(assessment => assessment.submissions.length > 0);
            const courseData = {
                id: course.id,
                subjectCode: course.subject.code,
                subjectName: course.subject.title,
                instructorName: course.instructor.name,
                classCode: course.classCode || 'Reguler',
                departmentName: course.department?.name || 'Umum'
            };

            if (isCompliant) {
                compliantList.push(courseData);
            } else {
                nonCompliantList.push(courseData);
            }
        });

        const totalCourses = courses.length;
        const compliantCourses = compliantList.length;

        const rate = totalCourses > 0 ? Math.round((compliantCourses / totalCourses) * 100) : 0;

        return { 
            success: true, 
            rate, 
            totalCourses, 
            compliantCourses,
            details: {
                compliant: compliantList,
                nonCompliant: nonCompliantList
            }
        };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
