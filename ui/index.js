import React from 'react';
import { render } from 'react-dom';
import { Router, Route, IndexRoute, Link, browserHistory } from 'react-router'
import ApolloClient, { createNetworkInterface } from 'apollo-client';
import { ApolloProvider } from 'react-apollo';
import { registerGqlTag } from 'apollo-client/gql'

import Feed from './Feed';
import Layout from './Layout';
import NewEntry from './NewEntry';

// Globally register gql template literal tag
registerGqlTag()

const client = new ApolloClient({
  networkInterface: createNetworkInterface('/graphql', {
    credentials: 'same-origin',
  }),
});

render((
  <ApolloProvider client={client}>
    <Router history={browserHistory}>
      <Route path="/" component={Layout}>
        <IndexRoute component={Feed} />
        <Route path="feed/:type" component={Feed} />
        <Route path="new" component={NewEntry} />
      </Route>
    </Router>
  </ApolloProvider>
), document.getElementById('root'));
