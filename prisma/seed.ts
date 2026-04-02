const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function main() {
    console.log('Start bulk seeding (10 per table)...')

    // Clean up existing data to avoid unique constraint errors during bulk insert
    await prisma.activityLog.deleteMany()
    await prisma.gamificationProfile.deleteMany()
    await prisma.forumReply.deleteMany()
    await prisma.forumThread.deleteMany()
    await prisma.srlReflection.deleteMany()
    await prisma.courseModule.deleteMany()
    await prisma.courseConfig.deleteMany()
    await prisma.feedback.deleteMany()
    await prisma.submissionCLOScore.deleteMany()
    await prisma.submission.deleteMany()
    await prisma.assessmentCLO.deleteMany()
    await prisma.assessment.deleteMany()
    await prisma.courseLearningOutcome.deleteMany()
    await prisma.programLearningOutcome.deleteMany()
    await prisma.graduateProfile.deleteMany()
    await prisma.enrollment.deleteMany()
    await prisma.course.deleteMany()
    await prisma.subject.deleteMany()
    await prisma.prodi.deleteMany()
    await prisma.fakultas.deleteMany()
    await prisma.user.deleteMany()

    console.log('Database cleared.')

    // 1. Create 10 Users (3 Dosen, 7 Mahasiswa)
    const users = []
    const defaultPasswordHash = await bcrypt.hash('password123', 10)

    for (let i = 1; i <= 10; i++) {
        const role = i <= 3 ? 'dosen' : 'mahasiswa'
        users.push(await prisma.user.create({
            data: {
                email: `user${i}@kampus.edu`,
                name: role === 'dosen' ? `Dr. Dosen ${i}` : `Mahasiswa ${i}`,
                password: defaultPasswordHash,
                role: role
            }
        }))
    }
    const dosens = users.filter(u => u.role === 'dosen')
    const mahasiswas = users.filter(u => u.role === 'mahasiswa')

    // 2. Create 10 Graduate Profiles
    const gps = []
    for (let i = 1; i <= 10; i++) {
        gps.push(await prisma.graduateProfile.create({
            data: {
                code: `GP-${i}`,
                title: `Profil Lulusan ${i}`,
                description: `Deskripsi untuk Profil Lulusan ke-${i}`
            }
        }))
    }

    // 3. Create 10 PLOs mapped to Graduate Profiles
    const plos = []
    for (let i = 1; i <= 10; i++) {
        plos.push(await prisma.programLearningOutcome.create({
            data: {
                code: `PLO-${i}`,
                description: `Deskripsi Program Learning Outcome ke-${i}`,
                graduateProfileId: gps[i - 1].id
            }
        }))
    }

    // 1.5 Create Fakultas and Prodi
    const ft = await prisma.fakultas.create({ data: { code: 'FT', name: 'Fakultas Teknik' } })
    const fe = await prisma.fakultas.create({ data: { code: 'FE', name: 'Fakultas Ekonomi' } })
    const fi = await prisma.fakultas.create({ data: { code: 'FI', name: 'Fakultas Ilmu Komputer' } })

    const prodiTI = await prisma.prodi.create({ data: { code: 'TI', name: 'Teknik Informatika', fakultasId: ft.id } })
    const prodiSI = await prisma.prodi.create({ data: { code: 'SI', name: 'Sistem Informasi', fakultasId: fi.id } })
    const prodiMNJ = await prisma.prodi.create({ data: { code: 'MNJ', name: 'Manajemen', fakultasId: fe.id } })

    // 4. Create 10 Master Subjects (Katalog Mata Kuliah)
    const subjectData = [
        { code: 'MKU101', title: 'Pendidikan Pancasila', type: 'wajib', scope: 'universitas' },
        { code: 'MKU102', title: 'Bahasa Indonesia', type: 'wajib', scope: 'universitas' },
        { code: 'FT101', title: 'Kalkulus', type: 'wajib', scope: 'fakultas', fakultasId: ft.id },
        { code: 'FT102', title: 'Fisika Dasar', type: 'wajib', scope: 'fakultas', fakultasId: ft.id },
        { code: 'TI101', title: 'Pemrograman Dasar', type: 'wajib', scope: 'prodi', prodiId: prodiTI.id, fakultasId: ft.id },
        { code: 'TI201', title: 'Struktur Data', type: 'wajib', scope: 'prodi', prodiId: prodiTI.id, fakultasId: ft.id },
        { code: 'TI301', title: 'Kecerdasan Buatan', type: 'pilihan', scope: 'prodi', prodiId: prodiTI.id, fakultasId: ft.id },
        { code: 'SI101', title: 'Analisis Sistem Informasi', type: 'wajib', scope: 'prodi', prodiId: prodiSI.id, fakultasId: fi.id },
        { code: 'SI201', title: 'Basis Data', type: 'wajib', scope: 'prodi', prodiId: prodiSI.id, fakultasId: fi.id },
        { code: 'MNJ101', title: 'Pengantar Manajemen', type: 'wajib', scope: 'prodi', prodiId: prodiMNJ.id, fakultasId: fe.id },
    ]
    const subjects = []
    for (const s of subjectData) {
        subjects.push(await prisma.subject.create({ data: s as any }))
    }

    // 5. Create 10 Course Offerings (Kelas)
    const courses = []
    for (let i = 0; i < 10; i++) {
        courses.push(await prisma.course.create({
            data: {
                subjectId: subjects[i].id,
                instructorId: dosens[i % dosens.length].id, // Assign round-robin to dosens
                semester: i % 2 === 0 ? "Ganjil" : "Genap",
                academicYear: "2025/2026",
                config: {
                    create: {
                        isSrlEnabled: true,
                        isGamificationEnabled: true,
                        isForumEnabled: true,
                        isReflectionsEnabled: true,
                        isAnalyticsEnabled: true,
                        difficulty: i <= 5 ? 'Basic' : 'Advanced'
                    }
                }
            }
        }))
    }

    // 4. Create 10 Enrollments
    const enrollments = []
    for (let i = 0; i < 10; i++) {
        enrollments.push(await prisma.enrollment.create({
            data: {
                studentId: mahasiswas[i % mahasiswas.length].id,
                courseId: courses[i].id,
                status: 'active',
                srlTarget: 5 + (i % 3)
            }
        }))
    }

    // 5. Create 10 Gamification Profiles (1 per enrollment)
    for (let i = 0; i < 10; i++) {
        await prisma.gamificationProfile.create({
            data: {
                enrollmentId: enrollments[i].id,
                points: i * 50,
                level: 1 + (i % 3),
                badges: JSON.stringify(['Beginner', `Badge-${i}`])
            }
        })
    }

    // 6. Create 10 CLOs
    const clos = []
    for (let i = 0; i < 10; i++) {
        clos.push(await prisma.courseLearningOutcome.create({
            data: {
                courseId: courses[i].id,
                ploId: plos[i].id,
                code: `CLO-${i + 1}`,
                description: `Mahasiswa mampu memahami materi ${i + 1}`,
            }
        }))
    }

    // 7. Create 10 Course Modules
    const modules = []
    for (let i = 0; i < 10; i++) {
        modules.push(await prisma.courseModule.create({
            data: {
                courseId: courses[i].id,
                title: `Modul Mingguan ${i + 1}`,
                content: `Konten pembelajaran untuk modul ${i + 1}. Baca halaman ${i * 10}.`,
                weekNumber: (i % 14) + 1,
                cloId: clos[i].id
            }
        }))
    }

    // 8. Create 10 Assessments (without cloId - now use AssessmentCLO join table)
    const assessments = []
    for (let i = 0; i < 10; i++) {
        assessments.push(await prisma.assessment.create({
            data: {
                courseId: courses[i].id,
                title: `Tugas ${i + 1}`,
                description: `Kerjakan soal berikut untuk menilai pemahaman Modul ${i + 1}`,
                type: 'assignment',
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                maxScore: 100,
            }
        }))
    }

    // 8b. Create AssessmentCLO records: each assessment measures 1–2 CLOs with weights
    // Odd-indexed: single CLO (100%), Even-indexed: two CLOs (60%+40%)
    const extraClos = [] // We'll add a second CLO per course for even-indexed
    for (let i = 0; i < 10; i++) {
        extraClos.push(await prisma.courseLearningOutcome.create({
            data: {
                courseId: courses[i].id,
                ploId: plos[(i + 1) % 10].id,
                code: `CLO-${i + 1}B`,
                description: `Mahasiswa mampu menerapkan konsep ${i + 1}`,
            }
        }))
    }

    for (let i = 0; i < 10; i++) {
        if (i % 2 === 0) {
            // Two CLOs: 60% + 40%
            await prisma.assessmentCLO.createMany({
                data: [
                    { assessmentId: assessments[i].id, cloId: clos[i].id, weight: 60 },
                    { assessmentId: assessments[i].id, cloId: extraClos[i].id, weight: 40 },
                ]
            })
        } else {
            // Single CLO: 100%
            await prisma.assessmentCLO.create({
                data: { assessmentId: assessments[i].id, cloId: clos[i].id, weight: 100 }
            })
        }
    }

    // 9. Create 10 Submissions with per-CLO scores
    for (let i = 0; i < 10; i++) {
        const baseScore = 80 + i
        const sub = await prisma.submission.create({
            data: {
                assessmentId: assessments[i].id,
                studentId: enrollments[i].studentId,
                content: `Jawaban untuk tugas ${i + 1} dari mahasiswa.`,
                feedback: `Kerja bagus untuk tugas ${i + 1}!`,
            }
        })

        // Create per-CLO scores and compute weighted average
        if (i % 2 === 0) {
            // Two CLOs: 60%+40%
            const score1 = baseScore
            const score2 = baseScore - 5
            const weighted = Math.round((score1 * 0.6 + score2 * 0.4) * 10) / 10
            await prisma.submissionCLOScore.createMany({
                data: [
                    { submissionId: sub.id, cloId: clos[i].id, score: score1 },
                    { submissionId: sub.id, cloId: extraClos[i].id, score: score2 },
                ]
            })
            await prisma.submission.update({ where: { id: sub.id }, data: { score: weighted } })
        } else {
            // Single CLO: 100%
            await prisma.submissionCLOScore.create({
                data: { submissionId: sub.id, cloId: clos[i].id, score: baseScore }
            })
            await prisma.submission.update({ where: { id: sub.id }, data: { score: baseScore } })
        }
    }

    // 10. Create 10 Forum Threads
    const threads = []
    for (let i = 0; i < 10; i++) {
        threads.push(await prisma.forumThread.create({
            data: {
                courseId: courses[i].id,
                authorId: enrollments[i].studentId,
                title: `Diskusi Materi ${i + 1}`,
                content: `Saya ada pertanyaan tentang modul ${i + 1}, mohon pencerahannya.`,
                cloId: clos[i].id,
                isResolved: false
            }
        }))
    }

    // 11. Create 10 Forum Replies
    for (let i = 0; i < 10; i++) {
        await prisma.forumReply.create({
            data: {
                threadId: threads[i].id,
                authorId: courses[i].instructorId, // Instructor answers
                content: `Berikut adalah penjelasan untuk pertanyaan diskusi ${i + 1}...`,
                isBestAnswer: true
            }
        })
    }

    // 12. Create 10 SRL Reflections
    for (let i = 0; i < 10; i++) {
        await prisma.srlReflection.create({
            data: {
                enrollmentId: enrollments[i].id,
                weekNumber: 1,
                content: `Refleksi minggu ini: saya telah belajar dengan baik materi ${i + 1}.`,
                targetMet: true
            }
        })
    }

    // 13. Create 10 Feedbacks
    for (let i = 0; i < 10; i++) {
        await prisma.feedback.create({
            data: {
                userId: enrollments[i].studentId,
                targetId: courses[i].id,
                targetType: 'course',
                content: `Saran: materi ${i + 1} bisa diperjelas lagi.`,
                rating: 4
            }
        })
    }

    // 14. Create 10 Activity Logs
    for (let i = 0; i < 10; i++) {
        await prisma.activityLog.create({
            data: {
                userId: enrollments[i].studentId,
                courseId: courses[i].id,
                action: 'VIEW_MATERIAL',
                details: JSON.stringify({ moduleId: modules[i].id, timeSpentSeconds: 300 + i * 10 })
            }
        })
    }

    console.log('Successfully generated 10 records for ALL 15 tables in the schema.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
