'use server'

import prisma from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function getSubjectList() {
    try {
        const subjects = await prisma.subject.findMany({
            orderBy: { code: 'asc' },
            include: {
                prodi: { include: { fakultas: true } },
                fakultas: true,
            }
        })
        return { success: true, subjects }
    } catch {
        return { success: false, error: 'Gagal memuat data Mata Kuliah' }
    }
}

export async function createSubject(data: {
    code: string
    title: string
    description?: string
    type: 'wajib' | 'pilihan'
    scope: 'universitas' | 'fakultas' | 'prodi'
    fakultasId?: string
    prodiId?: string
}) {
    try {
        const subject = await prisma.subject.create({
            data: {
                code: data.code,
                title: data.title,
                description: data.description || null,
                type: data.type,
                scope: data.scope,
                fakultasId: data.scope === 'fakultas' || data.scope === 'prodi' ? (data.fakultasId || null) : null,
                prodiId: data.scope === 'prodi' ? (data.prodiId || null) : null,
            }
        })
        revalidatePath('/admin/subjects')
        return { success: true, subject }
    } catch (error: any) {
        if (error.code === 'P2002') {
            return { success: false, error: 'Kode Mata Kuliah sudah ada' }
        }
        return { success: false, error: 'Gagal membuat Mata Kuliah' }
    }
}

export async function deleteSubject(id: string) {
    try {
        await prisma.subject.delete({ where: { id } })
        revalidatePath('/admin/subjects')
        return { success: true }
    } catch {
        return { success: false, error: 'Gagal menghapus Mata Kuliah. Mungkin masih digunakan.' }
    }
}

