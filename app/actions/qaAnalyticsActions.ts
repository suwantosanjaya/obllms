'use server'

import prisma from '@/lib/db'

export async function getDepartmentCloAnalytics(departmentId: string, angkatanFilter?: number, curriculumYearId?: string) {
    try {
        const cloWhere: any = { departmentId }
        if (curriculumYearId) {
            cloWhere.curriculumYearId = curriculumYearId
        }

        // Find all CLOs for this department (and curriculum if provided)
        const clos = await prisma.courseLearningOutcome.findMany({
            where: cloWhere,
            include: {
                plos: true // Include mapped PLOs
            },
            orderBy: { code: 'asc' }
        })

        // Find all PLOs for this curriculum
        const plos = await prisma.programLearningOutcome.findMany({
            where: curriculumYearId ? { curriculumYearId, departmentId } : { departmentId },
            orderBy: { code: 'asc' }
        })

        const excludedSubjects = curriculumYearId ? await prisma.curriculumSubject.findMany({
            where: { curriculumYearId, includeInAnalytics: false },
            select: { subjectId: true }
        }) : [];
        const excludedSubjectIds = excludedSubjects.map(es => es.subjectId);

        // Prepare the scores query where clause
        const scoresWhere: any = {
            cloId: { in: clos.map(c => c.id) }
        }

        const submissionFilter: any = {};
        let useSubmissionFilter = false;

        if (angkatanFilter) {
            submissionFilter.student = {
                studentProfile: {
                    angkatan: angkatanFilter
                }
            };
            useSubmissionFilter = true;
        }

        if (excludedSubjectIds.length > 0) {
            submissionFilter.assessment = {
                course: {
                    subjectId: { notIn: excludedSubjectIds }
                }
            };
            useSubmissionFilter = true;
        }

        if (useSubmissionFilter) {
            scoresWhere.submission = submissionFilter;
        }

        // Find all submission scores for these CLOs
        const scores = await prisma.submissionCLOScore.findMany({
            where: scoresWhere,
            include: {
                submission: {
                    include: { student: { include: { studentProfile: true } } }
                }
            }
        })
        
        // Find unique student IDs from the scores
        const uniqueStudentIds = new Set(scores.map(s => s.submission.studentId))

        // Aggregate by CLO
        const cloAggregates = clos.map(clo => {
            const cloScores = scores.filter(s => s.cloId === clo.id && s.score !== null)
            const totalScore = cloScores.reduce((sum, s) => sum + s.score, 0)
            const average = cloScores.length > 0 ? totalScore / cloScores.length : null
            return {
                ...clo,
                average,
                studentCount: new Set(cloScores.map(s => s.submission.studentId)).size,
                submissionCount: cloScores.length
            }
        })

        // Aggregate detailed CLO profiles by Angkatan
        const angkatanMap = new Map<number, Map<string, { count: number, totalScore: number, studentIds: Set<string> }>>()
        scores.forEach(s => {
            const angkatan = s.submission.student.studentProfile?.angkatan
            const cloId = s.cloId
            if (angkatan && cloId && s.score !== null) {
                if (!angkatanMap.has(angkatan)) {
                    angkatanMap.set(angkatan, new Map<string, { count: number, totalScore: number, studentIds: Set<string> }>())
                }
                const cloMap = angkatanMap.get(angkatan)!
                if (!cloMap.has(cloId)) {
                    cloMap.set(cloId, { count: 0, totalScore: 0, studentIds: new Set<string>() })
                }
                const data = cloMap.get(cloId)!
                data.count++
                data.totalScore += s.score
                data.studentIds.add(s.submission.studentId)
            }
        })

        const angkatanProfiles = Array.from(angkatanMap.entries()).map(([angkatan, cloMap]) => {
            const closResult = clos.map(cloDef => {
                const data = cloMap.get(cloDef.id)
                return {
                    id: cloDef.id,
                    code: cloDef.code,
                    description: cloDef.description,
                    average: data ? (data.totalScore / data.count) : null,
                    count: data ? data.count : 0,
                    studentCount: data ? data.studentIds.size : 0,
                    plos: cloDef.plos.map(p => p.id)
                }
            }).sort((a, b) => a.code.localeCompare(b.code))

            // Aggregate PLO scores
            const plosResult = plos.map(ploDef => {
                // Find all CLOs in this angkatan that map to this PLO and have a valid average
                const mappedClos = closResult.filter(c => c.plos.includes(ploDef.id) && c.average !== null)
                const totalPloScore = mappedClos.reduce((sum, c) => sum + (c.average as number), 0)
                const average = mappedClos.length > 0 ? (totalPloScore / mappedClos.length) : null
                
                return {
                    id: ploDef.id,
                    code: ploDef.code,
                    description: ploDef.description,
                    average,
                    cloCount: mappedClos.length,
                    mappedClos: closResult.filter(c => c.plos.includes(ploDef.id)) // include all, even nulls for breakdown
                }
            })

            return { angkatan, clos: closResult, plos: plosResult }
        }).sort((a, b) => b.angkatan - a.angkatan)

        return { success: true, clos: cloAggregates, angkatanProfiles, studentCount: uniqueStudentIds.size }
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message }
    }
}

export async function getAvailableAngkatan(departmentId: string) {
    try {
        const clos = await prisma.courseLearningOutcome.findMany({
            where: { departmentId },
            select: { id: true }
        })

        const cloIds = clos.map(c => c.id)

        const excludedSubjects = await prisma.curriculumSubject.findMany({
            where: { includeInAnalytics: false },
            select: { subjectId: true }
        })
        const excludedSubjectIds = excludedSubjects.map(es => es.subjectId)

        const scoresWhere: any = {
            cloId: { in: cloIds }
        }

        if (excludedSubjectIds.length > 0) {
            scoresWhere.submission = {
                assessment: {
                    course: {
                        subjectId: { notIn: excludedSubjectIds }
                    }
                }
            }
        }

        const scores = await prisma.submissionCLOScore.findMany({
            where: scoresWhere,
            include: {
                submission: {
                    include: {
                        student: {
                            include: { studentProfile: true }
                        }
                    }
                }
            }
        })

        const angkatanSet = new Set<number>()
        scores.forEach(s => {
            if (s.submission.student.studentProfile?.angkatan) {
                angkatanSet.add(s.submission.student.studentProfile.angkatan)
            }
        })

        const angkatanList = Array.from(angkatanSet).sort((a, b) => b - a)
        return { success: true, angkatan: angkatanList }
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message }
    }
}

export async function getStudentCloAnalytics(studentId: string, curriculumYearId?: string) {
    try {
        // Find the student's department
        const student = await prisma.user.findUnique({
            where: { id: studentId },
            include: { 
                studentProfile: true,
                homebaseDepartment: {
                    include: {
                        activeHead: true,
                        faculty: {
                            include: { 
                                activeDean: {
                                    include: { teacherProfile: true }
                                },
                                university: {
                                    include: { activeRector: true }
                                } 
                            }
                        }
                    }
                }
            }
        })

        if (!student) throw new Error("Student not found")

        // First, let's find all CLOs in the requested curriculum (or just all CLOs if not specified)
        // If not specified, we might want to just get CLOs that the student has scores for, 
        // OR get all CLOs for their department. Standard OBE would be for their curriculum.
        // Let's assume curriculum is passed or we just fetch based on their department's active curriculum.
        
        let targetCurriculumId = curriculumYearId
        if (!targetCurriculumId) {
            const activeCurriculum = await prisma.curriculumYear.findFirst({
                where: { departmentId: student.homebaseDepartmentId || '', isActive: true }
            })
            if (activeCurriculum) targetCurriculumId = activeCurriculum.id
        }

        const cloWhere: any = { departmentId: student.homebaseDepartmentId }
        if (targetCurriculumId) cloWhere.curriculumYearId = targetCurriculumId

        const clos = await prisma.courseLearningOutcome.findMany({
            where: cloWhere,
            include: { plos: true },
            orderBy: { code: 'asc' }
        })

        const plos = await prisma.programLearningOutcome.findMany({
            where: targetCurriculumId ? { curriculumYearId: targetCurriculumId } : { departmentId: student.homebaseDepartmentId || '' },
            orderBy: { code: 'asc' }
        })

        const excludedSubjects = targetCurriculumId ? await prisma.curriculumSubject.findMany({
            where: { curriculumYearId: targetCurriculumId, includeInAnalytics: false },
            select: { subjectId: true }
        }) : []
        const excludedSubjectIds = excludedSubjects.map(es => es.subjectId)

        const scoresWhere: any = {
            submission: { studentId },
            cloId: { in: clos.map(c => c.id) }
        }

        if (excludedSubjectIds.length > 0) {
            scoresWhere.submission = {
                studentId,
                assessment: {
                    course: {
                        subjectId: { notIn: excludedSubjectIds }
                    }
                }
            }
        }

        // Find student scores
        const scores = await prisma.submissionCLOScore.findMany({
            where: scoresWhere
        })

        // Map scores to CLOs
        const closResult = clos.map(cloDef => {
            const cloScores = scores.filter(s => s.cloId === cloDef.id)
            const totalScore = cloScores.reduce((sum, s) => sum + (s.score as number), 0)
            const average = cloScores.length > 0 ? totalScore / cloScores.length : null
            
            return {
                id: cloDef.id,
                code: cloDef.code,
                description: cloDef.description,
                average,
                scoreCount: cloScores.length,
                plos: cloDef.plos.map(p => p.id)
            }
        })

        // Aggregate PLO scores
        const plosResult = plos.map(ploDef => {
            const mappedClos = closResult.filter(c => c.plos.includes(ploDef.id) && c.average !== null)
            const totalPloScore = mappedClos.reduce((sum, c) => sum + (c.average as number), 0)
            const average = mappedClos.length > 0 ? totalPloScore / mappedClos.length : null
            
            return {
                id: ploDef.id,
                code: ploDef.code,
                description: ploDef.description,
                average,
                cloCount: mappedClos.length,
                mappedClos: closResult.filter(c => c.plos.includes(ploDef.id))
            }
        })

        // Fetch SCL Skill Assessments
        const enrollmentsWithScl = await prisma.enrollment.findMany({
            where: {
                studentId,
                skillAssessment: { isNot: null }
            },
            include: {
                skillAssessment: true,
                course: {
                    include: { 
                        subject: true,
                        curriculumYear: {
                            include: {
                                curriculumSubjects: true
                            }
                        }
                    }
                }
            }
        })

        const sclAssessments = enrollmentsWithScl.map(e => {
            const subj = e.course.subject;
            const curSubj = e.course.curriculumYear?.curriculumSubjects.find(cs => cs.subjectId === subj.id);
            return {
                courseCode: subj?.code,
                courseName: subj?.title,
                semester: e.course.semester,
                entrepreneurship: curSubj?.isEntrepreneurshipEnabled ? (e.skillAssessment?.entrepreneurshipScore ?? 0) : null,
                leadership: curSubj?.isLeadershipEnabled ? (e.skillAssessment?.leadershipScore ?? 0) : null,
                industryKnowledge: curSubj?.isIndustrySkillEnabled ? (e.skillAssessment?.industryKnowledgeScore ?? 0) : null,
                employabilitySkill: curSubj?.isEmployabilitySkillEnabled ? (e.skillAssessment?.employabilitySkillScore ?? 0) : null,
            }
        })

        return { 
            success: true, 
            student,
            clos: closResult, 
            plos: plosResult,
            sclAssessments
        }

    } catch (error: unknown) {
        return { success: false, error: (error as Error).message }
    }
}

export async function getDeanAnalytics(userId: string) {
    try {
        const faculties = await prisma.faculty.findMany({
            where: { activeDeanId: userId },
            include: {
                departments: {
                    include: {
                        clos: { select: { id: true } },
                        plos: { select: { id: true } }
                    }
                }
            }
        });

        if (faculties.length === 0) return { success: false, error: 'Bukan dekan aktif' };

        const faculty = faculties[0];
        
        // Fetch submission scores for all departments in this faculty
        const cloIds = faculty.departments.flatMap(d => d.clos.map(c => c.id));
        const scores = await prisma.submissionCLOScore.findMany({
            where: { cloId: { in: cloIds } },
            include: { clo: { select: { departmentId: true } } }
        });

        const departmentStats = faculty.departments.map(dept => {
            const deptScores = scores.filter(s => s.clo.departmentId === dept.id && s.score !== null);
            const totalScore = deptScores.reduce((sum, s) => sum + (s.score as number), 0);
            const average = deptScores.length > 0 ? totalScore / deptScores.length : null;
            return {
                id: dept.id,
                name: dept.name,
                average,
                scoreCount: deptScores.length
            };
        });

        return { success: true, facultyName: faculty.name, departments: departmentStats };
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message };
    }
}

export async function getRectorAnalytics(userId: string) {
    try {
        const universities = await prisma.university.findMany({
            where: { activeRectorId: userId },
            include: {
                faculties: {
                    include: {
                        departments: {
                            include: {
                                clos: { select: { id: true } }
                            }
                        }
                    }
                }
            }
        });

        if (universities.length === 0) return { success: false, error: 'Bukan rektor aktif' };

        const university = universities[0];
        
        // Fetch submission scores for all faculties in this university
        const facultyStats = await Promise.all(university.faculties.map(async (fac) => {
            const cloIds = fac.departments.flatMap(d => d.clos.map(c => c.id));
            if (cloIds.length === 0) return { id: fac.id, name: fac.name, average: null, scoreCount: 0 };

            const scores = await prisma.submissionCLOScore.findMany({
                where: { cloId: { in: cloIds } },
                select: { score: true }
            });

            const validScores = scores.filter(s => s.score !== null);
            const totalScore = validScores.reduce((sum, s) => sum + (s.score as number), 0);
            const average = validScores.length > 0 ? totalScore / validScores.length : null;

            return {
                id: fac.id,
                name: fac.name,
                average,
                scoreCount: scores.length
            };
        }));

        return { success: true, universityName: university.name, faculties: facultyStats };
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message };
    }
}
