'use server'

import prisma from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function getDepartmentStudents(departmentId: string) {
    try {
        const students = await prisma.user.findMany({
            where: {
                role: { contains: 'student' },
                OR: [
                    { homebaseDepartmentId: departmentId },
                    { departmentRoles: { some: { departmentId: departmentId } } }
                ]
            },
            include: {
                studentProfile: true,
                homebaseDepartment: { select: { id: true, name: true, code: true } }
            },
            orderBy: { name: 'asc' }
        })

        return { success: true, students }
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message }
    }
}

export async function getFacultyStudents(facultyId: string) {
    try {
        const students = await prisma.user.findMany({
            where: {
                role: { contains: 'student' },
                OR: [
                    { homebaseDepartment: { facultyId } },
                    { departmentRoles: { some: { department: { facultyId } } } }
                ]
            },
            include: {
                studentProfile: true,
                homebaseDepartment: { select: { id: true, name: true, code: true } }
            },
            orderBy: { name: 'asc' }
        })

        return { success: true, students }
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message }
    }
}

export async function updateQAStudentProfile(
    userId: string, 
    data: { 
        nim?: string, 
        angkatan?: number, 
        jenisKelamin?: string, 
        alamat?: string 
    }
) {
    try {
        const { nim, angkatan, jenisKelamin, alamat } = data

        await prisma.user.update({
            where: { id: userId },
            data: {
                studentProfile: {
                    upsert: {
                        create: { 
                            nim: nim || null, 
                            angkatan: angkatan || null,
                            jenisKelamin: jenisKelamin || null,
                            alamat: alamat || null
                        },
                        update: { 
                            nim: nim || null, 
                            angkatan: angkatan || null,
                            jenisKelamin: jenisKelamin || null,
                            alamat: alamat || null
                        }
                    }
                }
            }
        })

        revalidatePath('/qa/students')
        return { success: true }
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message }
    }
}
