import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { ApolloProvider } from 'react-apollo';

// Polyfill fetch
import 'isomorphic-fetch';
import './style/index.css';

import createApolloClient from './helpers/create-apollo-client';
import { getHybridOrFullNetworkInterface } from './transport';
import Layout from './routes/Layout';

const client = createApolloClient({
  networkInterface: getHybridOrFullNetworkInterface(),
  initialState: window.__APOLLO_STATE__, // eslint-disable-line no-underscore-dangle
  ssrForceFetchDelay: 100,
  connectToDevTools: true,
});

render(
  <ApolloProvider client={client}>
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  </ApolloProvider>,
  document.getElementById('content'),
);
