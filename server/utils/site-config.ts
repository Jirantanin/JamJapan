import { getPrisma } from './prisma'

// In-memory cache for site config values
const cache = new Map<string, { value: string; fetchedAt: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export async function getSiteConfig(key: string): Promise<string | null> {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
    return cached.value
  }

  try {
    const prisma = await getPrisma()
    const config = await prisma.siteConfig.findUnique({ where: { key } })

    if (config) {
      cache.set(key, { value: config.value, fetchedAt: Date.now() })
      return config.value
    }
  } catch (error) {
    // Fail-safe: if SiteConfig table doesn't exist or query fails,
    // return null so callers use their fallback values
    console.warn(`[SiteConfig] Failed to fetch key "${key}":`, error)
  }

  return null
}

export async function getSiteConfigNumber(key: string, fallback: number): Promise<number> {
  const value = await getSiteConfig(key)
  if (value === null) return fallback
  const parsed = Number(value)
  return Number.isNaN(parsed) ? fallback : parsed
}

export function clearSiteConfigCache(key?: string): void {
  if (key) {
    cache.delete(key)
  } else {
    cache.clear()
  }
}
