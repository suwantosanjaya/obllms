const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const mku101 = await prisma.subject.findUnique({ where: { code: 'MKU101' }, include: { subjectClos: { include: { clo: true } } } })
  mku101.subjectClos.forEach(sc => console.log(`${sc.clo.code}: weight ${sc.weight}`))
}

main().finally(() => prisma.$disconnect())
