'use server'

import prisma from '@/lib/db'
import { revalidatePath } from 'next/cache'

// PLO (Program Learning Outcome) Actions - Usually for QA/Prodi
export async function createPLO(data: { code: string, description: string }) {
    try {
        const plo = await prisma.programLearningOutcome.create({ data })
        revalidatePath('/qa/curriculum')
        return { success: true, plo }
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message }
    }
}

export async function getPLOs() {
    try {
        const plos = await prisma.programLearningOutcome.findMany({
            include: { _count: { select: { clos: true } } },
            orderBy: { code: 'asc' }
        })
        return { success: true, plos }
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message, plos: [] }
    }
}

export async function deletePLO(id: string) {
    try {
        await prisma.programLearningOutcome.delete({ where: { id } })
        revalidatePath('/qa/curriculum')
        return { success: true }
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message }
    }
}

// CLO (Course Learning Outcome) Actions - Usually for Dosen
export async function createCLO(data: { courseId: string, code: string, description: string, ploId?: string }) {
    try {
        const clo = await prisma.courseLearningOutcome.create({
            data: {
                courseId: data.courseId,
                code: data.code,
                description: data.description,
                ploId: data.ploId || null
            }
        })
        revalidatePath('/dosen/obl')
        return { success: true, clo }
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message }
    }
}

export async function getCLOsByCourse(courseId: string) {
    try {
        const clos = await prisma.courseLearningOutcome.findMany({
            where: { courseId },
            include: {
                plo: true,
                course: {
                    include: { subject: true }
                }
            },
            orderBy: { code: 'asc' }
        })
        return { success: true, clos }
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message, clos: [] }
    }
}

export async function deleteCLO(id: string) {
    try {
        await prisma.courseLearningOutcome.delete({ where: { id } })
        revalidatePath('/dosen/obl')
        return { success: true }
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message }
    }
}
