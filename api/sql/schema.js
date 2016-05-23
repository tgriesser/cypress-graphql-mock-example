import { property, constant } from 'lodash';

export const schema = [`
type Comment {
  postedBy: User!
  createdAt: Int! # Actually a date
  content: String!
}

type Entry {
  repository: Repository!
  postedBy: User!
  createdAt: Float! # Actually a date
  score: Int!
  comments: [Comment]! # Should this be paginated?
  commentCount: Int!
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
  },
  Comment: {
    postedBy() {
      throw new Error('Not implemented.');
    },
  }
}
