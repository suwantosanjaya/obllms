'use server'

import prisma from '@/lib/db'
import { getSessionUser } from './userActions'
import { revalidatePath } from 'next/cache'

export async function getStudentTickets() {
    try {
        const user = await getSessionUser()
        if (!user || user.activeRole !== 'student') return { success: false, error: 'Akses ditolak (Unauthorized)' }

        const tickets = await prisma.helpdeskTicket.findMany({
            where: { studentId: user.id },
            include: {
                replier: {
                    select: { name: true, role: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        return { success: true, tickets }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

export async function createTicket(subject: string, message: string) {
    try {
        const user = await getSessionUser()
        if (!user || user.activeRole !== 'student') return { success: false, error: 'Akses ditolak (Unauthorized)' }

        const ticket = await prisma.helpdeskTicket.create({
            data: {
                studentId: user.id,
                subject,
                message,
                status: 'OPEN'
            }
        })

        revalidatePath('/student/support')
        return { success: true, ticket }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

export async function getAllTickets(departmentId?: string) {
    try {
        const user = await getSessionUser()
        if (!user || (user.activeRole !== 'qa' && user.activeRole !== 'admin' && user.activeRole !== 'super_admin')) {
            return { success: false, error: 'Akses ditolak (Unauthorized)' }
        }

        const whereClause: any = {}
        if (departmentId) {
            whereClause.student = { homebaseDepartmentId: departmentId }
        }

        const tickets = await prisma.helpdeskTicket.findMany({
            where: whereClause,
            include: {
                student: {
                    select: { 
                        name: true,
                        studentProfile: {
                            select: { nim: true }
                        }
                    }
                },
                replier: {
                    select: { name: true, role: true }
                }
            },
            orderBy: [
                { status: 'desc' }, // 'OPEN' comes after 'CLOSED' alphabetically, wait actually OPEN is 'O', CLOSED is 'C'. So 'desc' means OPEN then CLOSED.
                { createdAt: 'desc' }
            ]
        })

        return { success: true, tickets }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

export async function replyTicket(id: string, replyMessage: string) {
    try {
        const user = await getSessionUser()
        if (!user || (user.activeRole !== 'qa' && user.activeRole !== 'admin' && user.activeRole !== 'super_admin')) {
            return { success: false, error: 'Akses ditolak (Unauthorized)' }
        }

        const ticket = await prisma.helpdeskTicket.update({
            where: { id },
            data: {
                replyMessage,
                repliedById: user.id,
                status: 'CLOSED'
            }
        })

        revalidatePath('/qa/support')
        revalidatePath('/admin/support')
        return { success: true, ticket }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}
