import rp from 'request-promise';
import DataLoader from 'dataloader';

// Keys are GitHub API URLs, values are { etag, result } objects
const eTagCache = {};

const GITHUB_API_ROOT = 'https://api.github.com';

export class GitHubConnector {
  constructor({ client_id, client_secret } = {}) {
    this.client_id = client_id;
    this.client_secret = client_secret;

    // Allow mocking request promise for tests
    this.rp = rp;
    if (GitHubConnector.__mockRequestPromise) {
      this.rp = GitHubConnector.__mockRequestPromise;
    }

    this.loader = new DataLoader(this._fetch.bind(this), {
      // The GitHub API doesn't have batching, so we should send requests as
      // soon as we know about them
      batch: false,
    });
  }

  _fetch(urls) {

    const options = {
      json: true,
      resolveWithFullResponse: true,
      headers: {
        'user-agent': 'GitHunt',
      }
    };

    if (this.client_id) {
      options.qs = {
        client_id: this.client_id,
        client_secret: this.client_secret,
      };
    } 
      
    // TODO: pass GitHub API key
    
    return Promise.all(urls.map((url) => {
      const cachedRes = eTagCache[url];

      if(cachedRes && cachedRes.eTag) {
        options.headers['If-None-Match'] = cachedRes.eTag;
      }
      return new Promise((resolve, reject) => {
        this.rp({
          uri: url,
          ...options,
        }).then((response) => {
          const body = response['body'];
          eTagCache[url] = {result: body, eTag: response.headers['etag']};  
          resolve(body);
        }).catch((err) => {
          if (err.statusCode == 304) {
            resolve(cachedRes.result);
          }
        });
      });
    }));
  }

  get(path) {
    return this.loader.load(GITHUB_API_ROOT + path);
  }
}
