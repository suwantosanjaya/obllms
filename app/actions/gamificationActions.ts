'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';

// Thresholds for levels (example: Level 1 = 0, Level 2 = 50, Level 3 = 150)
const LEVEL_THRESHOLDS = [0, 50, 150, 300, 500, 750, 1000, 1500];

function calculateLevel(points: number): number {
    let currentLevel = 1;
    for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
        if (points >= LEVEL_THRESHOLDS[i]) {
            currentLevel = i + 1;
        } else {
            break;
        }
    }
    return currentLevel;
}

export async function awardPoints(enrollmentId: string, points: number, actionDetails: string) {
    try {
        // Find existing profile or create one
        let profile = await prisma.gamificationProfile.findUnique({
            where: { enrollmentId }
        });

        if (!profile) {
            profile = await prisma.gamificationProfile.create({
                data: {
                    enrollmentId,
                    points: 0,
                    level: 1,
                }
            });
        }

        const newPoints = profile.points + points;
        const newLevel = calculateLevel(newPoints);

        await prisma.gamificationProfile.update({
            where: { enrollmentId },
            data: {
                points: newPoints,
                level: newLevel
            }
        });

        // Log the activity
        const enrollment = await prisma.enrollment.findUnique({
            where: { id: enrollmentId },
            select: { studentId: true, courseId: true }
        });

        if (enrollment) {
            await prisma.activityLog.create({
                data: {
                    userId: enrollment.studentId,
                    courseId: enrollment.courseId,
                    action: 'EARN_POINTS',
                    details: JSON.stringify({ points, reason: actionDetails, newLevel })
                }
            });
        }

        return { success: true, points, level: newLevel };
    } catch (error: any) {
        console.error("Error awarding points:", error);
        return { success: false, error: "Gagal memberikan poin." };
    }
}

export async function getLeaderboard(courseId: string) {
    try {
        const enrollments = await prisma.enrollment.findMany({
            where: { courseId },
            include: {
                student: {
                    select: { name: true, email: true }
                },
                gameProfile: true
            }
        });

        const leaderboard = enrollments
            .map(enr => ({
                id: enr.id,
                studentId: enr.studentId,
                name: enr.student.name,
                points: enr.gameProfile?.points || 0,
                level: enr.gameProfile?.level || 1,
                badges: enr.gameProfile?.badges ? JSON.parse(enr.gameProfile.badges) : []
            }))
            .sort((a, b) => b.points - a.points); // sort descending

        return { success: true, leaderboard };
    } catch (error: any) {
        console.error("Error fetching leaderboard:", error);
        return { success: false, error: "Gagal memuat papan peringkat." };
    }
}

export async function convertGamificationToScore(courseId: string, assessmentId: string, maxPointsTarget: number, overwriteExisting: boolean = true) {
    try {
        if (maxPointsTarget <= 0) {
            return { success: false, error: "Target poin maksimal harus lebih dari 0." };
        }

        // Fetch assessment to ensure it belongs to the course
        const assessment = await prisma.assessment.findUnique({
            where: { id: assessmentId },
            include: { assessmentClos: true }
        });

        if (!assessment || assessment.courseId !== courseId) {
            return { success: false, error: "Tugas/Asesmen tidak ditemukan atau tidak valid." };
        }

        // Fetch all enrollments and their game profiles
        const enrollments = await prisma.enrollment.findMany({
            where: { courseId },
            include: { gameProfile: true }
        });

        if (enrollments.length === 0) {
            return { success: false, error: "Belum ada mahasiswa terdaftar di kelas ini." };
        }

        // Fetch existing submissions
        const existingSubmissions = await prisma.submission.findMany({
            where: {
                assessmentId: assessmentId,
                studentId: { in: enrollments.map(e => e.studentId) }
            },
            select: { studentId: true }
        });
        const existingStudentIds = new Set(existingSubmissions.map(s => s.studentId));

        // Process conversion
        const operations = [];
        let skipCount = 0;

        for (const enr of enrollments) {
            if (!overwriteExisting && existingStudentIds.has(enr.studentId)) {
                skipCount++;
                continue;
            }
            const studentPoints = enr.gameProfile?.points || 0;
            // Calculate score (0-100), cap at 100
            let score = (studentPoints / maxPointsTarget) * 100;
            if (score > 100) score = 100;

            operations.push(
                prisma.submission.upsert({
                    where: {
                        studentId_assessmentId: {
                            studentId: enr.studentId,
                            assessmentId: assessmentId
                        }
                    },
                    update: {
                        score: score,
                        submittedAt: new Date(),
                        content: "Otomatis dikonversi dari Poin Papan Peringkat Gamifikasi"
                    },
                    create: {
                        assessmentId: assessmentId,
                        studentId: enr.studentId,
                        score: score,
                        submittedAt: new Date(),
                        content: "Otomatis dikonversi dari Poin Papan Peringkat Gamifikasi"
                    }
                })
            );
        }
        
        // Execute all submission upserts
        await prisma.$transaction(operations);

        // Now update CLO scores
        const submissions = await prisma.submission.findMany({
            where: {
                assessmentId: assessmentId,
                studentId: { in: enrollments.map(e => e.studentId) }
            }
        });

        const cloOperations = [];
        for (const sub of submissions) {
            for (const aClo of assessment.assessmentClos) {
                cloOperations.push(
                    prisma.submissionCLOScore.upsert({
                        where: {
                            submissionId_cloId: {
                                submissionId: sub.id,
                                cloId: aClo.cloId
                            }
                        },
                        update: {
                            score: sub.score || 0
                        },
                        create: {
                            submissionId: sub.id,
                            cloId: aClo.cloId,
                            score: sub.score || 0
                        }
                    })
                );
            }
        }
        
        if (cloOperations.length > 0) {
            await prisma.$transaction(cloOperations);
        }

        revalidatePath(`/teacher/course/${courseId}`);
        const convertedCount = enrollments.length - skipCount;
        return { 
            success: true, 
            message: `Berhasil mengonversi nilai untuk ${convertedCount} mahasiswa.` + 
                     (skipCount > 0 ? ` (Melewati ${skipCount} mahasiswa yang sudah memiliki nilai)` : "")
        };

    } catch (error: any) {
        console.error("Error converting gamification:", error);
        return { success: false, error: "Terjadi kesalahan saat mengonversi poin ke nilai OBE." };
    }
}
