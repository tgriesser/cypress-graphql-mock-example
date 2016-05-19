import { property } from 'lodash';

export const schema = [`
# This uses the exact field names returned by the GitHub API for simplicity
type Repository {
  name: String!
  full_name: String!
  description: String
  html_url: String!
  stargazers_count: Int!
  open_issues_count: Int

  # We should investigate how best to represent dates
  created_at: String!

  owner: User
}

# Uses exact field names from GitHub for simplicity
type User {
  login: String!
  avatar_url: String!
  html_url: String!
}
`];

export const resolvers = {
  Repository: {
    owner: property('owner'),
  },
};
