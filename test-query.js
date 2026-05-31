const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    try {
        const plos = await prisma.programLearningOutcome.findMany({
            where: { 
                departmentId: "cmpkq54ha00099nmy0fzffhs3"
            },
            include: {
                clos: {
                    include: {
                        submissionCLOScore: {
                            where: {
                                submission: {
                                    assessment: {
                                        course: {
                                            semester: 'Genap',
                                            departmentId: "cmpkq54ha00099nmy0fzffhs3"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        console.log("Success! plos length:", plos.length);
    } catch (e) {
        console.error("ERROR:", e.message);
    }
}
run();
