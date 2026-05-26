import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  console.log(prisma.institutionVisionMission ? "Model exists" : "Model missing")
}
main()
