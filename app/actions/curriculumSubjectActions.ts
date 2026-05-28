'use server'

import prisma from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { checkCurriculumLock } from './obeActions'

export async function getCurriculumSubjects(curriculumYearId: string) {
    try {
        const curriculumSubjects = await prisma.curriculumSubject.findMany({
            where: { curriculumYearId },
            include: {
                subject: true
            },
            orderBy: { subject: { code: 'asc' } }
        })
        return { success: true, curriculumSubjects }
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message, curriculumSubjects: [] }
    }
}

export async function toggleCurriculumSubject(curriculumYearId: string, subjectId: string, departmentId: string, active: boolean) {
    try {
        const lock = await checkCurriculumLock(departmentId, curriculumYearId)
        if (lock.locked) return { success: false, error: lock.error }

        if (active) {
            const res = await prisma.curriculumSubject.upsert({
                where: { curriculumYearId_subjectId: { curriculumYearId, subjectId } },
                update: {},
                create: { curriculumYearId, subjectId }
            })
            revalidatePath('/qa/curriculum')
            return { success: true, curriculumSubject: res }
        } else {
            // Wait, what if they have mappings for this subject?
            // Optionally, we could clean up SubjectCLO mappings for this subject if we uncheck it.
            // But we don't have curriculumYearId in SubjectCLO natively, it's tied to CLO.
            // Let's just remove the relation. The CLO mappings remain in DB, but won't be shown since it's filtered.
            await prisma.curriculumSubject.delete({
                where: { curriculumYearId_subjectId: { curriculumYearId, subjectId } }
            })
            revalidatePath('/qa/curriculum')
            return { success: true }
        }
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message }
    }
}
