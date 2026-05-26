const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const deps = await prisma.department.findMany()
    if (deps.length === 0) return

    const defaultDep = deps[0].id // TIF usually

    const courses = await prisma.course.findMany({
        where: { departmentId: null },
        include: { subject: true, instructor: { include: { departmentRoles: true } } }
    })

    console.log(`Found ${courses.length} courses with null departmentId.`)

    for (const course of courses) {
        let newDepId = defaultDep

        // If subject belongs to a department, use that
        if (course.subject && course.subject.departmentId) {
            newDepId = course.subject.departmentId
        } 
        // Else if instructor belongs to a department, use their first department
        else if (course.instructor && course.instructor.departmentRoles && course.instructor.departmentRoles.length > 0) {
            newDepId = course.instructor.departmentRoles[0].departmentId
        }

        await prisma.course.update({
            where: { id: course.id },
            data: { departmentId: newDepId }
        })
        console.log(`Updated course ${course.id} (${course.classCode}) to departmentId ${newDepId}`)
    }

    console.log("Finished fixing courses.")
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
