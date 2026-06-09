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
                    include: { 
                        student: { include: { studentProfile: true } },
                        assessment: { include: { course: true } }
                    }
                }
            }
        })
        
        // Find unique student IDs from the scores
        const uniqueStudentIds = new Set(scores.map(s => s.submission.studentId))

        // Fetch Subject CLO weights
        const subjectClos = await prisma.subjectCLO.findMany({
            where: { cloId: { in: clos.map(c => c.id) } },
            select: { subjectId: true, cloId: true, weight: true }
        })

        // Calculate max curriculum weight for each CLO
        const activeCurriculumSubjects = curriculumYearId ? await prisma.curriculumSubject.findMany({
            where: { curriculumYearId },
            select: { subjectId: true }
        }) : []
        const activeSubjectIds = activeCurriculumSubjects.map(cs => cs.subjectId)

        const activeSubjectClos = activeSubjectIds.length > 0 
            ? subjectClos.filter(sc => activeSubjectIds.includes(sc.subjectId))
            : subjectClos
            
        const cloMaxWeights = new Map<string, number>()
        activeSubjectClos.forEach(sc => {
            cloMaxWeights.set(sc.cloId, (cloMaxWeights.get(sc.cloId) || 0) + sc.weight)
        })

        // Aggregate by CLO
        const cloAggregates = clos.map(clo => {
            const cloScores = scores.filter(s => s.cloId === clo.id && s.score !== null)
            let totalWeightedScore = 0
            let totalWeight = 0

            cloScores.forEach(s => {
                const subjectId = s.submission.assessment.course.subjectId
                const sc = subjectClos.find(x => x.subjectId === subjectId && x.cloId === clo.id)
                const weight = sc?.weight || 1
                totalWeightedScore += (s.score as number) * weight
                totalWeight += weight
            })

            const average = totalWeight > 0 ? totalWeightedScore / totalWeight : null
            return {
                ...clo,
                average,
                studentCount: new Set(cloScores.map(s => s.submission.studentId)).size,
                submissionCount: cloScores.length,
                totalWeight
            }
        })

        // Aggregate detailed CLO profiles by Angkatan
        const angkatanMap = new Map<number, Map<string, { count: number, totalWeightedScore: number, totalWeight: number, studentIds: Set<string> }>>()
        scores.forEach(s => {
            const angkatan = s.submission.student.studentProfile?.angkatan
            const cloId = s.cloId
            if (angkatan && cloId && s.score !== null) {
                if (!angkatanMap.has(angkatan)) {
                    angkatanMap.set(angkatan, new Map())
                }
                const cloMap = angkatanMap.get(angkatan)!
                if (!cloMap.has(cloId)) {
                    cloMap.set(cloId, { count: 0, totalWeightedScore: 0, totalWeight: 0, studentIds: new Set() })
                }
                const data = cloMap.get(cloId)!
                
                const subjectId = s.submission.assessment.course.subjectId
                const sc = subjectClos.find(x => x.subjectId === subjectId && x.cloId === cloId)
                const weight = sc?.weight || 1

                data.count++
                data.totalWeightedScore += (s.score * weight)
                data.totalWeight += weight
                data.studentIds.add(s.submission.studentId)
            }
        })

        const angkatanProfiles = Array.from(angkatanMap.entries()).map(([angkatan, cloMap]) => {
            const closResult = clos.map(cloDef => {
                const data = cloMap.get(cloDef.id)
                const average = (data && data.totalWeight > 0) ? (data.totalWeightedScore / data.totalWeight) : null
                
                // Calculate completion
                const studentCountForThisClo = data ? data.studentIds.size : 0
                const avgCollectedWeight = studentCountForThisClo > 0 ? data!.totalWeight / studentCountForThisClo : 0
                const maxWeight = cloMaxWeights.get(cloDef.id) || 100 // fallback
                const completion = Math.min(100, maxWeight > 0 ? (avgCollectedWeight / maxWeight) * 100 : 0)

                return {
                    id: cloDef.id,
                    code: cloDef.code,
                    description: cloDef.description,
                    average,
                    completion,
                    count: data ? data.count : 0,
                    studentCount: studentCountForThisClo,
                    plos: cloDef.plos.map(p => p.id),
                    totalWeight: data ? data.totalWeight : 0,
                    avgCollectedWeight,
                    maxWeight
                }
            }).sort((a, b) => a.code.localeCompare(b.code))

            // Aggregate PLO scores
            const plosResult = plos.map(ploDef => {
                const mappedClos = closResult.filter(c => c.plos.includes(ploDef.id) && c.average !== null)
                let totalPloScore = 0
                let totalPloWeight = 0
                
                let totalPloAvgCollectedWeight = 0
                let totalPloMaxWeight = 0

                // Also include CLOs that haven't been taken for the Max Weight
                const allMappedClos = closResult.filter(c => c.plos.includes(ploDef.id))

                mappedClos.forEach(c => {
                    totalPloScore += (c.average as number) * c.totalWeight
                    totalPloWeight += c.totalWeight
                })
                
                allMappedClos.forEach(c => {
                    totalPloAvgCollectedWeight += c.avgCollectedWeight
                    totalPloMaxWeight += c.maxWeight
                })

                const average = totalPloWeight > 0 ? (totalPloScore / totalPloWeight) : null
                const completion = Math.min(100, totalPloMaxWeight > 0 ? (totalPloAvgCollectedWeight / totalPloMaxWeight) * 100 : 0)
                
                return {
                    id: ploDef.id,
                    code: ploDef.code,
                    description: ploDef.description,
                    average,
                    completion,
                    cloCount: allMappedClos.length,
                    mappedClos: allMappedClos // include all, even nulls for breakdown
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
            where: scoresWhere,
            include: {
                submission: {
                    include: { assessment: { include: { course: true } } }
                }
            }
        })

        // Fetch Subject CLO weights
        const subjectClos = await prisma.subjectCLO.findMany({
            where: { cloId: { in: clos.map(c => c.id) } },
            include: { subject: true }
        })

        const activeCurriculumSubjectsForStudent = targetCurriculumId ? await prisma.curriculumSubject.findMany({
            where: { curriculumYearId: targetCurriculumId },
            select: { subjectId: true }
        }) : []
        const activeSubjectIdsForStudent = activeCurriculumSubjectsForStudent.map(cs => cs.subjectId)
        
        const activeSubjectClosForStudent = activeSubjectIdsForStudent.length > 0
            ? subjectClos.filter(sc => activeSubjectIdsForStudent.includes(sc.subjectId))
            : subjectClos

        const cloMaxWeights = new Map<string, number>()
        activeSubjectClosForStudent.forEach(sc => {
            cloMaxWeights.set(sc.cloId, (cloMaxWeights.get(sc.cloId) || 0) + sc.weight)
        })

        // Map scores to CLOs
        const closResult = clos.map(cloDef => {
            const cloScores = scores.filter(s => s.cloId === cloDef.id && s.score !== null)
            let totalWeightedScore = 0
            let totalWeight = 0
            const uniqueSubjects = new Set<string>()

            cloScores.forEach(s => {
                const subjectId = s.submission.assessment.course.subjectId
                uniqueSubjects.add(subjectId)
                const sc = subjectClos.find(x => x.subjectId === subjectId && x.cloId === cloDef.id)
                const weight = sc?.weight || 1
                totalWeightedScore += (s.score as number) * weight
                totalWeight += weight
            })

            const average = totalWeight > 0 ? totalWeightedScore / totalWeight : null
            
            const maxWeight = cloMaxWeights.get(cloDef.id) || 100
            const completion = Math.min(100, maxWeight > 0 ? (totalWeight / maxWeight) * 100 : 0)

            const activeScsForClo = activeSubjectClosForStudent.filter(sc => sc.cloId === cloDef.id)
            
            const uniqueTargetSubjectsMap = new Map<string, { id: string, code: string, name: string, weightPercent: number }>()
            activeScsForClo.forEach(sc => {
                if (sc.subject) {
                    if (!uniqueTargetSubjectsMap.has(sc.subjectId)) {
                        uniqueTargetSubjectsMap.set(sc.subjectId, { id: sc.subjectId, code: sc.subject.code, name: sc.subject.title, weightPercent: sc.weight })
                    } else {
                        uniqueTargetSubjectsMap.get(sc.subjectId)!.weightPercent += sc.weight
                    }
                }
            })

            const targetSubjectCount = uniqueTargetSubjectsMap.size
            const takenSubjectIds = Array.from(uniqueSubjects)
            
            const allTargetSubjects = Array.from(uniqueTargetSubjectsMap.values())
            const takenSubjectsList = allTargetSubjects.filter(s => takenSubjectIds.includes(s.id))
            const untakenSubjectsList = allTargetSubjects.filter(s => !takenSubjectIds.includes(s.id))

            return {
                id: cloDef.id,
                code: cloDef.code,
                description: cloDef.description,
                average,
                completion,
                subjectCount: uniqueSubjects.size,
                targetSubjectCount,
                takenSubjectsList,
                untakenSubjectsList,
                plos: cloDef.plos.map(p => p.id),
                totalWeight,
                maxWeight
            }
        })

        // Aggregate PLO scores
        const plosResult = plos.map(ploDef => {
            const mappedClos = closResult.filter(c => c.plos.includes(ploDef.id) && c.average !== null)
            let totalPloScore = 0
            let totalPloWeight = 0
            
            let totalPloAvgCollectedWeight = 0
            let totalPloMaxWeight = 0
            
            const allMappedClos = closResult.filter(c => c.plos.includes(ploDef.id))

            mappedClos.forEach(c => {
                totalPloScore += (c.average as number) * c.totalWeight
                totalPloWeight += c.totalWeight
            })
            
            allMappedClos.forEach(c => {
                totalPloAvgCollectedWeight += c.totalWeight
                totalPloMaxWeight += c.maxWeight
            })

            const average = totalPloWeight > 0 ? totalPloScore / totalPloWeight : null
            const completion = Math.min(100, totalPloMaxWeight > 0 ? (totalPloAvgCollectedWeight / totalPloMaxWeight) * 100 : 0)
            
            return {
                id: ploDef.id,
                code: ploDef.code,
                description: ploDef.description,
                average,
                completion,
                cloCount: allMappedClos.length,
                mappedClos: allMappedClos
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
            include: { 
                clo: { select: { departmentId: true } },
                submission: { include: { assessment: { include: { course: true } } } }
            }
        });

        const subjectClos = await prisma.subjectCLO.findMany({
            where: { cloId: { in: cloIds } },
            select: { subjectId: true, cloId: true, weight: true }
        });

        const departmentStats = faculty.departments.map(dept => {
            const deptScores = scores.filter(s => s.clo.departmentId === dept.id && s.score !== null);
            let totalWeightedScore = 0;
            let totalWeight = 0;

            deptScores.forEach(s => {
                const subjectId = s.submission.assessment.course.subjectId;
                const weight = subjectClos.find(sc => sc.subjectId === subjectId && sc.cloId === s.cloId)?.weight || 1;
                totalWeightedScore += (s.score as number) * weight;
                totalWeight += weight;
            });
            
            const average = totalWeight > 0 ? totalWeightedScore / totalWeight : null;
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
                include: { submission: { include: { assessment: { include: { course: true } } } } }
            });

            const subjectClos = await prisma.subjectCLO.findMany({
                where: { cloId: { in: cloIds } },
                select: { subjectId: true, cloId: true, weight: true }
            });

            const validScores = scores.filter(s => s.score !== null);
            let totalWeightedScore = 0;
            let totalWeight = 0;

            validScores.forEach(s => {
                const subjectId = s.submission.assessment.course.subjectId;
                const weight = subjectClos.find(sc => sc.subjectId === subjectId && sc.cloId === s.cloId)?.weight || 1;
                totalWeightedScore += (s.score as number) * weight;
                totalWeight += weight;
            });

            const average = totalWeight > 0 ? totalWeightedScore / totalWeight : null;

            return {
                id: fac.id,
                name: fac.name,
                average,
                scoreCount: validScores.length
            };
        }));

        return { success: true, universityName: university.name, faculties: facultyStats };
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message };
    }
}
