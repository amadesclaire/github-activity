export type GithubEventType =
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

export function getEventText(eventType: GithubEventType): string {
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
}
