'use server'

import prisma from '@/lib/db'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

export async function seedSimulatedUsers() {
    // If the database has missing roles, create them specifically for the login simulation
    const rolesToEnsure = [
        { email: 'budi@university.edu', name: 'Budi (Mahasiswa)', role: 'mahasiswa' },
        { email: 'andi@university.edu', name: 'Dr. Andi (Dosen)', role: 'dosen' },
        { email: 'siti@university.edu', name: 'Siti (QA/Prodi)', role: 'qa' },
        { email: 'admin@university.edu', name: 'Admin IT', role: 'admin' },
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
            where: { email: email.toLowerCase() }
        })

        if (!user) {
            return { success: false, error: 'User tidak ditemukan.' }
        }

        const isValid = await bcrypt.compare(passwordPlain, user.password)
        if (!isValid) {
            return { success: false, error: 'Password salah.' }
        }

        // Exclude password from the returned object for security
        const { password, ...userWithoutPassword } = user

        // Set an HTTP-only cookie for server components to access
        const cookieStore = await cookies()
        cookieStore.set('userId', user.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7 // 1 week
        })

        return { success: true, user: userWithoutPassword }
    } catch (error) {
        console.error('Login error', error)
        return { success: false, error: 'Terjadi kesalahan sistem.' }
    }
}

export async function logoutUser() {
    const cookieStore = await cookies()
    cookieStore.delete('userId')
    return { success: true }
}

export async function getSessionUser() {
    const cookieStore = await cookies()
    const userIdCookie = cookieStore.get('userId')
    if (!userIdCookie?.value) return null

    const user = await prisma.user.findUnique({
        where: { id: userIdCookie.value }
    })

    if (!user) return null
    const { password, ...userWithoutPassword } = user
    return userWithoutPassword
}
