const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "SystemSetting" CASCADE;');
}
main();
