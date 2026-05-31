'use server'

import prisma from '@/lib/db'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'

export async function getAllUsers() {
    return await prisma.user.findMany({
        include: { departments: true, departmentRoles: true },
        orderBy: { createdAt: 'desc' }
    })
}

export async function createUser(data: {
    name: string;
    email: string;
    managedRolesData: { role: string, departmentIds: string[] }[]
}) {
    try {
        const hashedPassword = await bcrypt.hash("123456", 10)

        const finalRolesArray = data.managedRolesData.map(d => d.role)
        const roleString = finalRolesArray.join(',')

        const finalDeptRoles = data.managedRolesData.flatMap(d =>
            d.departmentIds.map(depId => ({
                departmentId: depId,
                role: d.role
            }))
        )

        const distinctDeptIds = Array.from(new Set(finalDeptRoles.map(dr => dr.departmentId)))

        const user = await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashedPassword,
                mustChangePassword: true,
                role: roleString.toLowerCase(),
                departments: distinctDeptIds.length > 0 ? {
                    connect: distinctDeptIds.map(id => ({ id }))
                } : undefined,
                departmentRoles: finalDeptRoles.length > 0 ? {
                    create: finalDeptRoles.map(dr => ({
                        departmentId: dr.departmentId,
                        role: dr.role.toLowerCase()
                    }))
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
        // Pre-check: jika user masih mengampu kelas, tolak dengan pesan jelas
        const activeCourses = await prisma.course.count({ where: { instructorId: id } })
        if (activeCourses > 0) {
            return {
                success: false,
                error: `Tidak dapat menghapus pengguna ini karena masih mengampu ${activeCourses} kelas. Pindahkan instruktur kelas tersebut terlebih dahulu.`
            }
        }

        await prisma.$transaction(async (tx) => {
            // Lepas jabatan ketua departemen jika aktif
            await tx.department.updateMany({
                where: { activeHeadId: id },
                data: { activeHeadId: null }
            })
            // Hapus riwayat kepala departemen
            await tx.departmentHeadHistory.deleteMany({ where: { userId: id } })
            // Hapus feedback
            await tx.feedback.deleteMany({ where: { userId: id } })
            // Hapus activity log
            await tx.activityLog.deleteMany({ where: { userId: id } })
            // Hapus user (relasi Cascade: profile, departmentRoles, enrollments, submissions, dll.)
            await tx.user.delete({ where: { id } })
        })

        revalidatePath('/admin/users')
        revalidatePath('/super_admin/users')
        revalidatePath('/qa/teachers')
        return { success: true }
    } catch (error: unknown) {
        console.error('[deleteUser error]', (error as Error).message)
        return { success: false, error: 'Gagal menghapus pengguna. Pastikan semua data terkait sudah dibersihkan terlebih dahulu.' }
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

export async function updateUserRole(
    targetUserId: string,
    managedRolesData: { role: string, departmentIds: string[] }[]
) {
    try {
        const caller = await getSessionUser()
        if (!caller) return { success: false, error: 'Unauthorized' }

        const targetUser = await prisma.user.findUnique({
            where: { id: targetUserId },
            include: { departments: true, departmentRoles: true }
        })
        if (!targetUser) return { success: false, error: 'User not found' }

        const callerRole = caller.activeRole || caller.role

        // Define which roles the caller can manage
        let allowedToManage: string[] = []
        if (callerRole === 'super_admin') allowedToManage = ['admin', 'qa', 'teacher', 'student']
        else if (callerRole === 'admin') allowedToManage = ['qa', 'teacher', 'student']

        if (allowedToManage.length === 0) {
            return { success: false, error: 'Anda tidak memiliki izin untuk mengelola peran.' }
        }

        // Separate user's existing roles into managed vs unmanaged
        const existingRolesArray = targetUser.role.split(',').map(r => r.trim()).filter(Boolean)
        const unmanagedRoles = existingRolesArray.filter(r => !allowedToManage.includes(r))
        const existingUnmanagedDeptRoles = targetUser.departmentRoles.filter(dr => !allowedToManage.includes(dr.role))

        // Process the new managed roles from the payload
        const newManagedRoles = managedRolesData.map(d => d.role)

        // Check if payload contains any role the caller shouldn't manage
        for (const nr of newManagedRoles) {
            if (!allowedToManage.includes(nr)) {
                return { success: false, error: `Anda tidak memiliki izin untuk menetapkan peran: ${nr}` }
            }
        }

        // Final roles array: unmanaged + new managed
        const finalRolesArray = [...new Set([...unmanagedRoles, ...newManagedRoles])]
        const newRoleString = finalRolesArray.join(',')

        // Final departmentRoles
        const newManagedDeptRoles = managedRolesData.flatMap(d =>
            d.departmentIds.map(depId => ({
                departmentId: depId,
                role: d.role
            }))
        )
        const finalDeptRoles = [...existingUnmanagedDeptRoles, ...newManagedDeptRoles]

        // Collect distinct department IDs
        const distinctDeptIds = Array.from(new Set(finalDeptRoles.map(dr => dr.departmentId)))

        await prisma.user.update({
            where: { id: targetUserId },
            data: {
                role: newRoleString,
                departments: {
                    set: distinctDeptIds.map(id => ({ id }))
                },
                departmentRoles: {
                    deleteMany: {},
                    create: finalDeptRoles.map(dr => ({
                        departmentId: dr.departmentId,
                        role: dr.role
                    }))
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
            role: { contains: 'teacher' },
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
