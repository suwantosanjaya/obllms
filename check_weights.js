const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const subjectClos = await prisma.subjectCLO.findMany({
    select: { subjectId: true, cloId: true, weight: true }
  })
  console.log("Total SubjectCLOs:", subjectClos.length)
  console.log("SubjectCLOs with weight > 0:", subjectClos.filter(sc => sc.weight > 0).length)
  console.log("First 5 records:", subjectClos.slice(0, 5))
}

main().finally(() => prisma.$disconnect())
