'use server'

import prisma from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { createUser } from '@/app/actions/adminActions'

export async function getDepartmentTeachers(departmentId: string) {
    try {
        const teachers = await prisma.user.findMany({
            where: {
                role: { contains: 'teacher' },
                OR: [
                    { homebaseDepartmentId: departmentId },
                    { departmentRoles: { some: { departmentId, role: 'teacher' } } }
                ]
            },
            include: {
                teacherProfile: true,
                _count: {
                    select: { courses: true }
                }
            },
            orderBy: { name: 'asc' }
        })

        return { success: true, teachers }
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message, teachers: [] }
    }
}

export async function createTeacherForDepartment(data: {
    name: string
    email: string
    departmentId: string
}) {
    try {
        const res = await createUser({
            name: data.name,
            email: data.email,
            managedRolesData: [{ role: 'teacher', departmentIds: [data.departmentId] }]
        })
        if (!res.success) return { success: false, error: res.error }
        revalidatePath('/qa/teachers')
        return { success: true }
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message }
    }
}

export async function updateQATeacherProfile(
    userId: string,
    data: {
        name?: string
        nidn?: string
        nip?: string
        gelarDepan?: string
        gelarBelakang?: string
        isDlb?: boolean
    }
) {
    try {
        const { name, nidn, nip, gelarDepan, gelarBelakang, isDlb } = data

        await prisma.user.update({
            where: { id: userId },
            data: {
                ...(name ? { name } : {}),
                teacherProfile: {
                    upsert: {
                        create: {
                            nidn: nidn || null,
                            nip: nip || null,
                            gelarDepan: gelarDepan || null,
                            gelarBelakang: gelarBelakang || null,
                            isDlb: isDlb ?? false,
                        },
                        update: {
                            nidn: nidn || null,
                            nip: nip || null,
                            gelarDepan: gelarDepan || null,
                            gelarBelakang: gelarBelakang || null,
                            isDlb: isDlb ?? false,
                        }
                    }
                }
            }
        })

        revalidatePath('/qa/teachers')
        return { success: true }
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message }
    }
}
