import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { getCloudflareContext } from '@opennextjs/cloudflare'

const prismaClientSingleton = () => {
  let connectionString = process.env.POSTGRES_PRISMA_URL

  try {
    const { env } = getCloudflareContext()
    if (env?.HYPERDRIVE?.connectionString) {
      connectionString = env.HYPERDRIVE.connectionString
    }
  } catch {
    // Fallback ke process.env saat proses build atau di luar konteks request Worker
  }

  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

// Menggunakan Proxy agar instance baru dibuat sesuai konteks request di Cloudflare Workers,
// dan tetap memakai singleton saat development lokal.
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