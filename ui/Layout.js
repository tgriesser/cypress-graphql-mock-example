import React from 'react';
import { connect } from 'react-apollo';
import { Link } from 'react-router';

const NavbarLink = ({ title, href, active=false }) => (
  <li className={ active && "active"}>
    <Link to={href}>
      { title }
      { active && (
        <span className="sr-only">
          (current)
        </span>
      ) }
    </Link>
  </li>
)

const Profile = ({ data }) => {
  if (data.loading) {
    return (
      <p className="navbar-text navbar-right">
        Loading...
      </p>
    );
  } else if (data.currentUser) {
    return (
      <span>
        <p className="navbar-text navbar-right">
          { data.currentUser.login }
          &nbsp;
          <a href="/logout">Log out</a>
        </p>
        <Link
          type="submit"
          className="btn navbar-btn navbar-right btn-success"
          to="/submit"
        >
          <span className="glyphicon glyphicon-plus" aria-hidden="true" />
          &nbsp;
          Submit
        </Link>
      </span>
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
    },
  })
})(Profile);

const Layout = ({ children, params, location }) => (
  <div>
    <nav className="navbar navbar-default">
      <div className="container">
        <div className="navbar-header">
          <Link className="navbar-brand" to="/feed/top">GitHunt</Link>
        </div>

        <ul className="nav navbar-nav">
          <NavbarLink
            title="Top"
            href="/feed/top"
            active={ location.pathname === '/' || params.type === 'top' }
          />
          <NavbarLink
            title="New"
            href="/feed/new"
            active={ params.type === 'new' }
          />
        </ul>

        <ProfileWithData />
      </div>
    </nav>
    <div className="container">
      { children }
    </div>
  </div>
);

export default Layout;
