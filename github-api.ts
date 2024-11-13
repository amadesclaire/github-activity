import { loadCache, saveCache } from "./cache.ts";
import { GithubEventType } from "./event-types.ts";
import { fetchResult, HttpError } from "./fetchResult.ts";

const CACHE_DURATION = 60 * 1000;

export interface GithubEvent {
  type: GithubEventType;
  repo: {
    name: string;
  };
  created_at: string;
}

export async function getGithubEvents(
  username: string,
  eventTypes?: GithubEventType[]
): Promise<GithubEvent[]> {
  const cache = await loadCache();
  const cacheEntry = cache[username];

  if (cacheEntry && Date.now() - cacheEntry.timestamp < CACHE_DURATION) {
    console.log("Using cached data");
    const events = cacheEntry.data;
    return eventTypes
      ? events.filter((event) => eventTypes.includes(event.type))
      : events;
  }

  const url = new URL(`https://api.github.com/users/${username}/events`);
  const [data, err] = await fetchResult<GithubEvent[]>(url);

  if (!data) {
    if (err instanceof HttpError && err.status === 404) {
      throw new Error(`User ${username} not found`);
    }
    console.error(err?.message);
    Deno.exit(1);
  }

  cache[username] = {
    timestamp: Date.now(),
    data: data,
  };
  await saveCache(cache);

  return eventTypes
    ? data.filter((event) => eventTypes.includes(event.type))
    : data;
}
