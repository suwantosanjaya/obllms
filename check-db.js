const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://postgres:12345657890@localhost:5432/postgres?schema=public"
        }
    }
});
async function main() {
    const d = await prisma.department.findMany();
    console.log(d.length + " departments found in local db");
}
main().catch(console.error).finally(() => prisma.$disconnect());
