const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
    try {
        const user = await prisma.user.findUnique({
            where: { id: "cm174swc80004o47v1q7p0hku" }
        });
        console.log("User:", user);
    } catch (e) {
        console.error("ERROR:", e);
    }
}
run();
