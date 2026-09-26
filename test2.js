const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
    try {
        const assessments = await prisma.assessment.findMany();
        console.log("Total assessments:", assessments.length);
        const courses = await prisma.course.findMany();
        console.log("Total courses:", courses.length);
        const teachers = await prisma.user.findMany({ where: { roles: { has: 'teacher' } } });
        console.log("Total teachers:", teachers.length);
    } catch (e) {
        console.error("ERROR:", e);
    }
}
run();
