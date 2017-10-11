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
  connectToDevTools: true,
  ssrForceFetchDelay: 100,
  addTypename: true,
  dataIdFromObject: result => {
    if (result.id && result.__typename) {
      return result.__typename + result.id;
    }
    return null;
  },
  cache: new Cache().restore(window.__APOLLO_STATE__ || {}),
  link: ApolloLink.from([
    errorLink,
    requestLink({
      queryOrMutationLink: queryOrMutationLink(),
      subscriptionLink: subscriptionLink(),
    }),
  ]),
});

render(
  <ApolloProvider client={client}>
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  </ApolloProvider>,
  document.getElementById('content'),
);
