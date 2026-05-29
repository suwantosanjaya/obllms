'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { awardPoints } from './gamificationActions';
import { getSessionUser } from '@/app/actions/userActions';

export async function getThreadsByCourse(courseId: string) {
    try {
        const threads = await prisma.forumThread.findMany({
            where: { courseId },
            orderBy: { createdAt: 'desc' },
            include: {
                clo: { select: { id: true, code: true, description: true } },
                author: { select: { name: true, role: true } },
                replies: {
                    include: {
                        author: { select: { name: true, role: true } }
                    },
                    orderBy: { createdAt: 'asc' }
                }
            }
        });
        return { success: true, threads };
    } catch (error: any) {
        console.error("Error fetching threads:", error);
        return { success: false, error: "Gagal memuat forum." };
    }
}

export async function createThread(courseId: string, title: string, content: string, cloId?: string) {
    try {
        const user = await getSessionUser();
        if (!user) return { success: false, error: "Belum login." };
        const userId = user.id;

        const thread = await prisma.forumThread.create({
            data: {
                courseId,
                authorId: userId,
                title,
                content,
                cloId: cloId || null
            }
        });

        // Award points if it's a student
        const enrollment = await prisma.enrollment.findFirst({
            where: { studentId: userId, courseId }
        });

        if (enrollment) {
            await awardPoints(enrollment.id, 5, "Membuat Topik Forum: " + title.substring(0, 20));
        }

        revalidatePath(`/student/course/${courseId}`);
        revalidatePath(`/teacher/course/${courseId}`);

        return { success: true, thread };
    } catch (error: any) {
        console.error("Error creating thread:", error);
        return { success: false, error: "Gagal membuat diskusi." };
    }
}

export async function createReply(threadId: string, courseId: string, content: string) {
    try {
        const user = await getSessionUser();
        if (!user) return { success: false, error: "Belum login." };
        const userId = user.id;

        const reply = await prisma.forumReply.create({
            data: {
                threadId,
                authorId: userId,
                content
            }
        });

        // Award points if it's a student
        const enrollment = await prisma.enrollment.findFirst({
            where: { studentId: userId, courseId }
        });

        if (enrollment) {
            await awardPoints(enrollment.id, 3, "Membalas diskusi forum.");
        }

        revalidatePath(`/student/course/${courseId}`);
        revalidatePath(`/teacher/course/${courseId}`);

        return { success: true, reply };
    } catch (error: any) {
        console.error("Error creating reply:", error);
        return { success: false, error: "Gagal mengirim balasan." };
    }
}
