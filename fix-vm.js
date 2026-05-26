const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const deps = await prisma.department.findMany()
    if (deps.length === 0) return

    const defaultDep = deps[0].id // TIF usually

    const vms = await prisma.institutionVisionMission.findMany({
        where: { departmentId: null }
    })

    console.log(`Found ${vms.length} Vision/Missions with null departmentId.`)

    for (const vm of vms) {
        await prisma.institutionVisionMission.update({
            where: { id: vm.id },
            data: { departmentId: defaultDep }
        })
        console.log(`Updated VM ${vm.id} (${vm.code}) to departmentId ${defaultDep}`)
    }

    console.log("Finished fixing Vision/Missions.")
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
