import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { getCloudflareContext } from '@opennextjs/cloudflare'

const prismaClientSingleton = () => {
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

declare const globalThis: {
    prismaGlobal: ReturnType<typeof prismaClientSingleton>
} & typeof global

const prisma = new Proxy({} as ReturnType<typeof prismaClientSingleton>, {
    get(_target, prop) {
        if (process.env.NODE_ENV !== 'production') {
            if (!globalThis.prismaGlobal) {
                globalThis.prismaGlobal = prismaClientSingleton()
            }
            return Reflect.get(globalThis.prismaGlobal, prop)
        }

        const client = prismaClientSingleton()
        return Reflect.get(client, prop)
    },
})

export default prisma