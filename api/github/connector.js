import rp from 'request-promise';
import DataLoader from 'dataloader';

// Keys are GitHub API URLs, values are { etag, result } objects
const eTagCache = {};

export class GitHubConnector {
  constructor() {
    this.loader = new DataLoader(this.fetch);
  }

  fetch(urls) {
    const options = {
      json: true,
    };

    // TODO: implement ETags
    // TODO: pass GitHub API key

    return Promise.all(urls.map((url) => {
      return rp({
        url: url,
        ...options,
      });
    }));
  }
}
