import { GithubEvent } from "./github-api.ts";

const CACHE_FILE = ".github_activity_cache.json";

interface CacheEntry {
  timestamp: number;
  data: GithubEvent[];
}

export async function loadCache(): Promise<Record<string, CacheEntry>> {
  try {
    const cacheContent = await Deno.readTextFile(CACHE_FILE);
    return JSON.parse(cacheContent);
  } catch {
    return {};
  }
}

export async function saveCache(
  cache: Record<string, CacheEntry>
): Promise<void> {
  await Deno.writeTextFile(CACHE_FILE, JSON.stringify(cache));
}
