import React from 'react';
import { render } from 'react-dom';
import { Router, browserHistory } from 'react-router';
import { ApolloProvider } from 'react-apollo';
import * as ReactGA from 'react-ga';

// Polyfill fetch
import 'isomorphic-fetch';
import './style/index.css';

import routes from './routes';
import createApolloClient from './helpers/create-apollo-client';
import { getHybridOrFullNetworkInterface } from './transport';

// Initialize Analytics
ReactGA.initialize('UA-74643563-4');

function logPageView() {
  ReactGA.set({ page: window.location.pathname });
  ReactGA.pageview(window.location.pathname);
}

const client = createApolloClient({
  networkInterface: getHybridOrFullNetworkInterface(),
  initialState: window.__APOLLO_STATE__, // eslint-disable-line no-underscore-dangle
  ssrForceFetchDelay: 100,
  connectToDevTools: true,
});

render((
  <ApolloProvider client={client}>
    <Router history={browserHistory} onUpdate={logPageView}>
      {routes}
    </Router>
  </ApolloProvider>
), document.getElementById('content'));
