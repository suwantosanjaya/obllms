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
