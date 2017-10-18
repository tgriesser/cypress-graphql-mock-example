import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

import ApolloClient from 'apollo-client';
import { ApolloProvider } from 'react-apollo';
import { ApolloLink } from 'apollo-link';
import Cache from 'apollo-cache-inmemory';

import './style/index.css';

import {
  errorLink,
  queryOrMutationLink,
  subscriptionLink,
  requestLink,
} from './links';
import Layout from './routes/Layout';

const client = new ApolloClient({
  ssrForceFetchDelay: 100,
  link: ApolloLink.from([
    errorLink,
    requestLink({
      queryOrMutationLink: queryOrMutationLink(),
      subscriptionLink: subscriptionLink(),
    }),
  ]),
  // here we're initializing the cache with the data from the server's cache
  cache: new Cache().restore(window.__APOLLO_STATE__),
});

render(
  <ApolloProvider client={client}>
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  </ApolloProvider>,
  document.getElementById('content'),
);
