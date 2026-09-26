const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
    try {
        const users = await prisma.user.findMany();
        for (let user of users) {
            const assessments = await prisma.assessment.findMany({
                where: { course: { instructorId: user.id } }
            });
            if (assessments.length > 0) {
                console.log(`User ${user.name} (${user.id}) has ${assessments.length} assessments`);
            }
        }
    } catch (e) {
        console.error("ERROR:", e);
    }
}
run();
