import React from 'react';
import { Link } from 'react-router';

import Profile from '../components/Profile';
import NavbarLink from '../components/NavbarLink';

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
            active={location.pathname === '/' || params.type === 'top'}
          />
          <NavbarLink
            title="Hot"
            href="/feed/hot"
            active={params.type === 'hot'}
          />
          <NavbarLink
            title="New"
            href="/feed/new"
            active={params.type === 'new'}
          />
        </ul>

        <Profile />
      </div>
    </nav>
    <div className="container">
      {children}
    </div>
  </div>
);

Layout.propTypes = {
  location: React.PropTypes.shape({
    pathname: React.PropTypes.string.isRequired,
  }).isRequired,
  params: React.PropTypes.shape({
    type: React.PropTypes.string,
  }).isRequired,
  children: React.PropTypes.element,
};

export default Layout;
