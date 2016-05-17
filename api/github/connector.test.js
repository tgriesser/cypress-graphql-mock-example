import { assert } from 'chai';
import { deepEqual } from 'lodash';
import { GitHubConnector } from './connector';

const requestQueue = [];

function mockRequestPromise(requestOptions) {
  // Ensure we expected to get more requests
  assert.notEqual(requestQueue.length, 0);

  const nextRequest = requestQueue.shift();

  // Ensure this is the request we expected
  assert.deepEqual(requestOptions, nextRequest.options);

  return new Promise((resolve, reject) => {
    if (nextRequest.result) {
      resolve(result);
    } else if (nextRequest.error) {
      reject(nextRequest.error);
    } else {
      throw new Error('Mocked request must have result or error.');
    }
  });
}

GitHubConnector.__mockRequestPromise = mockRequestPromise;

describe('GitHub connector', () => {
  it('can be constructed', () => {
    assert.isOk(new GitHubConnector());
  });
});
