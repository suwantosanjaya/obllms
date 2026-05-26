'use server'

import prisma from '@/lib/db'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

export async function seedSimulatedUsers() {
    // If the database has missing roles, create them specifically for the login simulation
    const rolesToEnsure = [
        { email: 'budi@university.edu', name: 'Budi (Student)', role: 'student' },
        { email: 'andi@university.edu', name: 'Dr. Andi (Teacher)', role: 'teacher' },
        { email: 'siti@university.edu', name: 'Siti (QA)', role: 'qa' },
        { email: 'admin@university.edu', name: 'Department Admin', role: 'admin' },
        { email: 'super_admin@university.edu', name: 'Super Admin IT', role: 'super_admin' },
        { email: 'ketua@university.edu', name: 'Dr. Ketua (Head of Dept)', role: 'head_of_department' },
    ]

    const defaultPasswordHash = await bcrypt.hash('password123', 10)

    for (const r of rolesToEnsure) {
        const existing = await prisma.user.findFirst({ where: { role: r.role } })
        if (!existing) {
            await prisma.user.create({
                data: {
                    ...r,
                    password: defaultPasswordHash
                }
            })
        }
    }

    return { success: true, message: 'Ensured simulated users exist' }
}

export async function getUserLogin(role: string) {
    const user = await prisma.user.findFirst({
        where: { role: role.toLowerCase() }
    })
    return user
}

export async function loginWithEmail(email: string, passwordPlain: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
            include: { departments: true, departmentRoles: { include: { department: true } } }
        })

        if (!user) {
            return { success: false, error: 'User tidak ditemukan.' }
        }

        if (!user.isActive) {
            return { success: false, error: 'Akun Anda telah dinonaktifkan.' }
        }

        const isValid = await bcrypt.compare(passwordPlain, user.password)
        if (!isValid) {
            return { success: false, error: 'Password salah.' }
        }

        // Exclude password from the returned object for security
        const { password, ...userWithoutPassword } = user

        // Parse roles
        const roles = user.role.split(',').map(r => r.trim())
        const activeRole = roles[0]

        // If user is a super admin, give them access to ALL departments
        if (roles.includes('super_admin')) {
            const allDepartments = await prisma.department.findMany({
                orderBy: { name: 'asc' }
            })
            user.departments = allDepartments as any
        }

        // Set an HTTP-only cookie for server components to access
        const cookieStore = await cookies()
        cookieStore.set('userId', user.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7 // 1 week
        })

        // Set active role cookie
        cookieStore.set('activeRole', activeRole, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7
        })

        // If user has at least 1 department, set the first one as active immediately
        if (user.departments.length > 0) {
            cookieStore.set('activeDepartmentId', user.departments[0].id, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 60 * 60 * 24 * 7
            })
        }

        return { success: true, user: { ...userWithoutPassword, departments: user.departments, departmentRoles: user.departmentRoles, activeRole, roles } }
    } catch (error) {
        console.error('Login error', error)
        return { success: false, error: 'Terjadi kesalahan sistem.' }
    }
}

export async function logoutUser() {
    const cookieStore = await cookies()
    cookieStore.delete('userId')
    cookieStore.delete('activeDepartmentId')
    cookieStore.delete('activeRole')
    return { success: true }
}

export async function getSessionUser() {
    const cookieStore = await cookies()
    const userIdCookie = cookieStore.get('userId')
    if (!userIdCookie?.value) return null

    const user = await prisma.user.findUnique({
        where: { id: userIdCookie.value },
        include: { departments: true, departmentRoles: { include: { department: true } } }
    })

    if (!user) return null
    
    const activeDepartmentIdCookie = cookieStore.get('activeDepartmentId')
    let activeDepartmentId = activeDepartmentIdCookie?.value

    // Fallback: If no active department is set but user has departments, use the first one
    if (!activeDepartmentId && user.departments.length > 0) {
        activeDepartmentId = user.departments[0].id
    }

    const roles = user.role.split(',').map(r => r.trim())
    let activeRole = cookieStore.get('activeRole')?.value
    
    if (!activeRole || !roles.includes(activeRole)) {
        activeRole = roles[0]
    }

    const { password, ...userWithoutPassword } = user
    return { ...userWithoutPassword, departments: user.departments, departmentRoles: user.departmentRoles, activeDepartmentId, activeRole, roles }
}

export async function setActiveProdiCookie(departmentId: string) {
    const cookieStore = await cookies()
    cookieStore.set('activeDepartmentId', departmentId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7
    })
    return { success: true }
}

export async function setActiveRoleCookie(role: string) {
    const cookieStore = await cookies()
    cookieStore.set('activeRole', role, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7
    })
    return { success: true }
}

export async function getTeachers() {
    try {
        const teachers = await prisma.user.findMany({
            where: {
                role: { contains: 'teacher' }
            },
            select: {
                id: true,
                name: true,
                email: true
            }
        })
        return { success: true, teachers }
    } catch (error) {
        console.error('Failed to get teachers', error)
        return { success: false, error: 'Gagal mengambil data dosen' }
    }
}
