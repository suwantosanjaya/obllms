'use server'

import prisma from '@/lib/db'
import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'

// --- REGISTRATION LOGIC ---
export async function getRegistrationData() {
    try {
        const universities = await prisma.university.findMany({
            include: {
                faculties: {
                    include: {
                        departments: true
                    }
                }
            }
        })
        return { success: true, universities }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

export async function registerUser(data: {
    name: string
    email: string
    passwordPlain: string
    role: string
    departmentId?: string
    nidn?: string
    nip?: string
    gelarDepan?: string
    gelarBelakang?: string
    isDlb?: boolean
    nim?: string
    angkatan?: string
    jenisKelamin?: string
    alamat?: string
}) {
    try {
        const existing = await prisma.user.findUnique({
            where: { email: data.email.toLowerCase() }
        })
        if (existing) {
            return { success: false, error: 'Email sudah terdaftar.' }
        }

        const hashedPassword = await bcrypt.hash(data.passwordPlain, 10)

        // Validate uniqueness of profile data
        if (data.role === 'teacher') {
            if (data.nidn) {
                const existingNidn = await prisma.teacherProfile.findFirst({ where: { nidn: data.nidn } })
                if (existingNidn) return { success: false, error: 'NIDN tersebut sudah terdaftar pada akun lain.' }
            }
            if (data.nip) {
                const existingNip = await prisma.teacherProfile.findFirst({ where: { nip: data.nip } })
                if (existingNip) return { success: false, error: 'NIP/NIK tersebut sudah terdaftar pada akun lain.' }
            }
        } else if (data.role === 'student') {
            if (data.nim) {
                const existingNim = await prisma.studentProfile.findFirst({ where: { nim: data.nim } })
                if (existingNim) return { success: false, error: 'NIM tersebut sudah terdaftar pada akun lain.' }
            }
        }

        // Validate department if role requires it
        if (['student', 'teacher', 'qa'].includes(data.role) && !data.departmentId && !(data.role === 'teacher' && data.isDlb)) {
            return { success: false, error: 'Departemen harus dipilih untuk role ini.' }
        }

        // Prepare connect arrays based on role
        const departmentsConnect = data.departmentId ? [{ id: data.departmentId }] : []
        const userRoles = data.departmentId ? [{ role: data.role, departmentId: data.departmentId }] : []

        // If role is teacher, prepare teacherProfile data
        const teacherProfileData = data.role === 'teacher' ? {
            create: {
                nidn: data.nidn || null,
                nip: data.nip || null,
                gelarDepan: data.gelarDepan || null,
                gelarBelakang: data.gelarBelakang || null,
                isDlb: data.isDlb || false
            }
        } : undefined

        // If role is student, prepare studentProfile data
        const studentProfileData = data.role === 'student' ? {
            create: {
                nim: data.nim || null,
                angkatan: data.angkatan ? parseInt(data.angkatan) : null,
                jenisKelamin: data.jenisKelamin || null,
                alamat: data.alamat || null
            }
        } : undefined

        const newUser = await prisma.user.create({
            data: {
                name: data.name,
                email: data.email.toLowerCase(),
                password: hashedPassword,
                role: data.role,
                isActive: false, // Inactive until approved
                approvalStatus: 'PENDING',
                homebaseDepartmentId: (data.role === 'teacher' && data.isDlb) ? null : (data.departmentId || null),
                departments: { connect: departmentsConnect },
                departmentRoles: { create: userRoles },
                teacherProfile: teacherProfileData,
                studentProfile: studentProfileData
            }
        })

        return { success: true, user: newUser }
    } catch (e: any) {
        return { success: false, error: 'Terjadi kesalahan saat mendaftar: ' + e.message }
    }
}

// --- APPROVAL LOGIC ---

export async function getPendingApprovals(activeRole: string, activeDepartmentId?: string) {
    try {
        // Super Admin sees pending Admins
        if (activeRole === 'super_admin') {
            const pendingAdmins = await prisma.user.findMany({
                where: { role: 'admin' },
                include: { homebaseDepartment: true, teacherProfile: true, studentProfile: true }
            })
            return { success: true, pendingUsers: pendingAdmins }
        }
        
        // Admin sees pending QAs (and maybe others, but plan says QAs)
        if (activeRole === 'admin') {
            const pendingQas = await prisma.user.findMany({
                where: { role: 'qa' },
                include: { homebaseDepartment: true, teacherProfile: true, studentProfile: true }
            })
            return { success: true, pendingUsers: pendingQas }
        }

        // QA sees pending Teachers and Students in their department
        if (activeRole === 'qa' && activeDepartmentId) {
            const pendingStaff = await prisma.user.findMany({
                where: {
                    role: { in: ['teacher', 'student'] },
                    OR: [
                        { homebaseDepartmentId: activeDepartmentId },
                        { departmentRoles: { some: { departmentId: activeDepartmentId } } }
                    ]
                },
                include: { homebaseDepartment: true, teacherProfile: true, studentProfile: true }
            })
            return { success: true, pendingUsers: pendingStaff }
        }

        return { success: true, pendingUsers: [] }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

export async function processApproval(targetUserId: string, action: 'APPROVED' | 'REJECTED', approverId: string) {
    try {
        const user = await prisma.user.findUnique({ where: { id: targetUserId } })
        if (!user) return { success: false, error: 'User tidak ditemukan' }
        // Removed PENDING restriction to allow toggling

        await prisma.user.update({
            where: { id: targetUserId },
            data: {
                approvalStatus: action,
                approvedBy: approverId,
                approvedAt: new Date(),
                isActive: action === 'APPROVED' // Activate if approved
            }
        })
        return { success: true }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

export async function adminResetPassword(userId: string) {
    try {
        const hashedPassword = await bcrypt.hash("123456", 10)
        await prisma.user.update({
            where: { id: userId },
            data: {
                password: hashedPassword,
                mustChangePassword: true
            }
        })
        revalidatePath('/approvals')
        return { success: true }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}
