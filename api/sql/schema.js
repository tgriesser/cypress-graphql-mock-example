export const schema = [`
type Comment {
  postedBy: User!
  createdAt: String! # Actually a date
  content: String!
}

type Entry {
  repository: Repository!
  postedBy: User!
  createdAt: String! # Actually a date
  score: Int!
  comments: [Comment]! # Should this be paginated?
  commentCount: Int!
}
`];

export const resolvers = {
  Entry: {
    repository({ fullName }, _, { connectors }) {
      return connectors.Repositories.getByFullName(fullName);
    },
    postedBy() {
      throw new Error('Not implemented.');
    },
    comments() {
      throw new Error('Not implemented.');
    },
  },
  Comment: {
    postedBy() {
      throw new Error('Not implemented.');
    },
  }
}
