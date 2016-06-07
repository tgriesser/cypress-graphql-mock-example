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
  # For the home page, after arg is optional to get a new page of the feed
  # Pagination TBD - what's the easiest way to have the client handle this?
  feed(type: FeedType!, after: String): [Entry]

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
  # TBD: Should this return an Entry or just the new Comment?
  comment(repoFullName: String!, content: String!): Entry
}

schema {
  query: Query
  mutation: Mutation
}
`];

const rootResolvers = {
  Query: {
    feed(_, { type, after }, context) {
      return context.Entries.getForFeed(type);
    },
    entry(_, { repoFullName }, context) {
      return context.Entries.getByRepoFullName(repoFullName);
    },
    currentUser(_, __, context) {
      return context.user;
    },
  },
  Mutation: {
    submitRepository(_, { repoFullName }, context) {
      if (! context.user) {
        throw new Error('Must be logged in to submit a repository.');
      }

      return Promise.resolve()
        .then(() => {
          return context.Repositories.getByFullName(repoFullName)
            .catch(() => {
              throw new Error(`Couldn't find repository named "${repoFullName}"`);
            });
        })
        .then(() => {
          return context.Entries.submitRepository(
            repoFullName,
            context.user.login
          )
        })
        .then(() => {
          return context.Entries.getByRepoFullName(repoFullName)
        });
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

    comment() {
      throw new Error('Not implemented.');
    },
  },
};

export const schema = [...rootSchema, ...gitHubSchema, ...sqlSchema];
export const resolvers = merge(rootResolvers, gitHubResolvers, sqlResolvers);
