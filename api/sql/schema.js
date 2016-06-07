import { property, constant } from 'lodash';

export const schema = [`
type Comment {
  postedBy: User!
  createdAt: Int! # Actually a date
  content: String!
}

type Vote {
  vote_value: Int!
}

type Entry {
  repository: Repository!
  postedBy: User!
  createdAt: Float! # Actually a date
  score: Int!
  comments: [Comment]! # Should this be paginated?
  commentCount: Int!
  id: Int!
  vote: Vote!
}
`];

export const resolvers = {
  Entry: {
    repository({ repository_name }, _, context) {
      return context.Repositories.getByFullName(repository_name);
    },
    postedBy({ posted_by }, _, context) {
      return context.Users.getByLogin(posted_by);
    },
    comments() {
      throw new Error('Not implemented.');
    },
    createdAt: property('created_at'),
    commentCount: constant(0),
    vote({ repository_name }, _, context) {
      if (!context.user) return { vote_value: 0 };
      return context.Entries.haveVotedForEntry(repository_name, context.user.login);
    },
  },
  Comment: {
    postedBy() {
      throw new Error('Not implemented.');
    },
  },
};
