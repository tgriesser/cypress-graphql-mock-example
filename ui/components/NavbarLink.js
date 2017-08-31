import React from 'react';
import { NavLink } from 'react-router-dom';
import { withRouter } from 'react-router';

const NavbarLink = ({ title, href, location }) => {
  const isActive = location.pathname === href;

  return (
    <li className={isActive && 'active'}>
      <NavLink to={href}>
        {title}
        {isActive && <span className="sr-only">(current)</span>}
      </NavLink>
    </li>
  );
};

NavbarLink.propTypes = {
  title: React.PropTypes.string,
  href: React.PropTypes.string,
  location: React.PropTypes.shape({
    pathname: React.PropTypes.string,
  }),
};

export default withRouter(NavbarLink);
