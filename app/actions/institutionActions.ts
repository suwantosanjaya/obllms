'use server'

import prisma from '@/lib/db'
import { revalidatePath } from 'next/cache'

// ─── University ────────────────────────────────────────────────
export async function getUniversityList() {
    try {
        const list = await prisma.university.findMany({
            orderBy: { name: 'asc' },
            include: { faculties: { orderBy: { name: 'asc' } } }
        })
        return { success: true, universityList: list }
    } catch {
        return { success: false, error: 'Failed to load Universities' }
    }
}

export async function createUniversity(data: { code: string; name: string }) {
    try {
        const university = await prisma.university.create({ data })
        revalidatePath('/admin/institutions')
        return { success: true, university }
    } catch (error: any) {
        if (error.code === 'P2002') {
            return { success: false, error: 'University code already exists' }
        }
        return { success: false, error: 'Failed to create University' }
    }
}

export async function updateUniversity(id: string, data: { code: string; name: string }) {
    try {
        const university = await prisma.university.update({ where: { id }, data })
        revalidatePath('/admin/institutions')
        return { success: true, university }
    } catch (error: any) {
        if (error.code === 'P2002') {
            return { success: false, error: 'University code already exists' }
        }
        return { success: false, error: 'Failed to update University' }
    }
}

export async function deleteUniversity(id: string) {
    try {
        const facultyCount = await prisma.faculty.count({ where: { universityId: id } })
        if (facultyCount > 0) {
            return { success: false, error: 'Cannot delete University because it still has related Faculties.' }
        }

        await prisma.university.delete({ where: { id } })
        revalidatePath('/admin/institutions')
        return { success: true }
    } catch {
        return { success: false, error: 'Failed to delete University.' }
    }
}

// ─── Faculty ────────────────────────────────────────────────
export async function getFacultyList(universityId?: string) {
    try {
        const list = await prisma.faculty.findMany({
            where: universityId ? { universityId } : undefined,
            orderBy: { name: 'asc' },
            include: { 
                departments: { orderBy: { name: 'asc' } },
                university: true
            }
        })
        return { success: true, facultyList: list }
    } catch {
        return { success: false, error: 'Failed to load Faculties' }
    }
}

export async function createFaculty(data: { code: string; name: string; universityId: string }) {
    try {
        const faculty = await prisma.faculty.create({ data })
        revalidatePath('/admin/institutions')
        return { success: true, faculty }
    } catch (error: any) {
        if (error.code === 'P2002') {
            return { success: false, error: 'Faculty code already exists' }
        }
        return { success: false, error: 'Failed to create Faculty' }
    }
}

export async function updateFaculty(id: string, data: { code: string; name: string; universityId: string }) {
    try {
        const faculty = await prisma.faculty.update({ where: { id }, data })
        revalidatePath('/admin/institutions')
        return { success: true, faculty }
    } catch (error: any) {
        if (error.code === 'P2002') {
            return { success: false, error: 'Faculty code already exists' }
        }
        return { success: false, error: 'Failed to update Faculty' }
    }
}

export async function deleteFaculty(id: string) {
    try {
        const departmentCount = await prisma.department.count({ where: { facultyId: id } })
        const subjectCount = await prisma.subject.count({ where: { facultyId: id } })
        
        if (departmentCount > 0 || subjectCount > 0) {
            return { success: false, error: 'Cannot delete Faculty because it still has related Departments or Subjects.' }
        }

        await prisma.faculty.delete({ where: { id } })
        revalidatePath('/admin/institutions')
        return { success: true }
    } catch {
        return { success: false, error: 'Failed to delete Faculty.' }
    }
}

// ─── Department ───────────────────────────────────────────────────
export async function getDepartmentList(facultyId?: string) {
    try {
        const list = await prisma.department.findMany({
            where: facultyId ? { facultyId } : undefined,
            orderBy: { name: 'asc' },
            include: { faculty: { include: { university: true } } }
        })
        return { success: true, departmentList: list }
    } catch {
        return { success: false, error: 'Failed to load Departments' }
    }
}

export async function createDepartment(data: { code: string; name: string; facultyId: string }) {
    try {
        const department = await prisma.department.create({ data })
        revalidatePath('/admin/institutions')
        return { success: true, department }
    } catch (error: any) {
        if (error.code === 'P2002') {
            return { success: false, error: 'Department code already exists' }
        }
        return { success: false, error: 'Failed to create Department' }
    }
}

export async function updateDepartment(id: string, data: { code: string; name: string; facultyId: string }) {
    try {
        const department = await prisma.department.update({ where: { id }, data })
        revalidatePath('/admin/institutions')
        return { success: true, department }
    } catch (error: any) {
        if (error.code === 'P2002') {
            return { success: false, error: 'Department code already exists' }
        }
        return { success: false, error: 'Failed to update Department' }
    }
}

export async function deleteDepartment(id: string) {
    try {
        const subjectCount = await prisma.subject.count({ where: { departmentId: id } })
        const courseCount = await prisma.course.count({ where: { departmentId: id } })
        const gpCount = await prisma.graduateProfile.count({ where: { departmentId: id } })
        const ploCount = await prisma.programLearningOutcome.count({ where: { departmentId: id } })
        
        const userCount = await prisma.user.count({
            where: {
                departments: {
                    some: { id }
                }
            }
        })

        if (subjectCount > 0 || userCount > 0 || courseCount > 0 || gpCount > 0 || ploCount > 0) {
            return { success: false, error: 'Cannot delete Department because it is still used by Users, Courses, or Curriculums.' }
        }

        await prisma.department.delete({ where: { id } })
        revalidatePath('/admin/institutions')
        return { success: true }
    } catch {
        return { success: false, error: 'Failed to delete Department.' }
    }
}
