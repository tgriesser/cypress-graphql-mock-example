import React from 'react';
import { connect } from 'react-apollo';

const Profile = ({ data }) => {
  if (data.loading) {
    return (
      <p className="navbar-text navbar-right">
        Loading...
      </p>
    );
  } else if (data.currentUser) {
    return (
      <p className="navbar-text navbar-right">
        { data.currentUser.login }
        &nbsp;
        <a href="/logout">Log out</a>
      </p>
    );
  } else {
    return (
      <p className="navbar-text navbar-right">
        <a href="/login/github">Log in with GitHub</a>
      </p>
    );
  }
};

const ProfileWithData = connect({
  mapQueriesToProps: () => ({
    data: {
      query: gql`
        query CurrentUserForLayout {
          currentUser {
            login
            avatar_url
          }
        }
      `,
      variables: {
        type: 'TOP',
      },
    },
  })
})(Profile);

const Layout = ({ children }) => (
  <div>
    <nav className="navbar navbar-default">
      <div className="container">
        <div className="navbar-header">
          <a className="navbar-brand" href="#">GitHunt</a>
        </div>

        <ProfileWithData />
      </div>
    </nav>
    <div className="container">
      { children }
    </div>
  </div>
);

export default Layout;
