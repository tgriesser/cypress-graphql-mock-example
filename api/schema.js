import { merge } from 'lodash';

import { schema as gitHubSchema } from './github/schema';
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
    currentUser() {
      throw new Error('Not implemented.');
    },
  },
  Mutation: {
    submitRepository() {
      throw new Error('Not implemented.');
    },
    vote() {
      throw new Error('Not implemented.');
    },
    comment() {
      throw new Error('Not implemented.');
    },
  }
};

export const schema = [...rootSchema, ...gitHubSchema, ...sqlSchema];
export const resolvers = merge(rootResolvers, sqlResolvers);
