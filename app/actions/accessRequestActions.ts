'use server'

import prisma from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function createAccessRequest(userId: string, departmentId: string) {
    try {
        // Check if user already has access
        const existingRole = await prisma.userDepartmentRole.findUnique({
            where: {
                userId_departmentId_role: {
                    userId,
                    departmentId,
                    role: 'teacher'
                }
            }
        })

        if (existingRole) {
            return { success: false, error: 'Anda sudah memiliki akses ke departemen ini.' }
        }

        // Check if request already pending
        const existingRequest = await prisma.departmentAccessRequest.findFirst({
            where: {
                userId,
                departmentId,
                status: 'PENDING'
            }
        })

        if (existingRequest) {
            return { success: false, error: 'Anda sudah mengajukan akses untuk departemen ini dan sedang menunggu persetujuan.' }
        }

        const request = await prisma.departmentAccessRequest.create({
            data: {
                userId,
                departmentId,
                role: 'teacher',
                status: 'PENDING'
            }
        })

        revalidatePath('/teacher')
        return { success: true, request }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

export async function getPendingAccessRequests(departmentId: string) {
    try {
        const requests = await prisma.departmentAccessRequest.findMany({
            where: {
                departmentId,
                status: 'PENDING'
            },
            include: {
                user: {
                    include: {
                        teacherProfile: true,
                        homebaseDepartment: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return { success: true, requests }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

export async function processAccessRequest(requestId: string, action: 'APPROVED' | 'REJECTED') {
    try {
        const request = await prisma.departmentAccessRequest.findUnique({
            where: { id: requestId }
        })

        if (!request) return { success: false, error: 'Request tidak ditemukan' }

        if (action === 'APPROVED') {
            // Give access
            await prisma.$transaction([
                prisma.departmentAccessRequest.update({
                    where: { id: requestId },
                    data: { status: 'APPROVED' }
                }),
                prisma.userDepartmentRole.create({
                    data: {
                        userId: request.userId,
                        departmentId: request.departmentId,
                        role: request.role
                    }
                }),
                prisma.user.update({
                    where: { id: request.userId },
                    data: {
                        departments: {
                            connect: { id: request.departmentId }
                        }
                    }
                })
            ])
        } else {
            // Reject
            await prisma.departmentAccessRequest.update({
                where: { id: requestId },
                data: { status: 'REJECTED' }
            })
        }

        revalidatePath('/approvals')
        return { success: true }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

export async function getUserAccessRequests(userId: string) {
    try {
        const requests = await prisma.departmentAccessRequest.findMany({
            where: { userId },
            include: { department: { include: { faculty: { include: { university: true } } } } },
            orderBy: { createdAt: 'desc' }
        })
        return { success: true, requests }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}
