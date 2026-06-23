'use server'

import prisma from '@/lib/db'
import { getSessionUser } from './userActions'

export async function getTrainingModules() {
    try {
        const user = await getSessionUser()
        if (!user || (user.activeRole !== 'teacher' && user.activeRole !== 'qa' && user.activeRole !== 'head_of_department')) return { success: false, error: 'Akses ditolak (Unauthorized)' }

        const modules = await prisma.trainingModule.findMany({
            where: { isActive: true },
            include: { category: true },
            orderBy: { createdAt: 'desc' }
        })

        // Seed default if empty
        if (modules.length === 0) {
            const oblCat = await prisma.trainingCategory.create({ data: { name: 'Metodologi OBL' } })
            const sysCat = await prisma.trainingCategory.create({ data: { name: 'Penggunaan Sistem' } })
            const pedCat = await prisma.trainingCategory.create({ data: { name: 'Pedagogi' } })

            const defaultModules = [
                {
                    title: 'Pengantar Outcome-Based Education (OBE)',
                    description: 'Pelajari dasar-dasar OBE dan mengapa institusi kita beralih ke pendekatan ini. Panduan lengkap merancang Capaian Pembelajaran Lulusan (CPL) dan Mata Kuliah (CPMK).',
                    categoryId: oblCat.id,
                    mediaUrl: 'https://www.youtube.com/embed/ScMzIvxBSi4',
                    mediaType: 'VIDEO'
                },
                {
                    title: 'Cara Menggunakan OLIMS untuk Grading',
                    description: 'Tutorial komprehensif cara melakukan penilaian multi-dimensi per CLO, serta menggunakan fitur SCL (Student-Centered Learning) Assessment.',
                    categoryId: sysCat.id,
                    mediaUrl: 'https://www.youtube.com/embed/ScMzIvxBSi4',
                    mediaType: 'VIDEO'
                },
                {
                    title: 'Membangun Asesmen Autentik (Authentic Assessment)',
                    description: 'Strategi membuat tugas dan rubrik penilaian yang valid mengukur kompetensi teknis maupun non-teknis mahasiswa sesuai kebutuhan industri.',
                    categoryId: pedCat.id,
                    mediaUrl: 'https://www.youtube.com/embed/ScMzIvxBSi4',
                    mediaType: 'VIDEO'
                }
            ]
            await prisma.trainingModule.createMany({ data: defaultModules })
            const refreshed = await prisma.trainingModule.findMany({
                where: { isActive: true },
                include: { category: true },
                orderBy: { createdAt: 'desc' }
            })
            return { success: true, modules: refreshed }
        }

        return { success: true, modules }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

import { revalidatePath } from 'next/cache'

export async function getTrainingCategories() {
    try {
        const categories = await prisma.trainingCategory.findMany({
            orderBy: { name: 'asc' }
        })
        return { success: true, categories }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

export async function createTrainingCategory(name: string) {
    try {
        const user = await getSessionUser()
        if (!user || user.activeRole !== 'qa') return { success: false, error: 'Akses ditolak (Unauthorized)' }

        const category = await prisma.trainingCategory.create({
            data: { name }
        })
        return { success: true, category }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

export async function createTrainingModule(data: { title: string, description: string, categoryId: string, mediaUrl?: string, mediaType: string }) {
    try {
        const user = await getSessionUser()
        if (!user || user.activeRole !== 'qa') return { success: false, error: 'Akses ditolak (Unauthorized)' }

        const module = await prisma.trainingModule.create({
            data: {
                title: data.title,
                description: data.description,
                categoryId: data.categoryId,
                mediaUrl: data.mediaUrl || null,
                mediaType: data.mediaType,
                isActive: true
            },
            include: { category: true }
        })
        
        revalidatePath('/qa/training')
        revalidatePath('/teacher/training')
        return { success: true, module }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

export async function updateTrainingModule(id: string, data: { title: string, description: string, categoryId: string, mediaUrl?: string, mediaType: string, isActive?: boolean }) {
    try {
        const user = await getSessionUser()
        if (!user || user.activeRole !== 'qa') return { success: false, error: 'Akses ditolak (Unauthorized)' }

        const module = await prisma.trainingModule.update({
            where: { id },
            data: {
                title: data.title,
                description: data.description,
                categoryId: data.categoryId,
                mediaUrl: data.mediaUrl || null,
                mediaType: data.mediaType,
                ...(data.isActive !== undefined ? { isActive: data.isActive } : {})
            },
            include: { category: true }
        })
        
        revalidatePath('/qa/training')
        revalidatePath('/teacher/training')
        return { success: true, module }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

export async function deleteTrainingModule(id: string) {
    try {
        const user = await getSessionUser()
        if (!user || user.activeRole !== 'qa') return { success: false, error: 'Akses ditolak (Unauthorized)' }

        await prisma.trainingModule.delete({ where: { id } })
        
        revalidatePath('/qa/training')
        revalidatePath('/teacher/training')
        return { success: true }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}
