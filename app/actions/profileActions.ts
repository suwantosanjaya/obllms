'use server'

import prisma from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function getUserProfile(userId: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                teacherProfile: true,
                studentProfile: true,
                homebaseDepartment: {
                    include: {
                        faculty: true
                    }
                }
            }
        })
        
        if (!user) {
            return { success: false, error: 'User tidak ditemukan' }
        }

        const { password, ...userWithoutPassword } = user
        return { success: true, user: userWithoutPassword }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

export async function updateProfile(userId: string, data: { 
    name: string, 
    email: string, 
    nidn?: string, 
    nip?: string, 
    gelarDepan?: string, 
    gelarBelakang?: string,
    nim?: string,
    angkatan?: number,
    jenisKelamin?: string,
    alamat?: string,
    isStudentProfile?: boolean,
    isTeacherProfile?: boolean
}) {
    try {
        const { name, email, nidn, nip, gelarDepan, gelarBelakang, nim, angkatan, jenisKelamin, alamat, isStudentProfile, isTeacherProfile } = data

        // Check if email is already used by someone else
        const existingEmail = await prisma.user.findUnique({ where: { email } })
        if (existingEmail && existingEmail.id !== userId) {
            return { success: false, error: 'Email sudah digunakan oleh akun lain.' }
        }

        await prisma.user.update({
            where: { id: userId },
            data: {
                name,
                email,
                ...(isTeacherProfile ? {
                    teacherProfile: {
                        upsert: {
                            create: { nidn: nidn || null, nip: nip || null, gelarDepan, gelarBelakang },
                            update: { nidn: nidn || null, nip: nip || null, gelarDepan, gelarBelakang }
                        }
                    }
                } : {}),
                ...(isStudentProfile ? {
                    studentProfile: {
                        upsert: {
                            create: { nim: nim || null, angkatan: angkatan || null, jenisKelamin: jenisKelamin || null, alamat: alamat || null },
                            update: { nim: nim || null, angkatan: angkatan || null, jenisKelamin: jenisKelamin || null, alamat: alamat || null }
                        }
                    }
                } : {})
            }
        })

        return { success: true }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

export async function changePassword(userId: string, oldPasswordPlain: string, newPasswordPlain: string) {
    try {
        const user = await prisma.user.findUnique({ where: { id: userId } })
        if (!user) {
            return { success: false, error: 'User tidak ditemukan' }
        }

        const isMatch = await bcrypt.compare(oldPasswordPlain, user.password)
        if (!isMatch) {
            return { success: false, error: 'Password lama tidak sesuai.' }
        }

        const hashedPassword = await bcrypt.hash(newPasswordPlain, 10)
        
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        })

        return { success: true }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}
