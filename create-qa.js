const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const bcrypt = require('bcryptjs')

async function main() {
    const deps = await prisma.department.findMany()
    const hashedPassword = await bcrypt.hash('password123', 10)

    for (const dep of deps) {
        const email = `qa.${dep.code.toLowerCase()}@example.com`
        console.log(`Creating/updating QA account: ${email} for ${dep.name}`)

        // Create or update user
        const user = await prisma.user.upsert({
            where: { email },
            update: {
                role: 'qa',
                departments: {
                    connect: { id: dep.id }
                }
            },
            create: {
                email,
                password: hashedPassword,
                name: `QA ${dep.code}`,
                role: 'qa',
                isActive: true,
                departments: {
                    connect: { id: dep.id }
                }
            }
        })

        // Ensure user is linked to the department with QA role
        await prisma.userDepartmentRole.upsert({
            where: {
                userId_departmentId_role: {
                    userId: user.id,
                    departmentId: dep.id,
                    role: 'qa'
                }
            },
            update: {},
            create: {
                userId: user.id,
                departmentId: dep.id,
                role: 'qa'
            }
        })
    }

    console.log("Successfully created QA accounts for all departments.")
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
