/* @flow */
import React from 'react';
import { NavLink } from 'react-router-dom';
import { withRouter } from 'react-router';

export type Props = {
  title?: string,
  href?: string,
  location?: { pathname?: string },
};

const NavbarLink = (props: Props) => {
  const { title, href, location } = props;
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

export default withRouter(NavbarLink);
