const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const activeCurriculum = await prisma.curriculumYear.findFirst({ where: { isActive: true } });
    const excluded = await prisma.curriculumSubject.findMany({ where: { includeInAnalytics: false } });
    const excludedSubjectIds = excluded.map(e => e.subjectId);
    console.log('excludedSubjectIds:', excludedSubjectIds);

    const scoresWhere = {
        cloId: 'cmpmnfx4l000f3up2xpvq3oas'
    };

    if (excludedSubjectIds.length > 0) {
        scoresWhere.submission = {
            assessment: {
                course: {
                    subjectId: { notIn: excludedSubjectIds }
                }
            }
        };
    }
    
    console.log('scoresWhere:', JSON.stringify(scoresWhere, null, 2));

    const scores = await prisma.submissionCLOScore.findMany({
        where: scoresWhere,
        include: {
            submission: { include: { assessment: { include: { course: true } } } }
        }
    });
    console.log('Found scores:', scores.length);
    if (scores.length > 0) {
        console.log('First score subjectId:', scores[0].submission.assessment.course.subjectId);
    }
}
main();
