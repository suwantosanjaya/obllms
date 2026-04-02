const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log("Fixing missing enrollments for Dosen...")

    // 1. Get the first Dosen (the one logged in for Demo)
    const dosenUser = await prisma.user.findFirst({ where: { role: 'dosen' } })
    if (!dosenUser) {
        console.log("No dosen found.")
        return;
    }

    // 2. Get courses owned by this Dosen
    const courses = await prisma.course.findMany({ where: { instructorId: dosenUser.id } })
    console.log(`Found ${courses.length} courses for Dosen ${dosenUser.name}`)

    // 3. Get all Mahasiswa
    const mahasiswas = await prisma.user.findMany({ where: { role: 'mahasiswa' } })
    console.log(`Found ${mahasiswas.length} mahasiswas`)

    // 4. Enroll every Mahasiswa into ALL courses of this Dosen
    let enrolledCount = 0;
    for (const course of courses) {
        for (const mhs of mahasiswas) {
            // Check if already enrolled
            const existing = await prisma.enrollment.findFirst({
                where: { studentId: mhs.id, courseId: course.id }
            })
            if (!existing) {
                await prisma.enrollment.create({
                    data: {
                        studentId: mhs.id,
                        courseId: course.id,
                        status: 'active',
                        srlTarget: 5
                    }
                })
                enrolledCount++;
            }
        }
    }

    console.log(`Successfully added ${enrolledCount} new enrollments.`)
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect())
