import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { getCloudflareContext } from '@opennextjs/cloudflare'

type ExtendedPrismaClient = PrismaClient

let cachedPrisma: ExtendedPrismaClient | null = null

function getPrismaInstance(): ExtendedPrismaClient {
    if (cachedPrisma) return cachedPrisma

    let connectionString = process.env.POSTGRES_PRISMA_URL
    let isHyperdrive = false

    try {
        const { env } = getCloudflareContext()
        if (env?.HYPERDRIVE?.connectionString) {
            connectionString = env.HYPERDRIVE.connectionString
            isHyperdrive = true
        }
    } catch {
        // Fallback saat build-time
    }

    const cleanConnectionString = connectionString
        ?.replace(/([?&])(sslmode|pgbouncer)=[^&]+(&|$)/g, '$1')
        .replace(/[?&]$/, '')

    const isLocal =
        !cleanConnectionString ||
        cleanConnectionString.includes('localhost') ||
        cleanConnectionString.includes('127.0.0.1')

    const pool = new Pool({
        connectionString: cleanConnectionString,
        ssl: isHyperdrive || isLocal ? false : { rejectUnauthorized: false },
        max: 1,
    })

    const adapter = new PrismaPg(pool)
    cachedPrisma = new PrismaClient({ adapter })
    return cachedPrisma
}

const prisma = new Proxy({} as ExtendedPrismaClient, {
    get(_target, prop) {
        const client = getPrismaInstance()
        return (client as any)[prop]
    },
})

export default prisma