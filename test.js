const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
    try {
        const assessments = await prisma.assessment.findMany({
            where: { course: { instructorId: "cm174swc80004o47v1q7p0hku" } },
            include: {
                course: { include: { subject: true } },
                assessmentClos: { include: { clo: true } },
                _count: { select: { submissions: true } },
                submissions: {
                    include: {
                        student: true,
                        history: { orderBy: { rejectedAt: 'desc' } },
                        cloScores: { include: { clo: true } }
                    }
                }
            },
            orderBy: { dueDate: 'asc' }
        });
        console.log("Found", assessments.length);
    } catch (e) {
        console.error("ERROR:", e);
    }
}
run();
