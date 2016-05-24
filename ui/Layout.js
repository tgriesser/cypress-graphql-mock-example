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
          className="btn btn-default navbar-btn navbar-right"
          to="/submit"
        >
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

const Layout = ({ children, params }) => (
  <div>
    <nav className="navbar navbar-default">
      <div className="container">
        <div className="navbar-header">
          <a className="navbar-brand" href="#">GitHunt</a>
        </div>

        <ul className="nav navbar-nav">
          <NavbarLink title="Top" href="/feed/top" />
          <NavbarLink title="New" href="/feed/new" />
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
