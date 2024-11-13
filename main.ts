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

async function main() {
  const args = Deno.args;
  if (args.length < 1) {
    console.error("Usage: ./github-activity <username> [arguments]");
    Deno.exit(1);
  }
  const username = args[0];
  const url = new URL(`https://api.github.com/users/${username}/events`);

  const [data, err] = await fetchResult<any>(url);
  if (err) {
    if (err instanceof HttpError && err.status === 404) {
      console.error(`User ${username} not found`);
    } else {
      console.error(err.message);
    }
    Deno.exit(1);
  }

  console.log("Output:");

  await data.forEach((event: any) => {
    switch (event?.type) {
      case "WatchEvent":
        // statement
        break;
    }

    const eventText = getEventText(event?.type);
    const repo = event?.repo?.name;
    console.log(`- ${eventText} `);
  });
}

if (import.meta.main) {
  main();
}
