'use server'

import prisma from '@/lib/db'
import { revalidatePath } from 'next/cache'

// Curriculum Year Actions
export async function getCurriculumYears(departmentId?: string, onlyApproved?: boolean) {
    const where: any = {}
    if (departmentId) where.departmentId = departmentId
    if (onlyApproved) {
        where.departmentCurriculums = {
            some: {
                status: 'APPROVED',
                ...(departmentId ? { departmentId } : {})
            }
        }
    }
    
    return await prisma.curriculumYear.findMany({
        where,
        orderBy: { name: 'desc' }
    })
}

export async function createCurriculumYear(name: string, startYear?: number, endYear?: number, description?: string, departmentId?: string) {
    try {
        const cy = await prisma.curriculumYear.create({
            data: { 
                name, 
                startYear, 
                endYear, 
                description,
                departmentId 
            }
        })
        revalidatePath('/qa/curriculum')
        return { success: true, curriculumYear: cy }
    } catch (error: any) {
        if (error.code === 'P2002') return { success: false, error: 'Tahun kurikulum dengan nama ini sudah ada di departemen Anda.' }
        return { success: false, error: error.message }
    }
}

export async function setActiveCurriculum(id: string, departmentId: string) {
    try {
        await prisma.$transaction([
            prisma.curriculumYear.updateMany({
                where: { departmentId },
                data: { isActive: false }
            }),
            prisma.curriculumYear.update({
                where: { id },
                data: { isActive: true }
            })
        ])
        revalidatePath('/qa/curriculum')
        revalidatePath('/qa/analytics')
        revalidatePath('/qa')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

// PLO (Program Learning Outcome) Actions - Usually for QA/Department
export async function createPLO(data: { code: string, description: string, graduateProfileIds?: string[], departmentId?: string, curriculumYearId?: string }) {
    try {
        const lock = await checkCurriculumLock(data.departmentId, data.curriculumYearId)
        if (lock.locked) return { success: false, error: lock.error }

        const existing = await prisma.programLearningOutcome.findFirst({
            where: {
                code: data.code,
                departmentId: data.departmentId || null,
                curriculumYearId: data.curriculumYearId || null
            }
        })
        if (existing) {
            return { success: false, error: "Kode PLO sudah digunakan pada department dan tahun kurikulum ini." }
        }

        const payload: any = { code: data.code, description: data.description }
        if (data.departmentId) payload.departmentId = data.departmentId
        if (data.curriculumYearId) payload.curriculumYearId = data.curriculumYearId
        if (data.graduateProfileIds && data.graduateProfileIds.length > 0) {
            payload.graduateProfiles = {
                connect: data.graduateProfileIds.map(id => ({ id }))
            }
        }
        const plo = await prisma.programLearningOutcome.create({ data: payload })
        revalidatePath('/qa/curriculum')
        return { success: true, plo }
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message }
    }
}

export async function updatePLO(id: string, data: { code: string, description: string, graduateProfileIds?: string[] }) {
    try {
        const currentPlo = await prisma.programLearningOutcome.findUnique({ where: { id } })
        if (!currentPlo) return { success: false, error: "PLO tidak ditemukan." }

        const lock = await checkCurriculumLock(currentPlo.departmentId, currentPlo.curriculumYearId)
        if (lock.locked) return { success: false, error: lock.error }

        const duplicate = await prisma.programLearningOutcome.findFirst({
            where: {
                code: data.code,
                departmentId: currentPlo.departmentId,
                curriculumYearId: currentPlo.curriculumYearId,
                id: { not: id }
            }
        })
        if (duplicate) {
            return { success: false, error: "Kode PLO sudah digunakan pada department dan tahun kurikulum ini." }
        }

        const payload: any = { code: data.code, description: data.description }
        if (data.graduateProfileIds !== undefined) {
            payload.graduateProfiles = {
                set: data.graduateProfileIds.map(id => ({ id }))
            }
        }
        const plo = await prisma.programLearningOutcome.update({
            where: { id },
            data: payload
        })
        revalidatePath('/qa/curriculum')
        return { success: true, plo }
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message }
    }
}

export async function getPLOs(departmentId?: string, curriculumYearId?: string) {
    try {
        const whereClause: any = {}
        if (departmentId) whereClause.departmentId = departmentId
        if (curriculumYearId) whereClause.curriculumYearId = curriculumYearId

        const plos = await prisma.programLearningOutcome.findMany({
            where: whereClause,
            include: { 
                _count: { select: { clos: true } },
                graduateProfiles: true
            },
            orderBy: { code: 'asc' }
        })
        return { success: true, plos }
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message, plos: [] }
    }
}

export async function deletePLO(id: string) {
    try {
        const current = await prisma.programLearningOutcome.findUnique({ where: { id } })
        if (current) {
            const lock = await checkCurriculumLock(current.departmentId, current.curriculumYearId)
            if (lock.locked) return { success: false, error: lock.error }
        }

        await prisma.programLearningOutcome.delete({ where: { id } })
        revalidatePath('/qa/curriculum')
        return { success: true }
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message }
    }
}

// CLO (Course Learning Outcome) Actions - Bank CLO per Department
export async function createCLO(data: { code: string, description: string, ploIds?: string[], departmentId?: string, curriculumYearId?: string }) {
    try {
        const lock = await checkCurriculumLock(data.departmentId, data.curriculumYearId)
        if (lock.locked) return { success: false, error: lock.error }

        const existing = await prisma.courseLearningOutcome.findFirst({
            where: {
                code: data.code,
                departmentId: data.departmentId || null,
                curriculumYearId: data.curriculumYearId || null
            }
        })
        if (existing) {
            return { success: false, error: "Kode CLO sudah digunakan pada department dan tahun kurikulum ini." }
        }

        const payload: any = {
            code: data.code,
            description: data.description
        }
        if (data.departmentId) payload.departmentId = data.departmentId
        if (data.curriculumYearId) payload.curriculumYearId = data.curriculumYearId
        if (data.ploIds && data.ploIds.length > 0) {
            payload.plos = {
                connect: data.ploIds.map(id => ({ id }))
            }
        }
        const clo = await prisma.courseLearningOutcome.create({
            data: payload
        })
        revalidatePath('/teacher/obl')
        revalidatePath('/qa/curriculum')
        return { success: true, clo }
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message }
    }
}

export async function updateCLO(id: string, data: { code: string, description: string, ploIds?: string[], departmentId?: string }) {
    try {
        const currentClo = await prisma.courseLearningOutcome.findUnique({ where: { id } })
        if (!currentClo) return { success: false, error: "CLO tidak ditemukan." }

        const lock = await checkCurriculumLock(currentClo.departmentId, currentClo.curriculumYearId)
        if (lock.locked) return { success: false, error: lock.error }

        const duplicate = await prisma.courseLearningOutcome.findFirst({
            where: {
                code: data.code,
                departmentId: currentClo.departmentId,
                curriculumYearId: currentClo.curriculumYearId,
                id: { not: id }
            }
        })
        if (duplicate) {
            return { success: false, error: "Kode CLO sudah digunakan pada department dan tahun kurikulum ini." }
        }

        const payload: any = {
            code: data.code,
            description: data.description
        }
        if (data.ploIds !== undefined) {
            payload.plos = {
                set: data.ploIds.map(id => ({ id }))
            }
        }
        const clo = await prisma.courseLearningOutcome.update({
            where: { id },
            data: payload
        })
        revalidatePath('/teacher/obl')
        revalidatePath('/qa/curriculum')
        return { success: true, clo }
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message }
    }
}

export async function getCLOsBySubject(subjectId: string) {
    try {
        const mappings = await prisma.subjectCLO.findMany({
            where: { subjectId },
            include: {
                clo: {
                    include: { plos: true }
                },
                plo: true,
                techniques: true
            },
            orderBy: [{ plo: { code: 'asc' } }, { clo: { code: 'asc' } }]
        })
        return { success: true, mappings }
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message, mappings: [] }
    }
}

export async function getAllSubjectCLOMappings(departmentId?: string, curriculumYearId?: string) {
    try {
        const mappings = await prisma.subjectCLO.findMany({
            where: {
                clo: {
                    departmentId: departmentId || undefined,
                    curriculumYearId: curriculumYearId || undefined
                }
            },
            include: {
                clo: { include: { plos: true } },
                plo: true,
                techniques: true
            },
            orderBy: [{ plo: { code: 'asc' } }, { clo: { code: 'asc' } }]
        })
        return { success: true, mappings }
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message, mappings: [] }
    }
}

export async function getSubjectCLOMappings(subjectId: string) {
    try {
        const mappings = await prisma.subjectCLO.findMany({
            where: { subjectId },
            include: {
                clo: { include: { plos: true } },
                plo: true
            },
            orderBy: [{ plo: { code: 'asc' } }, { clo: { code: 'asc' } }]
        })
        return { success: true, mappings }
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message, mappings: [] }
    }
}

export async function saveSubjectCLOMapping(subjectId: string, cloId: string, ploId: string, weight: number) {
    try {
        const clo = await prisma.courseLearningOutcome.findUnique({ where: { id: cloId } })
        if (clo) {
            const lock = await checkCurriculumLock(clo.departmentId, clo.curriculumYearId)
            if (lock.locked) return { success: false, error: lock.error }
        }

        const mapping = await prisma.subjectCLO.upsert({
            where: { subjectId_cloId_ploId: { subjectId, cloId, ploId } },
            update: { weight },
            create: { subjectId, cloId, ploId, weight }
        })
        revalidatePath('/qa/curriculum')
        return { success: true, mapping }
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message }
    }
}

export async function deleteSubjectCLOMapping(subjectId: string, cloId: string, ploId: string) {
    try {
        const clo = await prisma.courseLearningOutcome.findUnique({ where: { id: cloId } })
        if (clo) {
            const lock = await checkCurriculumLock(clo.departmentId, clo.curriculumYearId)
            if (lock.locked) return { success: false, error: lock.error }
        }

        await prisma.subjectCLO.delete({
            where: { subjectId_cloId_ploId: { subjectId, cloId, ploId } }
        })
        revalidatePath('/qa/curriculum')
        return { success: true }
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message }
    }
}

// Assessment Techniques Actions
export async function getSubjectCLOTechniques(subjectId: string) {
    try {
        const mappings = await prisma.subjectCLO.findMany({
            where: { subjectId },
            include: {
                clo: { include: { plos: true } },
                plo: true,
                techniques: true
            },
            orderBy: [{ plo: { code: 'asc' } }, { clo: { code: 'asc' } }]
        })
        return { success: true, mappings }
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message, mappings: [] }
    }
}

export async function toggleSubjectCLOTechnique(subjectCloId: string, technique: string, active: boolean) {
    try {
        // We assume CurriculumLock is checked before calling or in the UI. 
        if (active) {
            const res = await prisma.subjectCLOTechnique.upsert({
                where: { subjectCloId_technique: { subjectCloId, technique } },
                update: {},
                create: { subjectCloId, technique, weight: 0 }
            })
            revalidatePath('/qa/curriculum')
            return { success: true, technique: res }
        } else {
            await prisma.subjectCLOTechnique.delete({
                where: { subjectCloId_technique: { subjectCloId, technique } }
            })
            revalidatePath('/qa/curriculum')
            return { success: true }
        }
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message }
    }
}

export async function updateSubjectCLOTechniqueWeight(subjectCloId: string, technique: string, weight: number) {
    try {
        const res = await prisma.subjectCLOTechnique.update({
            where: { subjectCloId_technique: { subjectCloId, technique } },
            data: { weight }
        })
        revalidatePath('/qa/curriculum')
        return { success: true, technique: res }
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message }
    }
}

export async function deleteCLO(id: string) {
    try {
        const current = await prisma.courseLearningOutcome.findUnique({ where: { id } })
        if (current) {
            const lock = await checkCurriculumLock(current.departmentId, current.curriculumYearId)
            if (lock.locked) return { success: false, error: lock.error }
        }

        await prisma.courseLearningOutcome.delete({ where: { id } })
        revalidatePath('/teacher/obl')
        revalidatePath('/qa/curriculum')
        return { success: true }
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message }
    }
}

// Get All CLOs (Bank CLO per Department)
export async function getAllCLOs(curriculumYearId?: string, departmentId?: string | null) {
    try {
        const whereClause: any = {}
        if (curriculumYearId) whereClause.curriculumYearId = curriculumYearId
        if (departmentId) whereClause.departmentId = departmentId

        const clos = await prisma.courseLearningOutcome.findMany({
            where: whereClause,
            include: {
                plos: true,
                subjectClos: { include: { subject: true } }
            },
            orderBy: { code: 'asc' }
        })
        return { success: true, clos }
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message, clos: [] }
    }
}

// Vision and Mission Actions
export async function getVisionMissions(departmentId?: string, curriculumYearId?: string) {
    try {
        const visionMissions = await prisma.institutionVisionMission.findMany({
            where: { 
                departmentId: departmentId || null,
                curriculumYearId: curriculumYearId || null
            },
            include: { _count: { select: { graduateProfiles: true } } },
            orderBy: { createdAt: 'asc' }
        })
        return { success: true, visionMissions }
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message, visionMissions: [] }
    }
}

export async function createVisionMission(data: { code: string, description: string, type: string, departmentId?: string, curriculumYearId?: string }) {
    try {
        const existing = await prisma.institutionVisionMission.findFirst({
            where: { 
                code: data.code,
                departmentId: data.departmentId || null,
                curriculumYearId: data.curriculumYearId || null
            }
        })
        if (existing) {
            return { success: false, error: "Kode Vision/Mission sudah digunakan pada departemen ini." }
        }

        const vm = await prisma.institutionVisionMission.create({ 
            data: {
                ...data,
                departmentId: data.departmentId || null,
                curriculumYearId: data.curriculumYearId || null
            } 
        })
        revalidatePath('/qa/curriculum')
        return { success: true, vm }
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message }
    }
}

export async function updateVisionMission(id: string, data: { code: string, description: string, type: string, departmentId?: string, curriculumYearId?: string }) {
    try {
        const currentVm = await prisma.institutionVisionMission.findUnique({ where: { id } })
        const depId = data.departmentId || currentVm?.departmentId || null
        const cyId = data.curriculumYearId || currentVm?.curriculumYearId || null

        const duplicate = await prisma.institutionVisionMission.findFirst({
            where: {
                code: data.code,
                departmentId: depId,
                curriculumYearId: cyId,
                id: { not: id }
            }
        })
        if (duplicate) {
            return { success: false, error: "Kode Vision/Mission sudah digunakan pada departemen ini." }
        }

        const vm = await prisma.institutionVisionMission.update({
            where: { id },
            data: {
                ...data,
                departmentId: depId
            }
        })
        revalidatePath('/qa/curriculum')
        return { success: true, vm }
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message }
    }
}

export async function deleteVisionMission(id: string) {
    try {
        await prisma.institutionVisionMission.delete({ where: { id } })
        revalidatePath('/qa/curriculum')
        return { success: true }
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message }
    }
}

// Graduate Profile Actions
export async function getGraduateProfiles(departmentId?: string, curriculumYearId?: string) {
    try {
        const whereClause: any = {}
        if (departmentId) whereClause.departmentId = departmentId
        if (curriculumYearId) whereClause.curriculumYearId = curriculumYearId

        const profiles = await prisma.graduateProfile.findMany({
            where: whereClause,
            include: { 
                visionMission: true,
                department: true,
                _count: { select: { plos: true } }
            },
            orderBy: { code: 'asc' }
        })
        return { success: true, profiles }
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message, profiles: [] }
    }
}

export async function createGraduateProfile(data: { code: string, title: string, description?: string, visionMissionId?: string, departmentId?: string, curriculumYearId?: string }) {
    try {
        const lock = await checkCurriculumLock(data.departmentId, data.curriculumYearId)
        if (lock.locked) return { success: false, error: lock.error }

        const existing = await prisma.graduateProfile.findFirst({
            where: {
                code: data.code,
                departmentId: data.departmentId || null,
                curriculumYearId: data.curriculumYearId || null
            }
        })
        if (existing) {
            return { success: false, error: "Kode Graduate Profile sudah digunakan pada department dan tahun kurikulum ini." }
        }

        const profile = await prisma.graduateProfile.create({ data })
        revalidatePath('/qa/curriculum')
        return { success: true, profile }
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message }
    }
}

export async function updateGraduateProfile(id: string, data: { code: string, title: string, description?: string, visionMissionId?: string, departmentId?: string }) {
    try {
        const currentGp = await prisma.graduateProfile.findUnique({ where: { id } })
        if (!currentGp) return { success: false, error: "Profil Lulusan tidak ditemukan." }

        const lock = await checkCurriculumLock(currentGp.departmentId, currentGp.curriculumYearId)
        if (lock.locked) return { success: false, error: lock.error }

        const duplicate = await prisma.graduateProfile.findFirst({
            where: {
                code: data.code,
                departmentId: currentGp.departmentId,
                curriculumYearId: currentGp.curriculumYearId,
                id: { not: id }
            }
        })
        if (duplicate) {
            return { success: false, error: "Kode Graduate Profile sudah digunakan pada department dan tahun kurikulum ini." }
        }

        const profile = await prisma.graduateProfile.update({
            where: { id },
            data
        })
        revalidatePath('/qa/curriculum')
        return { success: true, profile }
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message }
    }
}

export async function deleteGraduateProfile(id: string) {
    try {
        const current = await prisma.graduateProfile.findUnique({ where: { id } })
        if (current) {
            const lock = await checkCurriculumLock(current.departmentId, current.curriculumYearId)
            if (lock.locked) return { success: false, error: lock.error }
        }

        await prisma.graduateProfile.delete({ where: { id } })
        revalidatePath('/qa/curriculum')
        return { success: true }
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message }
    }
}

// QA Dashboard Metrics
export async function getQADashboardMetrics(departmentId?: string | null) {
    try {
        const subjectFilter = departmentId ? {
            OR: [
                { departmentId: departmentId },
                { scope: 'universitas' }
            ]
        } : {}

        const subjects = await prisma.subject.findMany({
            where: subjectFilter,
            include: {
                subjectClos: {
                    include: { clo: { include: { plos: true } }, plo: true }
                },
                courses: {
                    include: { instructor: true }
                },
                curriculumYears: true
            }
        })

        const totalSubjects = subjects.length
        let alignedSubjectsCount = 0
        let reviewNeededCount = 0
        let totalPlosMeasured = 0

        const reviewTableData = subjects.map(subject => {
            const uniqueCloIds = new Set(subject.subjectClos.map(sc => sc.cloId))
            const cloCount = uniqueCloIds.size
            const mappedCloCount = cloCount // Since SubjectCLO requires ploId, all mapped CLOs are aligned
            
            const alignmentPercentage = cloCount > 0 ? 100 : 0
            
            let status = 'Review'
            if (cloCount > 0) {
                status = 'Approved'
                alignedSubjectsCount++
            } else {
                reviewNeededCount++
            }

            // Extract instructor names from courses
            const instructors = Array.from(new Set(subject.courses.map(c => c.instructor.name)))
            
            const curriculumYearIds = new Set<string>()
            const mappingDetails: any[] = []
            
            subject.subjectClos.forEach(sc => {
                if (sc.clo?.curriculumYearId) curriculumYearIds.add(sc.clo.curriculumYearId)
                
                mappingDetails.push({
                    cloCode: sc.clo?.code || '-',
                    cloDescription: sc.clo?.description || '-',
                    ploCode: sc.plo?.code || '-',
                    ploDescription: sc.plo?.description || '-',
                    curriculumYearId: sc.clo?.curriculumYearId || null
                })
            })
            subject.courses.forEach(c => {
                if (c.curriculumYearId) curriculumYearIds.add(c.curriculumYearId)
            })

            return {
                id: subject.id,
                code: subject.code,
                title: subject.title,
                instructors: instructors.length > 0 ? instructors.join(', ') : '-',
                alignmentPercentage,
                cloCount,
                mappedCloCount,
                status,
                curriculumYearIds: Array.from(curriculumYearIds),
                mappingDetails,
                curriculumSubjects: subject.curriculumYears.map(cy => ({
                    curriculumYearId: cy.curriculumYearId,
                    includeInAnalytics: cy.includeInAnalytics
                }))
            }
        })

        // Fetch all PLOs for this department to get total PLOs measured
        const plos = await prisma.programLearningOutcome.findMany({
            where: departmentId ? { departmentId } : {}
        })
        
        const validPloIds = new Set(plos.map(p => p.id))
        // We consider a PLO measured if it is mapped to at least one active subject
        const measuredPloIds = new Set()
        subjects.forEach(subject => {
            subject.subjectClos.forEach(sc => {
                if (validPloIds.has(sc.ploId)) {
                    measuredPloIds.add(sc.ploId)
                }
            })
        })
        totalPlosMeasured = measuredPloIds.size

        const alignmentRate = totalSubjects > 0 ? Math.round((alignedSubjectsCount / totalSubjects) * 100) : 0

        return {
            success: true,
            metrics: {
                alignmentRate,
                reviewNeededCount,
                totalPlosMeasured,
                totalPlos: plos.length,
                reviewTableData,
                allPlos: plos.map(p => ({ id: p.id, code: p.code, curriculumYearId: p.curriculumYearId }))
            }
        }
    } catch (error: unknown) {
        console.error("Failed to fetch QA metrics", error)
        return { success: false, error: (error as Error).message }
    }
}

// Get all active courses for QA scheduling
export async function getQAActiveCourses(departmentId?: string | null) {
    try {
        const courseWhere = departmentId ? { departmentId: departmentId } : {}

        const courses = await prisma.course.findMany({
            where: courseWhere,
            include: {
                subject: true,
                instructor: {
                    include: {
                        teacherProfile: true
                    }
                },
                curriculumYear: true,
                _count: { select: { enrollments: true } }
            },
            orderBy: [{ academicYear: 'desc' }, { semester: 'desc' }, { subjectId: 'asc' }]
        })

        return { success: true, courses }
    } catch (error: unknown) {
        console.error("Failed to fetch QA courses", error)
        return { success: false, error: (error as Error).message, courses: [] }
    }
}

// --- Curriculum Approval Actions ---
export async function getDepartmentCurriculumStatus(departmentId: string, curriculumYearId: string) {
    if (!departmentId || !curriculumYearId) return null
    return await prisma.departmentCurriculum.findUnique({
        where: {
            departmentId_curriculumYearId: { departmentId, curriculumYearId }
        }
    })
}

export async function setDepartmentCurriculumStatus(departmentId: string, curriculumYearId: string, status: string, userId?: string) {
    try {
        if (status === 'APPROVED' || status === 'REVISION') {
            const dept = await prisma.department.findUnique({ where: { id: departmentId } })
            if (!dept?.activeHeadId) {
                return { success: false, error: 'Admin belum menetapkan Ketua Departemen yang aktif. Persetujuan tidak dapat diproses.' }
            }
            if (dept.activeHeadId !== userId) {
                return { success: false, error: 'Anda bukan Ketua Departemen yang sedang menjabat, sehingga tidak memiliki akses ini.' }
            }
        }

        const now = new Date()
        const extraFields: Record<string, any> = {}

        if (status === 'SUBMITTED') {
            extraFields.submittedAt = now
            extraFields.submittedBy = userId || null
        } else if (status === 'APPROVED') {
            extraFields.approvedAt = now
            extraFields.approvedBy = userId || null
            extraFields.rejectedAt = null
            extraFields.rejectedBy = null
            // HoD approved a revision request
            extraFields.revisionRequestResult = 'APPROVED'
            extraFields.revisionResultAt = now
            extraFields.revisionResultBy = userId || null
        } else if (status === 'REVISION') {
            // HoD rejected initial submission → back to revision
            extraFields.rejectedAt = now
            extraFields.rejectedBy = userId || null
        } else if (status === 'DRAFT') {
            extraFields.submittedAt = null
            extraFields.submittedBy = null
        }

        const doc = await prisma.departmentCurriculum.upsert({
            where: {
                departmentId_curriculumYearId: { departmentId, curriculumYearId }
            },
            create: { departmentId, curriculumYearId, status, ...extraFields },
            update: { status, ...extraFields }
        })
        revalidatePath('/qa/curriculum')
        return { success: true, data: doc }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

// QA requests revision of an already-approved curriculum
export async function requestCurriculumRevision(departmentId: string, curriculumYearId: string, userId: string, note: string) {
    try {
        const existing = await prisma.departmentCurriculum.findUnique({
            where: { departmentId_curriculumYearId: { departmentId, curriculumYearId } }
        })
        if (!existing || existing.status !== 'APPROVED') {
            return { success: false, error: 'Permintaan revisi hanya dapat diajukan pada kurikulum yang sudah berstatus APPROVED.' }
        }

        const doc = await prisma.departmentCurriculum.update({
            where: { departmentId_curriculumYearId: { departmentId, curriculumYearId } },
            data: {
                status: 'REVISION_REQUESTED',
                revisionRequestedAt: new Date(),
                revisionRequestedBy: userId,
                revisionRequestNote: note || null,
                revisionRequestResult: null,
                revisionResultAt: null,
                revisionResultBy: null,
            }
        })
        revalidatePath('/qa/curriculum')
        return { success: true, data: doc }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

// HoD approves or rejects a revision request
export async function respondCurriculumRevisionRequest(departmentId: string, curriculumYearId: string, userId: string, approve: boolean) {
    try {
        const dept = await prisma.department.findUnique({ where: { id: departmentId } })
        if (!dept?.activeHeadId) {
            return { success: false, error: 'Admin belum menetapkan Ketua Departemen yang aktif.' }
        }
        if (dept.activeHeadId !== userId) {
            return { success: false, error: 'Anda bukan Ketua Departemen yang sedang menjabat.' }
        }

        const existing = await prisma.departmentCurriculum.findUnique({
            where: { departmentId_curriculumYearId: { departmentId, curriculumYearId } }
        })
        if (!existing || existing.status !== 'REVISION_REQUESTED') {
            return { success: false, error: 'Tidak ada permintaan revisi aktif untuk kurikulum ini.' }
        }

        const now = new Date()
        const doc = await prisma.departmentCurriculum.update({
            where: { departmentId_curriculumYearId: { departmentId, curriculumYearId } },
            data: {
                status: approve ? 'REVISION' : 'APPROVED',
                revisionRequestResult: approve ? 'APPROVED' : 'REJECTED',
                revisionResultAt: now,
                revisionResultBy: userId,
                // If approved, clear the approval lock so QA can edit
                ...(approve ? { approvedAt: null, approvedBy: null } : {}),
            }
        })
        revalidatePath('/qa/curriculum')
        return { success: true, data: doc }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

export async function checkCurriculumLock(departmentId?: string | null, curriculumYearId?: string | null) {
    if (!departmentId || !curriculumYearId) return { locked: false }
    const status = await getDepartmentCurriculumStatus(departmentId, curriculumYearId)
    if (status?.status === 'APPROVED') {
        return { locked: true, error: 'Kurikulum ini sudah disetujui (APPROVED) dan tidak dapat diubah. Ajukan permintaan revisi kepada Ketua Departemen.' }
    }
    if (status?.status === 'REVISION_REQUESTED') {
        return { locked: true, error: 'Permintaan revisi sedang menunggu keputusan Ketua Departemen.' }
    }
    if (status?.status === 'SUBMITTED') {
        return { locked: true, error: 'Kurikulum sedang diajukan (SUBMITTED) dan tidak dapat diubah sampai ditolak (Revisi) oleh Ketua Departemen.' }
    }
    return { locked: false }
}

export async function toggleSubjectAnalytics(curriculumYearId: string, subjectId: string, includeInAnalytics: boolean) {
    try {
        await prisma.curriculumSubject.update({
            where: {
                curriculumYearId_subjectId: {
                    curriculumYearId,
                    subjectId
                }
            },
            data: {
                includeInAnalytics
            }
        });
        revalidatePath('/qa')
        revalidatePath('/qa/metrics')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}
