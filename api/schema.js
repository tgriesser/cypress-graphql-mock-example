import { merge } from 'lodash';
import { schema as gitHubSchema, resolvers as gitHubResolvers } from './github/schema';
import { schema as sqlSchema, resolvers as sqlResolvers } from './sql/schema';

const rootSchema = [`
# To select the sort order of the feed
enum FeedType {
  HOT
  NEW
  TOP
}

type Query {
  # For the home page, the offset arg is optional to get a new page of the feed
  feed(type: FeedType!, offset: Int, limit: Int): [Entry]

  # For the entry page
  entry(repoFullName: String!): Entry

  # To display the current user on the submission page, and the navbar
  currentUser: User
}

# Type of vote
enum VoteType {
  UP
  DOWN
  CANCEL
}

type Mutation {
  # Submit a new repository
  submitRepository(repoFullName: String!): Entry

  # Vote on a repository
  vote(repoFullName: String!, type: VoteType!): Entry

  # Comment on a repository
  submitComment(repoFullName: String!, commentContent: String!): Comment
}

schema {
  query: Query
  mutation: Mutation
}
`];

const rootResolvers = {
  Query: {
    feed(_, { type, offset, limit }, context) {
      const protectedLimit = (limit < 1 || limit > 10) ? 10 : limit;

      return context.Entries.getForFeed(type, offset, protectedLimit);
    },
    entry(_, { repoFullName }, context) {
      return context.Entries.getByRepoFullName(repoFullName);
    },
    currentUser(_, __, context) {
      return context.user || null;
    },
  },
  Mutation: {
    submitRepository(_, { repoFullName }, context) {
      if (! context.user) {
        throw new Error('Must be logged in to submit a repository.');
      }

      return Promise.resolve()
        .then(() => (
          context.Repositories.getByFullName(repoFullName)
            .catch(() => {
              throw new Error(`Couldn't find repository named "${repoFullName}"`);
            })
        ))
        .then(() => (
          context.Entries.submitRepository(repoFullName, context.user.login)
        ))
        .then(() => context.Entries.getByRepoFullName(repoFullName));
    },
    submitComment(_, { repoFullName, commentContent }, context) {
      if (!context.user) {
        throw new Error('Must be logged in to submit a comment.');
      }
      return Promise.resolve()
        .then(() => (
          context.Comments.submitComment(
            repoFullName,
            context.user.login,
            commentContent
          )
        ))
        .then(([id]) => (
          context.Comments.getCommentById(id)
        ));
    },

    vote(_, { repoFullName, type }, context) {
      if (! context.user) {
        throw new Error('Must be logged in to vote.');
      }

      const voteValue = {
        UP: 1,
        DOWN: -1,
        CANCEL: 0,
      }[type];

      return context.Entries.voteForEntry(
        repoFullName,
        voteValue,
        context.user.login
      ).then(() => (
        context.Entries.getByRepoFullName(repoFullName)
      ));
    },
  },
};

export const schema = [...rootSchema, ...gitHubSchema, ...sqlSchema];
export const resolvers = merge(rootResolvers, gitHubResolvers, sqlResolvers);
