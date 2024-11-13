import { getEventText, GithubEventType } from "./event-types.ts";
import { getGithubEvents } from "./github-api.ts";

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
}

if (import.meta.main) {
  main();
}
