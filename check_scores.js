const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const scores = await prisma.submissionCLOScore.findMany({
    include: {
      clo: { select: { code: true } },
      submission: {
        include: { assessment: { include: { course: { include: { subject: { select: { id: true, code: true } } } } } } }
      }
    }
  })
  console.log("Total Scores:", scores.length)
  scores.forEach(s => {
     console.log(`CLO: ${s.clo.code}, Score: ${s.score}, Subject: ${s.submission.assessment.course.subject.code}`)
  })
}

main().finally(() => prisma.$disconnect())
