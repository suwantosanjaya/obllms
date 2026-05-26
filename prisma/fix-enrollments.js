const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log("Fixing missing enrollments for Teacher...")

    // 1. Get the first Teacher (the one logged in for Demo)
    const dosenUser = await prisma.user.findFirst({ where: { role: 'teacher' } })
    if (!dosenUser) {
        console.log("No teacher found.")
        return;
    }

    // 2. Get courses owned by this Teacher
    const courses = await prisma.course.findMany({ where: { instructorId: dosenUser.id } })
    console.log(`Found ${courses.length} courses for Teacher ${dosenUser.name}`)

    // 3. Get all Student
    const mahasiswas = await prisma.user.findMany({ where: { role: 'student' } })
    console.log(`Found ${mahasiswas.length} students`)

    // 4. Enroll every Student into ALL courses of this Teacher
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
