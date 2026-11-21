import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { getCloudflareContext } from '@opennextjs/cloudflare'

type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>

function createPrismaClient(
    connectionString: string | undefined,
    isHyperdrive: boolean
) {
    const cleanConnectionString = connectionString
        ?.replace(/([?&])(sslmode|pgbouncer)=[^&]+(&|$)/g, '$1')
        .replace(/[?&]$/, '')

    const isLocal =
        !cleanConnectionString ||
        cleanConnectionString.includes('localhost') ||
        cleanConnectionString.includes('127.0.0.1')

    const pool = new Pool({
        connectionString: cleanConnectionString,
        // Matikan SSL jika lewat Hyperdrive atau database lokal; aktifkan SSL untuk koneksi langsung ke Supabase/cloud
        ssl: isHyperdrive || isLocal ? false : { rejectUnauthorized: false },
        max: 1,
    })

    const adapter = new PrismaPg(pool)
    return new PrismaClient({ adapter })
}

// Cache instance PrismaClient berdasarkan target koneksi agar parsing schema hanya dijalankan 1x
const clientCache = new Map<string, ExtendedPrismaClient>()

function getPrismaInstance(): ExtendedPrismaClient {
    let connectionString = process.env.POSTGRES_PRISMA_URL
    let isHyperdrive = false

    try {
        const { env } = getCloudflareContext()
        if (env?.HYPERDRIVE?.connectionString) {
            connectionString = env.HYPERDRIVE.connectionString
            isHyperdrive = true
        }
    } catch {
        // Fallback ke process.env saat proses build atau di luar konteks request Worker
    }

    const cacheKey = `${isHyperdrive ? 'hd' : 'direct'}:${connectionString ?? 'default'}`

    let client = clientCache.get(cacheKey)
    if (!client) {
        client = createPrismaClient(connectionString, isHyperdrive)
        clientCache.set(cacheKey, client)
    }

    return client
}

const prisma = new Proxy({} as ExtendedPrismaClient, {
    get(_target, prop) {
        const client = getPrismaInstance()
        const value = Reflect.get(client, prop)
        return typeof value === 'function' ? value.bind(client) : value
    },
})

export default prisma