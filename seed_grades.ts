import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const grades = [
        { grade: 'A', minScore: 85, maxScore: 999, point: 4.0 },
        { grade: 'A-', minScore: 80, maxScore: 85, point: 3.7 },
        { grade: 'B+', minScore: 75, maxScore: 80, point: 3.3 },
        { grade: 'B', minScore: 70, maxScore: 75, point: 3.0 },
        { grade: 'B-', minScore: 65, maxScore: 70, point: 2.7 },
        { grade: 'C+', minScore: 60, maxScore: 65, point: 2.3 },
        { grade: 'C', minScore: 55, maxScore: 60, point: 2.0 },
        { grade: 'D', minScore: 50, maxScore: 55, point: 1.0 },
        { grade: 'E', minScore: 0, maxScore: 50, point: 0.0 }
    ]

    for (const g of grades) {
        await prisma.gradeScale.create({
            data: g
        })
    }
    console.log('Seeded grade scales')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
