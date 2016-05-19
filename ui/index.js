import React from 'react';
import { render } from 'react-dom';

import ApolloClient from 'apollo-client';
import { ApolloProvider } from 'react-apollo';
import { registerGqlTag } from 'apollo-client/gql'

import Feed from './Feed';

// Globally register gql template literal tag
registerGqlTag()

const client = new ApolloClient();

render(
  <ApolloProvider client={client}>
    <Feed />
  </ApolloProvider>,
  document.getElementById('root')
)
