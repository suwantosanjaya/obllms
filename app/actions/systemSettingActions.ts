'use server'

import prisma from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function getSystemSetting(key: string, defaultValue: string = '') {
    try {
        const setting = await prisma.systemSetting.findUnique({
            where: { key }
        })
        return setting ? setting.value : defaultValue
    } catch {
        return defaultValue
    }
}

export async function setSystemSetting(key: string, value: string) {
    try {
        await prisma.systemSetting.upsert({
            where: { key },
            update: { value },
            create: { key, value }
        })
        revalidatePath('/admin/settings')
        revalidatePath('/student/assessments')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

export async function getAcademicYearsList() {
    try {
        const setting = await prisma.systemSetting.findUnique({
            where: { key: 'ACADEMIC_YEARS' }
        })
        if (setting && setting.value) {
            return JSON.parse(setting.value) as string[]
        }
    } catch {}
    
    // Default fallback if not found
    return ["2023/2024", "2024/2025", "2025/2026", "2026/2027", "2027/2028"]
}
