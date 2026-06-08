const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const years = await prisma.curriculumYear.findMany();
  console.log("Curriculum Years:", years);
  const depts = await prisma.department.findMany();
  console.log("Departments:", depts);
}

main().finally(() => prisma.$disconnect());
