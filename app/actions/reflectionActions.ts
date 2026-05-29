'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { awardPoints } from './gamificationActions';
import { getSessionUser } from '@/app/actions/userActions';

export async function submitReflection(courseId: string, weekNumber: number, content: string, targetMet: boolean) {
    try {
        const user = await getSessionUser();
        if (!user) return { success: false, error: "Belum login." };
        const userId = user.id;

        const enrollment = await prisma.enrollment.findFirst({
            where: { studentId: userId, courseId }
        });

        if (!enrollment) {
            return { success: false, error: "Anda tidak terdaftar di kelas ini." };
        }

        // Check if already submitted for this week
        const existing = await prisma.srlReflection.findFirst({
            where: {
                enrollmentId: enrollment.id,
                weekNumber
            }
        });

        if (existing) {
            return { success: false, error: `Anda sudah mengumpulkan refleksi untuk Minggu ke-${weekNumber}.` };
        }

        const reflection = await prisma.srlReflection.create({
            data: {
                enrollmentId: enrollment.id,
                weekNumber,
                content,
                targetMet
            }
        });

        // Award points for reflection
        await awardPoints(enrollment.id, 10, `Mengisi Jurnal Refleksi Minggu ke-${weekNumber}`);

        revalidatePath(`/student/course/${courseId}`);
        return { success: true, reflection };
    } catch (error: any) {
        console.error("Error submitting reflection:", error);
        return { success: false, error: "Gagal menyimpan jurnal refleksi." };
    }
}

export async function getStudentReflections(courseId: string) {
    try {
        const user = await getSessionUser();
        if (!user) return { success: false, error: "Belum login." };
        const userId = user.id;

        const enrollment = await prisma.enrollment.findFirst({
            where: { studentId: userId, courseId },
            include: { reflections: { orderBy: { weekNumber: 'asc' } } }
        });

        if (!enrollment) return { success: false, error: "Tidak terdaftar." };

        return { success: true, reflections: enrollment.reflections };
    } catch (error: any) {
        console.error("Error fetching reflections:", error);
        return { success: false, error: "Gagal memuat refleksi." };
    }
}

export async function getCourseReflections(courseId: string) {
    try {
        const enrollments = await prisma.enrollment.findMany({
            where: { courseId },
            include: {
                student: { select: { name: true, email: true } },
                reflections: { orderBy: { weekNumber: 'desc' } }
            }
        });

        return { success: true, enrollments };
    } catch (error: any) {
        console.error("Error fetching course reflections:", error);
        return { success: false, error: "Gagal memuat data refleksi kelas." };
    }
}
