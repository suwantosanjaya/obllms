const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const feedbacks = await prisma.feedback.findMany();
    console.log('Total feedbacks:', feedbacks.length);
}
main();
