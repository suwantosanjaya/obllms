const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const cys = await prisma.curriculumYear.findMany({ select: { id: true, name: true, isActive: true, departmentId: true } });
    console.log(JSON.stringify(cys, null, 2));
}
main();
