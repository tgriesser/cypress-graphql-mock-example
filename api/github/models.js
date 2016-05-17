import { GitHubConnector } from './connector';

export class Repositories {
  constructor() {
    this.connector = new GitHubConnector();
  }

  getByFullName(fullName) {
    return this.connector.get(`/repos/${fullName}`);
  }
}

export class Users {
  constructor() {
    this.connector = new GitHubConnector();
  }

  getByLogin(username) {
    return this.connector.get(`/users/${username}`);
  }
}
