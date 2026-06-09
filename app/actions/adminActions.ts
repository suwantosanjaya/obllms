'use server'

import prisma from '@/lib/db'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'
import os from 'os'

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
            // Lepas jabatan ketua program studi jika aktif
            await tx.department.updateMany({
                where: { activeHeadId: id },
                data: { activeHeadId: null }
            })
            // Hapus riwayat kepala program studi
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
        if (!caller) return { success: false, error: 'Akses ditolak (Unauthorized)' }

        const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } })
        if (!targetUser) return { success: false, error: 'Pengguna tidak ditemukan' }

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
            return { success: false, error: 'Anda tidak memiliki izin untuk mengubah status Pengguna ini.' }
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
        if (!caller) return { success: false, error: 'Akses ditolak (Unauthorized)' }

        const targetUser = await prisma.user.findUnique({
            where: { id: targetUserId },
            include: { departments: true, departmentRoles: true }
        })
        if (!targetUser) return { success: false, error: 'Pengguna tidak ditemukan' }

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
    const users = await prisma.user.findMany({
        where: {
            role: { contains: 'teacher' },
            isActive: true,
            headedFaculties: { none: {} },
            headedUniversities: { none: {} },
            headedDepartments: {
                none: {
                    id: { not: departmentId }
                }
            }
        },
        select: { 
            id: true, 
            name: true, 
            email: true,
            teacherProfile: { select: { gelarDepan: true, gelarBelakang: true } }
        }
    })
    
    return users.map(u => {
        let titleName = u.name;
        if (u.teacherProfile) {
            const { gelarDepan, gelarBelakang } = u.teacherProfile;
            const prefix = gelarDepan ? `${gelarDepan} ` : '';
            const suffix = gelarBelakang ? `, ${gelarBelakang}` : '';
            titleName = `${prefix}${u.name}${suffix}`;
        }
        return {
            id: u.id,
            name: titleName,
            originalName: u.name,
            email: u.email
        };
    });
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
                return { success: false, error: `Dosen ini sudah menjabat sebagai Ketua di Program Studi ${existingHead.name} (${existingHead.code}).` }
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
    const list = await prisma.departmentHeadHistory.findMany({
        where: { departmentId },
        include: {
            user: { 
                select: { 
                    id: true, 
                    name: true, 
                    email: true,
                    teacherProfile: { select: { gelarDepan: true, gelarBelakang: true } }
                } 
            }
        },
        orderBy: { createdAt: 'desc' }
    })

    return list.map(h => {
        if (h.user && h.user.teacherProfile) {
            const { gelarDepan, gelarBelakang } = h.user.teacherProfile;
            const prefix = gelarDepan ? `${gelarDepan} ` : '';
            const suffix = gelarBelakang ? `, ${gelarBelakang}` : '';
            (h.user as any).name = `${prefix}${h.user.name}${suffix}`;
        }
        return h;
    });
}

// ---------------------------------------------
// FACULTY DEAN (DEKAN) MANAGEMENT
// ---------------------------------------------

export async function getDeanCandidates(facultyId: string) {
    const users = await prisma.user.findMany({
        where: {
            role: { contains: 'teacher' },
            isActive: true,
            headedDepartments: { none: {} },
            headedUniversities: { none: {} },
            headedFaculties: {
                none: {
                    id: { not: facultyId }
                }
            }
        },
        select: { 
            id: true, 
            name: true, 
            email: true,
            teacherProfile: { select: { gelarDepan: true, gelarBelakang: true } }
        }
    })
    
    return users.map(u => {
        let titleName = u.name;
        if (u.teacherProfile) {
            const { gelarDepan, gelarBelakang } = u.teacherProfile;
            const prefix = gelarDepan ? `${gelarDepan} ` : '';
            const suffix = gelarBelakang ? `, ${gelarBelakang}` : '';
            titleName = `${prefix}${u.name}${suffix}`;
        }
        return {
            id: u.id,
            name: titleName,
            originalName: u.name,
            email: u.email
        };
    });
}

export async function assignFacultyDean(facultyId: string, userId: string | null, startYear?: number, endYear?: number, appointmentDate?: string) {
    try {
        if (userId) {
            const existingDean = await prisma.faculty.findFirst({
                where: {
                    activeDeanId: userId,
                    id: { not: facultyId }
                }
            })
            if (existingDean) {
                return { success: false, error: `Dosen ini sudah menjabat sebagai Dekan di Fakultas ${existingDean.name}.` }
            }

            const user = await prisma.user.findUnique({ where: { id: userId } })
            if (user && !user.role.includes('dean')) {
                await prisma.user.update({
                    where: { id: userId },
                    data: { role: `${user.role},dean` }
                })
            }
        }

        const previousHistories = await prisma.facultyDeanHistory.findMany({
            where: { facultyId, isActive: true }
        })
        const previousDeanIds = previousHistories.map(h => h.userId)

        if (userId && startYear && endYear) {
            await prisma.facultyDeanHistory.updateMany({
                where: { facultyId, isActive: true },
                data: { isActive: false }
            })
            await prisma.facultyDeanHistory.create({
                data: {
                    facultyId,
                    userId,
                    startYear,
                    endYear,
                    appointmentDate: appointmentDate ? new Date(appointmentDate) : new Date(),
                    isActive: true
                }
            })
        } else if (!userId) {
            await prisma.facultyDeanHistory.updateMany({
                where: { facultyId, isActive: true },
                data: { isActive: false }
            })
        }

        await prisma.faculty.update({
            where: { id: facultyId },
            data: { activeDeanId: userId }
        })

        for (const prevId of previousDeanIds) {
            if (prevId === userId) continue

            const stillDeanElsewhere = await prisma.faculty.findFirst({
                where: { activeDeanId: prevId }
            })
            if (!stillDeanElsewhere) {
                const prevUser = await prisma.user.findUnique({ where: { id: prevId } })
                if (prevUser) {
                    const newRoles = prevUser.role.split(',').map(r => r.trim()).filter(r => r !== 'dean')
                    await prisma.user.update({
                        where: { id: prevId },
                        data: { role: newRoles.join(',') }
                    })
                }
            }
        }

        revalidatePath('/admin/institutions')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

export async function getFacultyDeanHistory(facultyId: string) {
    const list = await prisma.facultyDeanHistory.findMany({
        where: { facultyId },
        include: {
            user: { 
                select: { 
                    id: true, 
                    name: true, 
                    email: true,
                    teacherProfile: { select: { gelarDepan: true, gelarBelakang: true } }
                } 
            }
        },
        orderBy: { createdAt: 'desc' }
    })

    return list.map(h => {
        if (h.user && h.user.teacherProfile) {
            const { gelarDepan, gelarBelakang } = h.user.teacherProfile;
            const prefix = gelarDepan ? `${gelarDepan} ` : '';
            const suffix = gelarBelakang ? `, ${gelarBelakang}` : '';
            (h.user as any).name = `${prefix}${h.user.name}${suffix}`;
        }
        return h;
    });
}

// ---------------------------------------------
// UNIVERSITY RECTOR (REKTOR) MANAGEMENT
// ---------------------------------------------

export async function getRectorCandidates(universityId: string) {
    const users = await prisma.user.findMany({
        where: {
            role: { contains: 'teacher' },
            isActive: true,
            headedDepartments: { none: {} },
            headedFaculties: { none: {} },
            headedUniversities: {
                none: {
                    id: { not: universityId }
                }
            }
        },
        select: { 
            id: true, 
            name: true, 
            email: true,
            teacherProfile: { select: { gelarDepan: true, gelarBelakang: true } }
        }
    })
    
    return users.map(u => {
        let titleName = u.name;
        if (u.teacherProfile) {
            const { gelarDepan, gelarBelakang } = u.teacherProfile;
            const prefix = gelarDepan ? `${gelarDepan} ` : '';
            const suffix = gelarBelakang ? `, ${gelarBelakang}` : '';
            titleName = `${prefix}${u.name}${suffix}`;
        }
        return {
            id: u.id,
            name: titleName,
            originalName: u.name,
            email: u.email
        };
    });
}

export async function assignUniversityRector(universityId: string, userId: string | null, startYear?: number, endYear?: number, appointmentDate?: string) {
    try {
        if (userId) {
            const existingRector = await prisma.university.findFirst({
                where: {
                    activeRectorId: userId,
                    id: { not: universityId }
                }
            })
            if (existingRector) {
                return { success: false, error: `Dosen ini sudah menjabat sebagai Rektor di Universitas ${existingRector.name}.` }
            }

            const user = await prisma.user.findUnique({ where: { id: userId } })
            if (user && !user.role.includes('rector')) {
                await prisma.user.update({
                    where: { id: userId },
                    data: { role: `${user.role},rector` }
                })
            }
        }

        const previousHistories = await prisma.universityRectorHistory.findMany({
            where: { universityId, isActive: true }
        })
        const previousRectorIds = previousHistories.map(h => h.userId)

        if (userId && startYear && endYear) {
            await prisma.universityRectorHistory.updateMany({
                where: { universityId, isActive: true },
                data: { isActive: false }
            })
            await prisma.universityRectorHistory.create({
                data: {
                    universityId,
                    userId,
                    startYear,
                    endYear,
                    appointmentDate: appointmentDate ? new Date(appointmentDate) : new Date(),
                    isActive: true
                }
            })
        } else if (!userId) {
            await prisma.universityRectorHistory.updateMany({
                where: { universityId, isActive: true },
                data: { isActive: false }
            })
        }

        await prisma.university.update({
            where: { id: universityId },
            data: { activeRectorId: userId }
        })

        for (const prevId of previousRectorIds) {
            if (prevId === userId) continue

            const stillRectorElsewhere = await prisma.university.findFirst({
                where: { activeRectorId: prevId }
            })
            if (!stillRectorElsewhere) {
                const prevUser = await prisma.user.findUnique({ where: { id: prevId } })
                if (prevUser) {
                    const newRoles = prevUser.role.split(',').map(r => r.trim()).filter(r => r !== 'rector')
                    await prisma.user.update({
                        where: { id: prevId },
                        data: { role: newRoles.join(',') }
                    })
                }
            }
        }

        revalidatePath('/admin/institutions')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

export async function getUniversityRectorHistory(universityId: string) {
    const list = await prisma.universityRectorHistory.findMany({
        where: { universityId },
        include: {
            user: { 
                select: { 
                    id: true, 
                    name: true, 
                    email: true,
                    teacherProfile: { select: { gelarDepan: true, gelarBelakang: true } }
                } 
            }
        },
        orderBy: { createdAt: 'desc' }
    })

    return list.map(h => {
        if (h.user && h.user.teacherProfile) {
            const { gelarDepan, gelarBelakang } = h.user.teacherProfile;
            const prefix = gelarDepan ? `${gelarDepan} ` : '';
            const suffix = gelarBelakang ? `, ${gelarBelakang}` : '';
            (h.user as any).name = `${prefix}${h.user.name}${suffix}`;
        }
        return h;
    });
}

// Get global system stats for Admin Dashboard
export async function getAdminDashboardStats() {
    const [
        totalUsers,
        totalStudents,
        totalTeachers,
        totalQa,
        totalAdmins,
        totalSuperAdmins,
        totalUniversities,
        totalFaculties,
        totalDepartments
    ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: { contains: 'student' } } }),
        prisma.user.count({ where: { role: { contains: 'teacher' } } }),
        prisma.user.count({ where: { role: { contains: 'qa' } } }),
        prisma.user.count({ where: { role: { contains: 'admin' } } }),
        prisma.user.count({ where: { role: { contains: 'super_admin' } } }),
        prisma.university.count(),
        prisma.faculty.count(),
        prisma.department.count(),
    ])

    // Get Server Stats
    const uptimeInSeconds = os.uptime()
    const days = Math.floor(uptimeInSeconds / (3600 * 24))
    const hours = Math.floor((uptimeInSeconds % (3600 * 24)) / 3600)
    const minutes = Math.floor((uptimeInSeconds % 3600) / 60)
    
    let uptimeString = `${minutes}m`
    if (hours > 0) uptimeString = `${hours}j ${minutes}m`
    if (days > 0) uptimeString = `${days}h ${hours}j`

    const totalMem = os.totalmem()
    const freeMem = os.freemem()
    const usedMem = totalMem - freeMem
    const memoryUsagePercent = Math.round((usedMem / totalMem) * 100)

    const serverStatus = memoryUsagePercent > 90 ? 'Peringatan' : 'Normal'

    return {
        totalUsers,
        breakdown: {
            student: totalStudents,
            teacher: totalTeachers,
            qa: totalQa,
            admin: totalAdmins,
            super_admin: totalSuperAdmins
        },
        institutions: {
            universities: totalUniversities,
            faculties: totalFaculties,
            departments: totalDepartments
        },
        serverStats: {
            uptime: uptimeString,
            memoryUsagePercent,
            status: serverStatus
        }
    }
}
