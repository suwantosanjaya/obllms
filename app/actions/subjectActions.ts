'use server'

import prisma from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function getSubjectList() {
    try {
        const subjects = await prisma.subject.findMany({
            orderBy: { code: 'asc' },
            include: {
                department: { include: { faculty: true } },
                faculty: true,
            }
        })
        return { success: true, subjects }
    } catch {
        return { success: false, error: 'Failed to load Subject data' }
    }
}

export async function createSubject(data: {
    code: string
    title: string
    description?: string
    type: 'wajib' | 'pilihan'
    scope: 'universitas' | 'faculty' | 'department'
    credits: number
    facultyId?: string
    departmentId?: string
}) {
    try {
        const subject = await prisma.subject.create({
            data: {
                code: data.code,
                title: data.title,
                description: data.description || null,
                type: data.type,
                scope: data.scope,
                credits: data.credits,
                facultyId: data.scope === 'faculty' || data.scope === 'department' ? (data.facultyId || null) : null,
                departmentId: data.scope === 'department' ? (data.departmentId || null) : null,
            }
        })
        revalidatePath('/qa/subjects')
        return { success: true, subject }
    } catch (error: any) {
        if (error.code === 'P2002') {
            return { success: false, error: 'Subject code already exists' }
        }
        return { success: false, error: 'Failed to create Subject' }
    }
}

export async function updateSubject(id: string, data: {
    code: string
    title: string
    description?: string
    type: 'wajib' | 'pilihan'
    scope: 'universitas' | 'faculty' | 'department'
    credits: number
    facultyId?: string
    departmentId?: string
}) {
    try {
        const subject = await prisma.subject.update({
            where: { id },
            data: {
                code: data.code,
                title: data.title,
                description: data.description || null,
                type: data.type,
                scope: data.scope,
                credits: data.credits,
                facultyId: data.scope === 'faculty' || data.scope === 'department' ? (data.facultyId || null) : null,
                departmentId: data.scope === 'department' ? (data.departmentId || null) : null,
            }
        })
        revalidatePath('/qa/subjects')
        return { success: true, subject }
    } catch (error: any) {
        if (error.code === 'P2002') {
            return { success: false, error: 'Subject code already exists' }
        }
        return { success: false, error: 'Failed to update Subject' }
    }
}

export async function deleteSubject(id: string) {
    try {
        await prisma.subject.delete({ where: { id } })
        revalidatePath('/qa/subjects')
        return { success: true }
    } catch {
        return { success: false, error: 'Failed to delete Subject. It might still be in use.' }
    }
}

