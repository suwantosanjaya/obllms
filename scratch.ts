import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const subjects = await prisma.subject.findMany({
    select: { id: true, code: true, title: true, departmentId: true, facultyId: true, scope: true }
  })
  console.log(JSON.stringify(subjects, null, 2))
}
main()
