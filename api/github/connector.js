import rp from 'request-promise';
import DataLoader from 'dataloader';

// Keys are GitHub API URLs, values are { etag, result } objects
const eTagCache = {};

const GITHUB_API_ROOT = 'https://api.github.com';

export class GitHubConnector {
  constructor() {
    this.rp = rp;

    // Allow mocking request promise for tests
    if (GitHubConnector.__mockRequestPromise) {
      this.rp = GitHubConnector.__mockRequestPromise;
    }

    this.loader = new DataLoader(this._fetch);
  }

  _fetch(urls) {
    const options = {
      json: true,
    };

    // TODO: implement ETags
    // TODO: pass GitHub API key

    return Promise.all(urls.map((url) => {
      return this.rp({
        url: url,
        ...options,
      });
    }));
  }

  get(path) {
    return this.loader.load(GITHUB_API_ROOT + path);
  }
}
