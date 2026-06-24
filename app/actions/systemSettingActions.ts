'use server'

import prisma from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function getSystemSetting(key: string, defaultValue: string = '', universityId?: string | null) {
    try {
        const setting = await prisma.systemSetting.findFirst({
            where: { 
                key,
                universityId: universityId || null 
            }
        })
        if (setting) return setting.value;

        // Fallback to global if university-specific is not found
        if (universityId) {
            const globalSetting = await prisma.systemSetting.findFirst({
                where: { key, universityId: null }
            })
            if (globalSetting) return globalSetting.value;
        }

        return defaultValue
    } catch {
        return defaultValue
    }
}

export async function setSystemSetting(key: string, value: string, universityId?: string | null) {
    try {
        const uid = universityId || null;
        
        // Find existing record
        const existing = await prisma.systemSetting.findFirst({
            where: { key, universityId: uid }
        })
        
        if (existing) {
            await prisma.systemSetting.update({
                where: { id: existing.id },
                data: { value }
            })
        } else {
            await prisma.systemSetting.create({
                data: { key, value, universityId: uid }
            })
        }
        
        revalidatePath('/admin/settings')
        revalidatePath('/student/assessments')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

export async function getAcademicYearsList(universityId?: string | null) {
    try {
        const setting = await prisma.systemSetting.findFirst({
            where: { 
                key: 'ACADEMIC_YEARS',
                universityId: universityId || null
            }
        })
        if (setting && setting.value) {
            return JSON.parse(setting.value) as string[]
        }
        
        // Fallback to global if not found
        if (universityId) {
            const globalSetting = await prisma.systemSetting.findFirst({
                where: { key: 'ACADEMIC_YEARS', universityId: null }
            })
            if (globalSetting && globalSetting.value) {
                return JSON.parse(globalSetting.value) as string[]
            }
        }
    } catch {}
    
    // Default fallback if not found
    return ["2023/2024", "2024/2025", "2025/2026", "2026/2027", "2027/2028"]
}
