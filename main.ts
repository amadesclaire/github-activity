import { fetchResult, HttpError } from "./fetchResult.ts";

type GithubEventType =
  | "CommitCommentEvent"
  | "CreateEvent"
  | "DeleteEvent"
  | "ForkEvent"
  | "IssueCommentEvent"
  | "IssuesEvent"
  | "MemberEvent"
  | "PublicEvent"
  | "PullRequestEvent"
  | "PullRequestReviewEvent"
  | "PullRequestReviewCommentEvent"
  | "PullRequestReviewThreadEvent"
  | "PushEvent"
  | "ReleaseEvent"
  | "SponsorshipEvent"
  | "WatchEvent";

export interface GithubEvent {
  type: GithubEventType;
  repo: {
    name: string;
  };
  created_at: string;
}

const getEventText = (eventType: GithubEventType): string => {
  const eventDescriptions: Record<GithubEventType, string> = {
    WatchEvent: "starred",
    ForkEvent: "forked",
    CreateEvent: "created",
    DeleteEvent: "deleted",
    PushEvent: "pushed to",
    IssuesEvent: "updated an issue in",
    IssueCommentEvent: "commented on an issue in",
    PullRequestEvent: "made a pull request in",
    PullRequestReviewEvent: "reviewed a pull request in",
    PullRequestReviewCommentEvent: "commented on a pull request in",
    PullRequestReviewThreadEvent: "started a review thread in",
    CommitCommentEvent: "commented on a commit in",
    ReleaseEvent: "created a release in",
    PublicEvent: "made public",
    MemberEvent: "updated collaborators in",
    SponsorshipEvent: "updated sponsorship for",
  };

  return eventDescriptions[eventType] || "interacted with";
};

const CACHE_FILE = ".github_activity_cache.json";

interface CacheEntry {
  timestamp: number;
  data: GithubEvent[];
}

async function loadCache(): Promise<Record<string, CacheEntry>> {
  try {
    const cacheContent = await Deno.readTextFile(CACHE_FILE);
    return JSON.parse(cacheContent);
  } catch {
    return {};
  }
}

async function saveCache(cache: Record<string, CacheEntry>): Promise<void> {
  await Deno.writeTextFile(CACHE_FILE, JSON.stringify(cache));
}

const CACHE_DURATION = 60 * 1000;

async function getGithubEvents(
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

async function main() {
  const args = Deno.args;

  if (args[0] === "--help") {
    const eventTypes = [
      "CommitCommentEvent",
      "CreateEvent",
      "DeleteEvent",
      "ForkEvent",
      "IssueCommentEvent",
      "IssuesEvent",
      "MemberEvent",
      "PublicEvent",
      "PullRequestEvent",
      "PullRequestReviewEvent",
      "PullRequestReviewCommentEvent",
      "PullRequestReviewThreadEvent",
      "PushEvent",
      "ReleaseEvent",
      "SponsorshipEvent",
      "WatchEvent",
    ];

    console.log(
      "Fetches the latest public events for a GitHub user.\n\n" +
        "Usage: ./github-activity <username> [--type=eventType1,eventType2,...]\n\n" +
        "Available event types:\n" +
        eventTypes.map((type) => `  - ${type}`).join("\n")
    );
    Deno.exit(0);
  }
  if (args.length < 1) {
    console.error(
      "Usage: ./github-activity <username> [--type=eventType1,eventType2,...]"
    );
    Deno.exit(1);
  }

  const username = args[0];
  let eventTypes: GithubEventType[] | undefined;

  const typeArg = args.find((arg) => arg.startsWith("--type="));
  if (typeArg) {
    const types = typeArg.split("=")[1].split(",");
    eventTypes = types as GithubEventType[];
  }

  try {
    const events = await getGithubEvents(username, eventTypes);

    if (events.length === 0) {
      console.log("No events found");
      return;
    }

    console.log("Output:");

    events.forEach((event) => {
      const eventText = getEventText(event.type);
      const repo = event.repo.name;
      console.log(`- ${eventText} ${repo}`);
    });
  } catch (error) {
    console.error(error.message);
    Deno.exit(1);
  }
}

if (import.meta.main) {
  main();
}
