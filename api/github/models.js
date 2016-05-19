export class Repositories {
  constructor({ connector }) {
    this.connector = connector;
  }

  getByFullName(fullName) {
    return this.connector.get(`/repos/${fullName}`);
  }
}

export class Users {
  constructor({ connector }) {
    this.connector = connector;
  }

  getByLogin(username) {
    return this.connector.get(`/users/${username}`);
  }
}
