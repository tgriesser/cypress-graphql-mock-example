import React from 'react';
import { Route, IndexRoute } from 'react-router';

import Feed from './Feed';
import Layout from './Layout';
import NewEntry from './NewEntry';
import CommentsPage from './CommentsPage';

export default (
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
    <Route
      path="/:org/:repoName"
      component={CommentsPage}
    />
  </Route>
);
