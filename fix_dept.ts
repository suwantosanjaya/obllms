import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const result = await prisma.subject.updateMany({
    where: { 
      code: { startsWith: 'TIF' },
      departmentId: null
    },
    data: { departmentId: 'cmpkq54ha00099nmy0fzffhs3' }
  })
  console.log(`Updated ${result.count} TIF subjects to restore departmentId`)
}
main()
