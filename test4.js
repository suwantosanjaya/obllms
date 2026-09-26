const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
    try {
        const teachers = await prisma.user.findMany({ where: { role: 'TEACHER' } });
        for (let teacher of teachers) {
            const assessments = await prisma.assessment.findMany({
                where: { course: { instructorId: teacher.id } }
            });
            console.log(`Teacher ${teacher.name} (${teacher.id}) has ${assessments.length} assessments`);
        }
    } catch (e) {
        console.error("ERROR:", e);
    }
}
run();
