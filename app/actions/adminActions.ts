'use server'

import prisma from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function getAllUsers() {
    return await prisma.user.findMany({
        orderBy: { createdAt: 'desc' }
    })
}

export async function createUser(data: { name: string; email: string; role: string; departmentIds?: string[] }) {
    try {
        const user = await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                role: data.role.toLowerCase(),
                departments: data.departmentIds && data.departmentIds.length > 0 ? {
                    connect: data.departmentIds.map(id => ({ id }))
                } : undefined,
                departmentRoles: data.departmentIds && data.departmentIds.length > 0 ? {
                    create: data.role.split(',').flatMap(role => 
                        data.departmentIds!.map(departmentId => ({
                            departmentId,
                            role: role.trim().toLowerCase()
                        }))
                    )
                } : undefined
            }
        })
        revalidatePath('/admin/users')
        revalidatePath('/super_admin/users')
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
        revalidatePath('/super_admin/users')
        return { success: true }
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message }
    }
}

export async function getCurriculumYears() {
    return await prisma.curriculumYear.findMany({
        orderBy: { name: 'desc' }
    })
}

export async function createCurriculumYear(name: string, startYear?: number, endYear?: number) {
    try {
        const cy = await prisma.curriculumYear.create({
            data: { name, startYear, endYear }
        })
        revalidatePath('/admin/settings')
        revalidatePath('/qa/curriculum')
        return { success: true, curriculumYear: cy }
    } catch (error: any) {
        if (error.code === 'P2002') return { success: false, error: 'Tahun kurikulum sudah ada' }
        return { success: false, error: error.message }
    }
}

export async function setActiveCurriculumYear(id: string) {
    try {
        // Unset all first
        await prisma.curriculumYear.updateMany({
            data: { isActive: false }
        })
        // Set the active one
        await prisma.curriculumYear.update({
            where: { id },
            data: { isActive: true }
        })
        revalidatePath('/admin/settings')
        revalidatePath('/qa/curriculum')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

import { getSessionUser } from './userActions'

export async function toggleUserStatus(targetUserId: string) {
    try {
        const caller = await getSessionUser()
        if (!caller) return { success: false, error: 'Unauthorized' }

        const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } })
        if (!targetUser) return { success: false, error: 'User not found' }

        // Hierarchy rules
        const callerRole = caller.activeRole || caller.role
        // A user might have multiple roles, we check if the caller can manage ALL their roles.
        // For simplicity, we just check if they are trying to manage someone with roles they can't touch.
        const targetRoles = targetUser.role.split(',')

        let canToggle = true
        for (const tr of targetRoles) {
            if (callerRole === 'super_admin' && tr !== 'admin') {
                canToggle = false
            } else if (callerRole === 'admin' && !['qa', 'teacher', 'student'].includes(tr)) {
                canToggle = false
            } else if (callerRole === 'qa' && !['teacher', 'student'].includes(tr)) {
                canToggle = false
            } else if (callerRole === 'teacher' || callerRole === 'student') {
                canToggle = false
            }
        }

        if (!canToggle) {
            return { success: false, error: 'Anda tidak memiliki izin untuk mengubah status user ini.' }
        }

        await prisma.user.update({
            where: { id: targetUserId },
            data: { isActive: !targetUser.isActive }
        })

        revalidatePath('/admin/users')
        revalidatePath('/super_admin/users')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

export async function updateUserRole(targetUserId: string, newRole: string) {
    try {
        const caller = await getSessionUser()
        if (!caller) return { success: false, error: 'Unauthorized' }

        const targetUser = await prisma.user.findUnique({ 
            where: { id: targetUserId },
            include: { departments: true }
        })
        if (!targetUser) return { success: false, error: 'User not found' }

        const callerRole = caller.activeRole || caller.role
        const newRoles = newRole.split(',')

        // Hierarchy rule: Caller can only update to roles they can manage
        let canEdit = true
        for (const nr of newRoles) {
            if (callerRole === 'super_admin' && nr !== 'admin') {
                canEdit = false
            } else if (callerRole === 'admin' && !['qa', 'teacher', 'student'].includes(nr)) {
                canEdit = false
            } else if (callerRole === 'qa' || callerRole === 'teacher' || callerRole === 'student') {
                canEdit = false
            }
        }

        if (!canEdit) {
            return { success: false, error: 'Anda tidak memiliki izin untuk menetapkan peran ini.' }
        }

        await prisma.user.update({
            where: { id: targetUserId },
            data: { 
                role: newRole,
                departmentRoles: {
                    deleteMany: {},
                    create: newRoles.flatMap(role => 
                        targetUser.departments.map(d => ({
                            departmentId: d.id,
                            role: role.trim().toLowerCase()
                        }))
                    )
                }
            }
        })

        revalidatePath('/admin/users')
        revalidatePath('/super_admin/users')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

// Get all departments with their active heads
export async function getDepartmentsWithHeads() {
    return await prisma.department.findMany({
        include: {
            activeHead: {
                select: { id: true, name: true, email: true }
            }
        },
        orderBy: { name: 'asc' }
    })
}

// Get users who can be appointed as head of department for a specific department
export async function getHeadOfDepartmentCandidates(departmentId: string) {
    return await prisma.user.findMany({
        where: {
            departmentRoles: {
                some: {
                    role: 'teacher'
                }
            },
            headedDepartments: {
                none: {
                    id: { not: departmentId }
                }
            },
            isActive: true
        },
        select: { id: true, name: true, email: true }
    })
}

// Assign an active head to a department
export async function assignDepartmentHead(departmentId: string, userId: string | null, startYear?: number, endYear?: number, appointmentDate?: string) {
    try {
        if (userId) {
            // Validate: One teacher can only be head of one department
            const existingHead = await prisma.department.findFirst({
                where: {
                    activeHeadId: userId,
                    id: { not: departmentId }
                }
            })
            if (existingHead) {
                return { success: false, error: `Dosen ini sudah menjabat sebagai Ketua di Departemen ${existingHead.name} (${existingHead.code}).` }
            }

            // Ensure the user has the global role
            const user = await prisma.user.findUnique({ where: { id: userId } })
            if (user && !user.role.includes('head_of_department')) {
                await prisma.user.update({
                    where: { id: userId },
                    data: { role: `${user.role},head_of_department` }
                })
            }
            
            // Ensure they have the department role
            const existingRole = await prisma.userDepartmentRole.findUnique({
                where: { userId_departmentId_role: { userId, departmentId, role: 'head_of_department' } }
            })
            if (!existingRole) {
                await prisma.userDepartmentRole.create({
                    data: { userId, departmentId, role: 'head_of_department' }
                })
            }
        }

        // Handle history and role revocation
        const previousHistories = await prisma.departmentHeadHistory.findMany({
            where: { departmentId, isActive: true }
        })
        const previousHeadIds = previousHistories.map(h => h.userId)

        if (userId && startYear && endYear) {
            // Deactivate previous active histories for this department
            await prisma.departmentHeadHistory.updateMany({
                where: { departmentId, isActive: true },
                data: { isActive: false }
            })
            // Create new active history
            await prisma.departmentHeadHistory.create({
                data: {
                    departmentId,
                    userId,
                    startYear,
                    endYear,
                    appointmentDate: appointmentDate ? new Date(appointmentDate) : new Date(),
                    isActive: true
                }
            })
        } else if (!userId) {
            // If clearing the head, deactivate current history
            await prisma.departmentHeadHistory.updateMany({
                where: { departmentId, isActive: true },
                data: { isActive: false }
            })
        }

        await prisma.department.update({
            where: { id: departmentId },
            data: { activeHeadId: userId }
        })

        // Revoke role for previous heads if no longer serving
        for (const prevId of previousHeadIds) {
            if (prevId === userId) continue

            const stillHeadElsewhere = await prisma.department.findFirst({
                where: { activeHeadId: prevId }
            })
            if (!stillHeadElsewhere) {
                await prisma.userDepartmentRole.deleteMany({
                    where: { userId: prevId, role: 'head_of_department' }
                })
                const prevUser = await prisma.user.findUnique({ where: { id: prevId } })
                if (prevUser) {
                    const newRoles = prevUser.role.split(',').map(r => r.trim()).filter(r => r !== 'head_of_department')
                    await prisma.user.update({
                        where: { id: prevId },
                        data: { role: newRoles.join(',') }
                    })
                }
            }
        }

        revalidatePath('/admin/department-heads')
        revalidatePath('/qa/curriculum')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

// Get the history of heads for a department
export async function getDepartmentHeadHistory(departmentId: string) {
    return await prisma.departmentHeadHistory.findMany({
        where: { departmentId },
        include: {
            user: { select: { id: true, name: true, email: true } }
        },
        orderBy: { createdAt: 'desc' }
    })
}
