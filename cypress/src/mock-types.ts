/* tslint:disable */

export interface Query {
  feed?: Entry[] | null /** A feed of repository submissions */;
  entry?: Entry | null /** A single entry */;
  currentUser?: User | null /** Return the currently logged in user, or null if nobody is logged in */;
}
/** Information about a GitHub repository submitted to GitHunt */
export interface Entry {
  repository?: Repository | null /** Information about the repository from GitHub */;
  postedBy?: User | null /** The GitHub user who submitted this entry */;
  createdAt: number /** A timestamp of when the entry was submitted */;
  score: number /** The score of this repository, upvotes - downvotes */;
  hotScore: number /** The hot score of this repository */;
  comments: Comment[] /** Comments posted about this repository */;
  commentCount: number /** The number of comments posted about this repository */;
  id: number /** The SQL ID of this entry */;
  vote: Vote /** XXX to be changed */;
}
/** A repository object from the GitHub API. This uses the exact field names returned by theGitHub API for simplicity, even though the convention for GraphQL is usually to camel case. */
export interface Repository {
  name: string /** Just the name of the repository, e.g. GitHunt-API */;
  full_name: string /** The full name of the repository with the username, e.g. apollostack/GitHunt-API */;
  description?: string | null /** The description of the repository */;
  html_url: string /** The link to the repository on GitHub */;
  stargazers_count: number /** The number of people who have starred this repository on GitHub */;
  open_issues_count?:
    | number
    | null /** The number of open issues on this repository on GitHub */;
  owner?: User | null /** The owner of this repository on GitHub, e.g. apollostack */;
}
/** A user object from the GitHub API. This uses the exact field names returned from the GitHub API. */
export interface User {
  login: string /** The name of the user, e.g. apollostack */;
  avatar_url: string /** The URL to a directly embeddable image for this user's avatar */;
  html_url: string /** The URL of this user's GitHub page */;
}
/** A comment about an entry, submitted by a user */
export interface Comment {
  id: number /** The SQL ID of this entry */;
  postedBy?: User | null /** The GitHub user who posted the comment */;
  createdAt: number /** A timestamp of when the comment was posted */;
  content: string /** The text of the comment */;
  repoName: string /** The repository which this comment is about */;
}
/** XXX to be removed */
export interface Vote {
  vote_value: number;
}

export interface Mutation {
  submitRepository?: Entry | null /** Submit a new repository, returns the new submission */;
  vote?: Entry | null /** Vote on a repository submission, returns the submission that was voted on */;
  submitComment?: Comment | null /** Comment on a repository, returns the new comment */;
}

export interface Subscription {
  commentAdded?: Comment | null /** Subscription fires on every comment added */;
}
export interface FeedQueryArgs {
  type: FeedType /** The sort order for the feed */;
  offset?: number | null /** The number of items to skip, for pagination */;
  limit?:
    | number
    | null /** The number of items to fetch starting from the offset, for pagination */;
}
export interface EntryQueryArgs {
  repoFullName: string /** The full repository name from GitHub, e.g. "apollostack/GitHunt-API" */;
}
export interface CommentsEntryArgs {
  limit?: number | null;
  offset?: number | null;
}
export interface SubmitRepositoryMutationArgs {
  repoFullName: string /** The full repository name from GitHub, e.g. "apollostack/GitHunt-API" */;
}
export interface VoteMutationArgs {
  repoFullName: string /** The full repository name from GitHub, e.g. "apollostack/GitHunt-API" */;
  type: VoteType /** The type of vote - UP, DOWN, or CANCEL */;
}
export interface SubmitCommentMutationArgs {
  repoFullName: string /** The full repository name from GitHub, e.g. "apollostack/GitHunt-API" */;
  commentContent: string /** The text content for the new comment */;
}
export interface CommentAddedSubscriptionArgs {
  repoFullName: string;
}
/** A list of options for the sort order of the feed */
export enum FeedType {
  HOT = 'HOT',
  NEW = 'NEW',
  TOP = 'TOP',
}
/** The type of vote to record, when submitting a vote */
export enum VoteType {
  UP = 'UP',
  DOWN = 'DOWN',
  CANCEL = 'CANCEL',
}

export type CommentVariables = {
  repoName: string;
};

export type CommentQuery = Partial<{
  __typename?: 'Query';
  currentUser?: CommentCurrentUser | null;
  entry?: CommentEntry | null;
}>;

export type CommentCurrentUser = Partial<{
  __typename?: 'User';
  login: string;
  html_url: string;
}>;

export type CommentEntry = Partial<{
  __typename?: 'Entry';
  id: number;
  postedBy?: CommentPostedBy | null;
  createdAt: number;
  comments: CommentComments[];
  repository?: CommentRepository | null;
}>;

export type CommentPostedBy = Partial<{
  __typename?: 'User';
  login: string;
  html_url: string;
}>;

export type CommentComments = CommentsPageCommentFragment;

export type CommentRepository = Partial<{
  __typename?: 'Repository';
  full_name: string;
  html_url: string;
  description?: string | null;
  open_issues_count?: number | null;
  stargazers_count: number;
}>;

export type OnCommentAddedVariables = {
  repoFullName: string;
};

export type OnCommentAddedSubscription = Partial<{
  __typename?: 'Subscription';
  commentAdded?: OnCommentAddedCommentAdded | null;
}>;

export type OnCommentAddedCommentAdded = CommentsPageCommentFragment;

export type FeedVariables = {
  type: FeedType;
  offset?: number | null;
  limit?: number | null;
};

export type FeedQuery = Partial<{
  __typename?: 'Query';
  feed?: FeedFeed[] | null;
}>;

export type FeedFeed = FeedEntryFragment;

export type CurrentUserForLayoutVariables = {};

export type CurrentUserForLayoutQuery = Partial<{
  __typename?: 'Query';
  currentUser?: CurrentUserForLayoutCurrentUser | null;
}>;

export type CurrentUserForLayoutCurrentUser = Partial<{
  __typename?: 'User';
  login: string;
  avatar_url: string;
}>;

export type SubmitCommentVariables = {
  repoFullName: string;
  commentContent: string;
};

export type SubmitCommentMutation = Partial<{
  __typename?: 'Mutation';
  submitComment?: SubmitCommentSubmitComment | null;
}>;

export type SubmitCommentSubmitComment = CommentsPageCommentFragment;

export type SubmitRepositoryVariables = {
  repoFullName: string;
};

export type SubmitRepositoryMutation = Partial<{
  __typename?: 'Mutation';
  submitRepository?: SubmitRepositorySubmitRepository | null;
}>;

export type SubmitRepositorySubmitRepository = Partial<{
  __typename?: 'Entry';
  createdAt: number;
}>;

export type VoteVariables = {
  repoFullName: string;
  type: VoteType;
};

export type VoteMutation = Partial<{
  __typename?: 'Mutation';
  vote?: VoteVote | null;
}>;

export type VoteVote = Partial<{
  __typename?: 'Entry';
  score: number;
  id: number;
  vote: Vote_Vote;
}>;

export type Vote_Vote = Partial<{
  __typename?: 'Vote';
  vote_value: number;
}>;

export type CommentsPageCommentFragment = Partial<{
  __typename?: 'Comment';
  id: number;
  postedBy?: CommentsPageCommentPostedBy | null;
  createdAt: number;
  content: string;
}>;

export type CommentsPageCommentPostedBy = Partial<{
  __typename?: 'User';
  login: string;
  html_url: string;
}>;

export type FeedEntryFragment = Partial<{
  __typename?: 'Entry';
  id: number;
  commentCount: number;
  repository?: FeedEntryRepository | null;
}> &
  VoteButtonsFragment &
  RepoInfoFragment;

export type FeedEntryRepository = Partial<{
  __typename?: 'Repository';
  full_name: string;
  html_url: string;
  owner?: FeedEntryOwner | null;
}>;

export type FeedEntryOwner = Partial<{
  __typename?: 'User';
  avatar_url: string;
}>;

export type VoteButtonsFragment = Partial<{
  __typename?: 'Entry';
  score: number;
  vote: VoteButtonsVote;
}>;

export type VoteButtonsVote = Partial<{
  __typename?: 'Vote';
  vote_value: number;
}>;

export type RepoInfoFragment = Partial<{
  __typename?: 'Entry';
  createdAt: number;
  repository?: RepoInfoRepository | null;
  postedBy?: RepoInfoPostedBy | null;
}>;

export type RepoInfoRepository = Partial<{
  __typename?: 'Repository';
  description?: string | null;
  stargazers_count: number;
  open_issues_count?: number | null;
}>;

export type RepoInfoPostedBy = Partial<{
  __typename?: 'User';
  html_url: string;
  login: string;
}>;

export interface Mocks_AllOperations {
  Comment: CommentQuery | ((args: CommentVariables) => CommentQuery);
  OnCommentAdded:
    | OnCommentAddedSubscription
    | ((args: OnCommentAddedVariables) => OnCommentAddedSubscription);
  Feed: FeedQuery | ((args: FeedVariables) => FeedQuery);
  CurrentUserForLayout:
    | CurrentUserForLayoutQuery
    | ((args: CurrentUserForLayoutVariables) => CurrentUserForLayoutQuery);
  SubmitComment:
    | SubmitCommentMutation
    | ((args: SubmitCommentVariables) => SubmitCommentMutation);
  SubmitRepository:
    | SubmitRepositoryMutation
    | ((args: SubmitRepositoryVariables) => SubmitRepositoryMutation);
  Vote: VoteMutation | ((args: VoteVariables) => VoteMutation);
}
