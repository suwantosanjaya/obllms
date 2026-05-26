const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        include: { departmentRoles: true, departments: true }
    });
    
    const firstDept = await prisma.department.findFirst();
    if (!firstDept) {
        console.log("No departments found");
        return;
    }

    for (const user of users) {
        if (user.departmentRoles.length === 0) {
            console.log(`Fixing user ${user.email} (${user.role})`);
            const roleToAssign = user.role;
            if (roleToAssign && roleToAssign !== 'super_admin') {
                await prisma.userDepartmentRole.create({
                    data: {
                        userId: user.id,
                        departmentId: user.departments.length > 0 ? user.departments[0].id : firstDept.id,
                        role: roleToAssign
                    }
                });
                console.log(`  Assigned role ${roleToAssign} to department`);
            }
        }
    }
    console.log("Done");
}

main().catch(console.error).finally(() => prisma.$disconnect());
