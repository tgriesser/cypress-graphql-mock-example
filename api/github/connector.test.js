import { assert } from 'chai';
import { GitHubConnector } from './connector';

let requestQueue = [];

function mockRequestPromise(requestOptions) {
  // Ensure we expected to get more requests
  assert.notEqual(requestQueue.length, 0);

  const nextRequest = requestQueue.shift();
  // Ensure this is the request we expected
  assert.deepEqual(requestOptions, nextRequest.options);

  return new Promise((resolve, reject) => {
    if (nextRequest.result) {
      resolve(nextRequest.result);
    } else if (nextRequest.error) {
      reject(nextRequest.error);
    } else {
      throw new Error('Mocked request must have result or error.');
    }
  });
}

function pushMockRequest({ options, result, error }) {
  const defaultOptions = {
    json: true,
    headers: {
      'user-agent': 'GitHunt',
    },
    resolveWithFullResponse: true,
  };
  const { uri, ...rest } = options;

  const url = `https://api.github.com${uri}`;

  requestQueue.push({
    options: {
      ...defaultOptions,
      ...rest,
      uri: url,
    },
    result,
    error,
  });
}

GitHubConnector.mockRequestPromise = mockRequestPromise;

describe('GitHub connector', () => {
  beforeEach(() => {
    requestQueue = [];
  });

  afterEach(() => {
    assert.equal(requestQueue.length, 0);
  });

  it('can be constructed', () => {
    assert.isOk(new GitHubConnector());
  });

  it('can load one endpoint', () => {
    const connector = new GitHubConnector();

    pushMockRequest({
      options: { uri: '/endpoint' },
      result: {
        headers: {},
        body: { id: 1 },
      },
    });

    return connector.get('/endpoint').then((result) => {
      assert.deepEqual(result, { id: 1 });
    });
  });

  it('fetches each endpoint only once per instance', () => {
    const connector = new GitHubConnector();

    pushMockRequest({
      options: {
        uri: '/endpoint',
      },
      result: {
        headers: {},
        body: { id: 1 },
      },
    });

    return connector.get('/endpoint')
      .then((result) => {
        assert.deepEqual(result, { id: 1 });
      })
      .then(() => (
        // This get call doesn't actually call the API - note that we only
        // enqueued the request mock once!
        connector.get('/endpoint')
      ))
      .then((result) => {
        assert.deepEqual(result, { id: 1 });
      });
  });

  it('passes through the API token for unauthenticated requests', () => {
    const connector = new GitHubConnector({
      clientId: 'fake_client_id',
      clientSecret: 'fake_client_secret',
    });

    pushMockRequest({
      options: {
        uri: '/endpoint',
        qs: {
          client_id: 'fake_client_id',
          client_secret: 'fake_client_secret',
        },
      },
      result: {
        headers: {},
        body: {
          id: 1,
        },
      },
    });

    return connector.get('/endpoint').then((result) => {
      assert.deepEqual(result, { id: 1 });
    });
  });

  it('should correctly interpret etags from Github', () => {
    const connector = new GitHubConnector();
    const etag = 'etag';

    pushMockRequest({
      options: {
        uri: '/endpoint',
      },
      result: {
        headers: {
          etag,
        },
        body: {
          id: 1,
        },
      },
    });

    const connector2 = new GitHubConnector();

    pushMockRequest({
      options: {
        uri: '/endpoint',
        headers: {
          'If-None-Match': etag,
          'user-agent': 'GitHunt',
        },
      },
      result: {
        headers: {},
        body: {
          id: 1,
        },
      },
    });

    return connector.get('/endpoint')
      .then(() => connector2.get('/endpoint'))
      .then((result) => {
        assert.deepEqual(result, { id: 1 });
      });
  });
});
