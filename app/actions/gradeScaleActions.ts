'use server'

import prisma from '@/lib/db'

export async function getGradeScales() {
    try {
        const scales = await prisma.gradeScale.findMany({
            orderBy: { minScore: 'desc' }
        })
        return { success: true, data: scales }
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message }
    }
}

export async function upsertGradeScale(data: any) {
    try {
        const id = data.id || 'new'
        
        let saved;
        if (id === 'new') {
            saved = await prisma.gradeScale.create({
                data: {
                    grade: data.grade,
                    minScore: parseFloat(data.minScore),
                    maxScore: parseFloat(data.maxScore),
                    point: parseFloat(data.point)
                }
            })
        } else {
            saved = await prisma.gradeScale.update({
                where: { id },
                data: {
                    grade: data.grade,
                    minScore: parseFloat(data.minScore),
                    maxScore: parseFloat(data.maxScore),
                    point: parseFloat(data.point)
                }
            })
        }
        
        return { success: true, data: saved }
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message }
    }
}

export async function deleteGradeScale(id: string) {
    try {
        await prisma.gradeScale.delete({
            where: { id }
        })
        return { success: true }
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message }
    }
}
