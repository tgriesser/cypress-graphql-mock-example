/* @flow */
import React from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Link } from 'react-router-dom';

export type Props = {
  loading?: boolean,
  currentUser?: { login: string },
};

function Profile(props: Props) {
  const { loading, currentUser } = props;
  if (loading) {
    return <p className="navbar-text navbar-right">Loading...</p>;
  } else if (currentUser) {
    return (
      <span>
        <p className="navbar-text navbar-right">
          {currentUser.login}
          &nbsp;
          <a href="/logout">Log out</a>
        </p>
        <Link
          type="submit"
          className="btn navbar-btn navbar-right btn-success"
          to="/submit"
        >
          <span className="glyphicon glyphicon-plus" aria-hidden="true" />
          &nbsp; Submit
        </Link>
      </span>
    );
  }
  return (
    <p className="navbar-text navbar-right">
      <a href="/login/github">Log in with GitHub</a>
    </p>
  );
}

const PROFILE_QUERY = gql`
  query CurrentUserForLayout {
    currentUser {
      login
      avatar_url
    }
  }
`;

export default graphql(PROFILE_QUERY, {
  options: {
    fetchPolicy: 'cache-and-network',
  },
  props: ({ data: { loading, currentUser } }) => ({
    loading,
    currentUser,
  }),
})(Profile);
