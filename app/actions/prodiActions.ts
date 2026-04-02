'use server'

import prisma from '@/lib/db'
import { revalidatePath } from 'next/cache'

// ─── Fakultas ────────────────────────────────────────────────
export async function getFakultasList() {
    try {
        const list = await prisma.fakultas.findMany({
            orderBy: { name: 'asc' },
            include: { prodis: { orderBy: { name: 'asc' } } }
        })
        return { success: true, fakultasList: list }
    } catch {
        return { success: false, error: 'Gagal memuat data Fakultas' }
    }
}

export async function createFakultas(data: { code: string; name: string }) {
    try {
        const fakultas = await prisma.fakultas.create({ data })
        revalidatePath('/admin/prodi')
        return { success: true, fakultas }
    } catch (error: any) {
        if (error.code === 'P2002') {
            return { success: false, error: 'Kode Fakultas sudah ada' }
        }
        return { success: false, error: 'Gagal membuat Fakultas' }
    }
}

export async function deleteFakultas(id: string) {
    try {
        await prisma.fakultas.delete({ where: { id } })
        revalidatePath('/admin/prodi')
        return { success: true }
    } catch {
        return { success: false, error: 'Gagal menghapus Fakultas. Mungkin masih memiliki Prodi.' }
    }
}

// ─── Prodi ───────────────────────────────────────────────────
export async function getProdiList(fakultasId?: string) {
    try {
        const list = await prisma.prodi.findMany({
            where: fakultasId ? { fakultasId } : undefined,
            orderBy: { name: 'asc' },
            include: { fakultas: true }
        })
        return { success: true, prodiList: list }
    } catch {
        return { success: false, error: 'Gagal memuat data Prodi' }
    }
}

export async function createProdi(data: { code: string; name: string; fakultasId: string }) {
    try {
        const prodi = await prisma.prodi.create({ data })
        revalidatePath('/admin/prodi')
        return { success: true, prodi }
    } catch (error: any) {
        if (error.code === 'P2002') {
            return { success: false, error: 'Kode Prodi sudah ada' }
        }
        return { success: false, error: 'Gagal membuat Prodi' }
    }
}

export async function deleteProdi(id: string) {
    try {
        await prisma.prodi.delete({ where: { id } })
        revalidatePath('/admin/prodi')
        return { success: true }
    } catch {
        return { success: false, error: 'Gagal menghapus Prodi. Mungkin masih memiliki Mata Kuliah.' }
    }
}
