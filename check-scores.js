const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const scores = await prisma.submissionCLOScore.findMany({
        where: {
            cloId: 'cmpmnfx4l000f3up2xpvq3oas',
            submission: {
                assessment: {
                    course: {
                        subjectId: { notIn: ['cmpjk8c4i001prmbu20g76lhk'] }
                    }
                }
            }
        },
        include: {
            submission: { include: { assessment: { include: { course: true } } } }
        }
    });
    console.log('Scores with NOT IN pancasila:', scores.length);
    if(scores.length > 0) console.log('Score 0 course subject:', scores[0].submission.assessment.course.subjectId);

    const allScores = await prisma.submissionCLOScore.findMany({
        where: {
            cloId: 'cmpmnfx4l000f3up2xpvq3oas'
        }
    });
    console.log('All scores for CLO-11:', allScores.length);
}
main();
