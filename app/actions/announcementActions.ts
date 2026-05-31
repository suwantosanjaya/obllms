'use server'

import prisma from '@/lib/db'
import { getSessionUser } from '@/app/actions/userActions'
import { revalidatePath } from 'next/cache'

export async function createAnnouncement(data: {
    title: string
    content: string
    tag: string
    scope: string
    departmentId?: string | null
    isActive: boolean
}) {
    const user = await getSessionUser()
    if (!user || !['admin', 'qa'].includes(user.activeRole)) {
        return { success: false, error: 'Tidak memiliki izin.' }
    }

    // QA can only post for their own department
    const scope = user.activeRole === 'qa' ? 'department' : data.scope
    const departmentId = scope === 'department'
        ? (user.activeRole === 'qa' ? user.activeDepartmentId : data.departmentId)
        : null

    try {
        const announcement = await prisma.announcement.create({
            data: {
                title: data.title,
                content: data.content,
                tag: data.tag,
                scope,
                departmentId: departmentId || null,
                authorId: user.id,
                isActive: data.isActive,
            }
        })
        revalidatePath('/admin/announcements')
        revalidatePath('/student/community')
        return { success: true, announcement }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

export async function updateAnnouncement(id: string, data: {
    title?: string
    content?: string
    tag?: string
    scope?: string
    departmentId?: string | null
    isActive?: boolean
}) {
    const user = await getSessionUser()
    if (!user || !['admin', 'qa'].includes(user.activeRole)) {
        return { success: false, error: 'Tidak memiliki izin.' }
    }

    try {
        const existing = await prisma.announcement.findUnique({ where: { id } })
        if (!existing) return { success: false, error: 'Pengumuman tidak ditemukan.' }

        // QA can only edit their own department's announcements
        if (user.activeRole === 'qa' && existing.departmentId !== user.activeDepartmentId) {
            return { success: false, error: 'Tidak memiliki izin untuk mengedit pengumuman ini.' }
        }

        const updated = await prisma.announcement.update({
            where: { id },
            data: {
                ...data,
                departmentId: data.scope === 'global' ? null : data.departmentId,
            }
        })
        revalidatePath('/admin/announcements')
        revalidatePath('/student/community')
        return { success: true, announcement: updated }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

export async function deleteAnnouncement(id: string) {
    const user = await getSessionUser()
    if (!user || !['admin', 'qa'].includes(user.activeRole)) {
        return { success: false, error: 'Tidak memiliki izin.' }
    }

    try {
        const existing = await prisma.announcement.findUnique({ where: { id } })
        if (!existing) return { success: false, error: 'Pengumuman tidak ditemukan.' }

        if (user.activeRole === 'qa' && existing.departmentId !== user.activeDepartmentId) {
            return { success: false, error: 'Tidak memiliki izin.' }
        }

        await prisma.announcement.delete({ where: { id } })
        revalidatePath('/admin/announcements')
        revalidatePath('/student/community')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

export async function getAllAnnouncementsAdmin() {
    const user = await getSessionUser()
    if (!user || !['admin', 'qa'].includes(user.activeRole)) {
        return { success: false, error: 'Tidak memiliki izin.' }
    }

    const where = user.activeRole === 'qa'
        ? { OR: [{ scope: 'global' }, { departmentId: user.activeDepartmentId }] }
        : {}

    try {
        const announcements = await prisma.announcement.findMany({
            where,
            include: {
                author: { select: { name: true, role: true } },
                department: { select: { name: true, code: true } }
            },
            orderBy: { createdAt: 'desc' }
        })
        return { success: true, announcements }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

export async function getPublicAnnouncements(departmentId?: string | null) {
    try {
        const announcements = await prisma.announcement.findMany({
            where: {
                isActive: true,
                OR: [
                    { scope: 'global' },
                    ...(departmentId ? [{ scope: 'department', departmentId }] : [])
                ]
            },
            include: {
                author: { select: { name: true } },
                department: { select: { name: true, code: true } }
            },
            orderBy: { createdAt: 'desc' }
        })
        return { success: true, announcements }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}
