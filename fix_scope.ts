import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const result = await prisma.subject.updateMany({
    where: { scope: 'prodi' },
    data: { scope: 'department' }
  })
  console.log(`Updated ${result.count} subjects from 'prodi' to 'department'`)
}
main()
