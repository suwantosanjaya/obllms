const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const activeCurriculum = await prisma.curriculumYear.findFirst({ where: { isActive: true } });
    console.log('Active Curriculum:', activeCurriculum?.id);
    const excluded = await prisma.curriculumSubject.findMany({ where: { includeInAnalytics: false } });
    console.log('Excluded Subjects:', excluded);
    const clos = await prisma.courseLearningOutcome.findMany({ where: { code: 'CLO-11' }, include: { subjectClos: { include: { subject: true } } } });
    console.log('CLO-11 mapped to:', JSON.stringify(clos, null, 2));
}
main();
