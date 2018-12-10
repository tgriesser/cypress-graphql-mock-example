import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

import ApolloClient from 'apollo-client';
import { ApolloProvider } from 'react-apollo';
import { ApolloLink } from 'apollo-link';
import { InMemoryCache } from 'apollo-cache-inmemory';

import './style/index.css';

import { errorLink, requestLink } from './links';
import Layout from './routes/Layout';

const links = [errorLink, requestLink()];

const client = new ApolloClient({
  ssrForceFetchDelay: 100,
  link: ApolloLink.from(links),
  connectToDevTools: true,
  // here we're initializing the cache with the data from the server's cache
  cache: new InMemoryCache(), //.restore(window.__APOLLO_STATE__),
});

render(
  <ApolloProvider client={client}>
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  </ApolloProvider>,
  document.getElementById('content')
);
