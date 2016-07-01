import React from 'react';
import { render } from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
import ApolloClient, { createNetworkInterface, addTypename } from 'apollo-client';
import { ApolloProvider } from 'react-apollo';
const ReactGA = require('react-ga');
// Polyfill fetch
import 'whatwg-fetch';

import Feed from './Feed';
import Layout from './Layout';
import NewEntry from './NewEntry';

import './style.css';

// Globally register gql template literal tag
// FIXME: global import is deprecated and thus this trick is only temporary
// see the docs http://docs.apollostack.com/apollo-client/core.html#gql for more info
import gql from 'graphql-tag';
global['gql'] = gql;

// Initialize Analytics
ReactGA.initialize('UA-74643563-4');

function logPageView() {
  ReactGA.set({ page: window.location.pathname });
  ReactGA.pageview(window.location.pathname);
}

const client = new ApolloClient({
  networkInterface: createNetworkInterface('/graphql', {
    credentials: 'same-origin',
  }),
  queryTransformer: addTypename,
  dataIdFromObject: (result) => {
    if (result.id && result.__typename) { // eslint-disable-line no-underscore-dangle
      return result.__typename + result.id; // eslint-disable-line no-underscore-dangle
    }
    return null;
  },
  shouldBatch: true,
});

render((
  <ApolloProvider client={client}>
    <Router history={browserHistory} onUpdate={logPageView}>
      <Route
        path="/"
        component={Layout}
      >
        <IndexRoute
          component={Feed}
        />
        <Route
          path="feed/:type"
          component={Feed}
        />
        <Route
          path="submit"
          component={NewEntry}
        />
      </Route>
    </Router>
  </ApolloProvider>
), document.getElementById('root'));
