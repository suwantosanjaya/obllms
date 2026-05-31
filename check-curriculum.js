const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const activeCurriculum = await prisma.curriculumYear.findFirst({ where: { isActive: true } });
    console.log('Active Curriculum:', activeCurriculum?.id);
    const excluded = await prisma.curriculumSubject.findMany({ where: { includeInAnalytics: false } });
    console.log('All Excluded:', excluded);
}
main();
