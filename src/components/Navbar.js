import React from 'react';
import { Link } from 'react-router-dom';
import Profile from './Profile';
import NavbarLink from './NavbarLink';

const Navbar = () => (
  <nav className="navbar navbar-default">
    <div className="container">
      <div className="navbar-header">
        <Link className="navbar-brand" to="/feed/top">
          GitHunt
        </Link>
      </div>
      <ul className="nav navbar-nav">
        <NavbarLink title="Top" href="/feed/top" />
        <NavbarLink title="Hot" href="/feed/hot" />
        <NavbarLink title="New" href="/feed/new" />
      </ul>

      <Profile />
    </div>
  </nav>
);

export default Navbar;
