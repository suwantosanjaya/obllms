'use server'

import prisma from '@/lib/db'

export async function getDepartmentCloAnalytics(departmentId: string, angkatanFilter?: number) {
    try {
        // Find all CLOs for this department
        const clos = await prisma.courseLearningOutcome.findMany({
            where: { departmentId },
            orderBy: { code: 'asc' }
        })

        // Find all students in this department
        const studentsWhere: any = {
            departments: { some: { id: departmentId } },
            role: 'mahasiswa'
        }

        if (angkatanFilter) {
            studentsWhere.studentProfile = { angkatan: angkatanFilter }
        }

        const students = await prisma.user.findMany({
            where: studentsWhere,
            include: { studentProfile: true }
        })
        const studentIds = students.map(s => s.id)

        // Find all submission scores for these CLOs and these students
        const scores = await prisma.submissionCLOScore.findMany({
            where: {
                cloId: { in: clos.map(c => c.id) },
                submission: {
                    studentId: { in: studentIds }
                }
            },
            include: {
                submission: {
                    include: { student: { include: { studentProfile: true } } }
                }
            }
        })

        // Aggregate by CLO
        const cloAggregates = clos.map(clo => {
            const cloScores = scores.filter(s => s.cloId === clo.id && s.score !== null)
            const totalScore = cloScores.reduce((sum, s) => sum + s.score, 0)
            const average = cloScores.length > 0 ? totalScore / cloScores.length : null
            return {
                ...clo,
                average,
                studentCount: new Set(cloScores.map(s => s.submission.studentId)).size,
                submissionCount: cloScores.length
            }
        })

        // Aggregate by Angkatan
        const angkatanMap = new Map<number, { count: number, totalScore: number }>()
        scores.forEach(s => {
            const angkatan = s.submission.student.studentProfile?.angkatan
            if (angkatan && s.score !== null) {
                if (!angkatanMap.has(angkatan)) {
                    angkatanMap.set(angkatan, { count: 0, totalScore: 0 })
                }
                const data = angkatanMap.get(angkatan)!
                data.count++
                data.totalScore += s.score
            }
        })

        const angkatanAggregates = Array.from(angkatanMap.entries()).map(([angkatan, data]) => ({
            angkatan,
            average: data.totalScore / data.count
        })).sort((a, b) => b.angkatan - a.angkatan)

        return { success: true, clos: cloAggregates, angkatanAverages: angkatanAggregates, studentCount: students.length }
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message }
    }
}
