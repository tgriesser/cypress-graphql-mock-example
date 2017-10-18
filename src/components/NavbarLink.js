import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { withRouter } from 'react-router';

const NavbarLink = ({ title, href, location }) => {
  const isActive = location.pathname === href;

  return (
    <li className={isActive ? 'active' : ''}>
      <NavLink to={href}>
        {title}
        {isActive && <span className="sr-only">(current)</span>}
      </NavLink>
    </li>
  );
};

NavbarLink.propTypes = {
  title: PropTypes.string,
  href: PropTypes.string,
  location: PropTypes.shape({
    pathname: PropTypes.string,
  }),
};

export default withRouter(NavbarLink);
