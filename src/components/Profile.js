import React from 'react';
import { Link } from 'react-router-dom';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';

const PROFILE_QUERY = gql`
  query CurrentUserForLayout {
    currentUser {
      login
      avatar_url
    }
  }
`;

export default function Profile() {
  return (
    <Query query={PROFILE_QUERY} fetchPolicy="cache-and-network">
      {({ loading, data: { currentUser } }) => {
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
      }}
    </Query>
  );
}
