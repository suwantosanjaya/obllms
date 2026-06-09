'use server'

import prisma from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { put, del } from '@vercel/blob'

// ─── University ────────────────────────────────────────────────
export async function getUniversityList() {
    try {
        const list = await prisma.university.findMany({
            orderBy: { name: 'asc' },
            include: { 
                faculties: { orderBy: { name: 'asc' } },
                activeRector: { 
                    select: { 
                        id: true, 
                        name: true, 
                        email: true,
                        teacherProfile: { select: { gelarDepan: true, gelarBelakang: true } } 
                    } 
                }
            }
        })
        
        // Format names with titles
        const formattedList = list.map(u => {
            if (u.activeRector && u.activeRector.teacherProfile) {
                const { gelarDepan, gelarBelakang } = u.activeRector.teacherProfile;
                const prefix = gelarDepan ? `${gelarDepan} ` : '';
                const suffix = gelarBelakang ? `, ${gelarBelakang}` : '';
                (u.activeRector as any).name = `${prefix}${u.activeRector.name}${suffix}`;
            }
            return u;
        });

        return { success: true, universityList: formattedList }
    } catch {
        return { success: false, error: 'Failed to load Universities' }
    }
}

export async function createUniversity(formData: FormData) {
    try {
        const code = formData.get('code') as string
        const name = formData.get('name') as string
        const logoFile = formData.get('logoFile') as File | null

        let logo: string | undefined = undefined

        if (logoFile && logoFile.size > 0) {
            const blob = await put(logoFile.name, logoFile, { access: 'public' })
            logo = blob.url
        }

        const university = await prisma.university.create({ data: { code, name, logo } })
        revalidatePath('/admin/institutions')
        return { success: true, university }
    } catch (error: any) {
        if (error.code === 'P2002') {
            return { success: false, error: 'University code already exists' }
        }
        return { success: false, error: 'Failed to create University' }
    }
}

export async function updateUniversity(id: string, formData: FormData) {
    try {
        const code = formData.get('code') as string
        const name = formData.get('name') as string
        const logoFile = formData.get('logoFile') as File | null

        const existingUniversity = await prisma.university.findUnique({ where: { id } })
        if (!existingUniversity) {
            return { success: false, error: 'University not found' }
        }

        const dataToUpdate: any = { code, name }

        if (logoFile && logoFile.size > 0) {
            const blob = await put(logoFile.name, logoFile, { access: 'public' })
            dataToUpdate.logo = blob.url

            // Delete old logo
            if (existingUniversity.logo && existingUniversity.logo.startsWith('http')) {
                try {
                    await del(existingUniversity.logo)
                } catch (e) {
                    console.error('Failed to delete old logo:', e)
                }
            }
        }

        const university = await prisma.university.update({ where: { id }, data: dataToUpdate })
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
        const university = await prisma.university.findUnique({ where: { id } })
        if (!university) {
            return { success: false, error: 'University not found.' }
        }

        const facultyCount = await prisma.faculty.count({ where: { universityId: id } })
        if (facultyCount > 0) {
            return { success: false, error: 'Cannot delete University because it still has related Faculties.' }
        }

        await prisma.university.delete({ where: { id } })

        if (university.logo && university.logo.startsWith('http')) {
            try {
                await del(university.logo)
            } catch (e) {
                console.error('Failed to delete old logo:', e)
            }
        }

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
                university: true,
                activeDean: { 
                    select: { 
                        id: true, 
                        name: true, 
                        email: true,
                        teacherProfile: { select: { gelarDepan: true, gelarBelakang: true } }
                    } 
                }
            }
        })
        
        const formattedList = list.map(f => {
            if (f.activeDean && f.activeDean.teacherProfile) {
                const { gelarDepan, gelarBelakang } = f.activeDean.teacherProfile;
                const prefix = gelarDepan ? `${gelarDepan} ` : '';
                const suffix = gelarBelakang ? `, ${gelarBelakang}` : '';
                (f.activeDean as any).name = `${prefix}${f.activeDean.name}${suffix}`;
            }
            return f;
        });

        return { success: true, facultyList: formattedList }
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
            include: { 
                faculty: { include: { university: true } },
                activeHead: { 
                    select: { 
                        id: true, 
                        name: true, 
                        email: true,
                        teacherProfile: { select: { gelarDepan: true, gelarBelakang: true } }
                    } 
                }
            }
        })
        
        const formattedList = list.map(d => {
            if (d.activeHead && d.activeHead.teacherProfile) {
                const { gelarDepan, gelarBelakang } = d.activeHead.teacherProfile;
                const prefix = gelarDepan ? `${gelarDepan} ` : '';
                const suffix = gelarBelakang ? `, ${gelarBelakang}` : '';
                (d.activeHead as any).name = `${prefix}${d.activeHead.name}${suffix}`;
            }
            return d;
        });

        return { success: true, departmentList: formattedList }
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
