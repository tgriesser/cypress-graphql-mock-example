import React from 'react';
import { render } from 'react-dom';
import { Router, browserHistory } from 'react-router';
import ApolloClient, { createNetworkInterface, addTypename } from 'apollo-client';
import { ApolloProvider } from 'react-apollo';
const ReactGA = require('react-ga');
// Polyfill fetch
import 'isomorphic-fetch';

import routes from './routes.js';

import './style.css';

import { Client } from 'subscriptions-transport-ws';
import addGraphQLSubscriptions from './subscriptions';

const wsClient = new Client('ws://localhost:8080');

const networkInterface = createNetworkInterface({
  uri: '/graphql',
  opts: {
    credentials: 'same-origin',
  },
  transportBatching: true,
});

const networkInterfaceWithSubscriptions = addGraphQLSubscriptions(
  networkInterface,
  wsClient,
);

// Initialize Analytics
ReactGA.initialize('UA-74643563-4');

function logPageView() {
  ReactGA.set({ page: window.location.pathname });
  ReactGA.pageview(window.location.pathname);
}

const client = new ApolloClient({
  networkInterface: networkInterfaceWithSubscriptions,
  queryTransformer: addTypename,
  dataIdFromObject: (result) => {
    if (result.id && result.__typename) { // eslint-disable-line no-underscore-dangle
      return result.__typename + result.id; // eslint-disable-line no-underscore-dangle
    }
    return null;
  },
  shouldBatch: true,
  initialState: window.__APOLLO_STATE__, // eslint-disable-line no-underscore-dangle
  ssrForceFetchDelay: 100,
});

render((
  <ApolloProvider client={client}>
    <Router history={browserHistory} onUpdate={logPageView}>
      {routes}
    </Router>
  </ApolloProvider>
), document.getElementById('content'));
