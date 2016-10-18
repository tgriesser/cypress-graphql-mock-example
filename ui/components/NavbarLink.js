import React from 'react';
import { Link } from 'react-router';

export default function NavbarLink({ title, href, active = false }) {
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
