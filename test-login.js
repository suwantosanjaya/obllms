const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function test() {
  const email = 'user1@kampus.edu'; // Using a known teacher email or we can use admin
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: { prodis: true }
  });

  if (!user) {
    console.log("No user");
    return;
  }

  const { password, ...userWithoutPassword } = user;
  const roles = user.role.split(',').map(r => r.trim());
  const activeRole = roles[0];

  console.log("Result:", { ...userWithoutPassword, activeRole, roles });
}

test().catch(console.error).finally(() => prisma.$disconnect());
