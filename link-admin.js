const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://postgres:12345657890@localhost:5432/postgres?schema=public"
        }
    }
});
async function main() {
    const uinSuska = await prisma.university.findFirst({ where: { code: 'UIN-SUSKA' } });
    const adminUser = await prisma.user.findFirst({ where: { email: 'user6@kampus.edu' } });
    if (uinSuska && adminUser) {
        await prisma.userUniversityRole.upsert({
            where: { userId_universityId_role: { userId: adminUser.id, universityId: uinSuska.id, role: 'admin' } },
            update: {},
            create: { userId: adminUser.id, universityId: uinSuska.id, role: 'admin' }
        });
        console.log('Linked admin user to UIN Suska');
    }
}
main().catch(console.error).finally(() => prisma.$disconnect());
