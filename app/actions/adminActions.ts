'use server'

import prisma from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function getAllUsers() {
    return await prisma.user.findMany({
        orderBy: { createdAt: 'desc' }
    })
}

export async function createUser(data: { name: string; email: string; role: string }) {
    try {
        const user = await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                role: data.role.toLowerCase()
            }
        })
        revalidatePath('/admin/users')
        return { success: true, user }
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message }
    }
}

export async function deleteUser(id: string) {
    try {
        await prisma.user.delete({
            where: { id }
        })
        revalidatePath('/admin/users')
        return { success: true }
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message }
    }
}
