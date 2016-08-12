import React from 'react';
import { graphql } from 'react-apollo';
import { Link } from 'react-router';
import gql from 'graphql-tag';

function NavbarLink({ title, href, active = false }) {
  return (
    <li className={active && 'active'}>
      <Link to={href}>
        {title}
        {active && (
          <span className="sr-only">
            (current)
          </span>
        )}
      </Link>
    </li>
  );
}

NavbarLink.propTypes = {
  title: React.PropTypes.string,
  href: React.PropTypes.string,
  active: React.PropTypes.bool,
};


function Profile({ loading, currentUser }) {
  if (loading) {
    return (
      <p className="navbar-text navbar-right">
        Loading...
      </p>
    );
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
          <span
            className="glyphicon glyphicon-plus"
            aria-hidden="true"
          />
          &nbsp;
          Submit
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

Profile.propTypes = {
  loading: React.PropTypes.bool.isRequired,
  currentUser: React.PropTypes.object,
};

const PROFILE_QUERY = gql`
  query CurrentUserForLayout {
    currentUser {
      login
      avatar_url
    }
  }
`;

const ProfileWithData = graphql(PROFILE_QUERY, {
  props({ data: { loading, currentUser } }) {
    return { loading, currentUser };
  },
})(Profile);

function Layout({ children, params, location }) {
  return (
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
              active={location.pathname === '/' || params.type === 'top'}
            />
            <NavbarLink
              title="New"
              href="/feed/new"
              active={params.type === 'new'}
            />
          </ul>

          <ProfileWithData />
        </div>
      </nav>
      <div className="container">
        {children}
      </div>
    </div>
  );
}

Layout.propTypes = {
  location: React.PropTypes.object,
  params: React.PropTypes.object,
  children: React.PropTypes.element,
};

export default Layout;
