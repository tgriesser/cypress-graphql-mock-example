import React from 'react';
import PropTypes from 'prop-types';
import { Route } from 'react-router-dom';

const Status = ({ code, children }) => (
  <Route
    render={({ staticContext }) => {
      if (staticContext) {
        staticContext.status = code; // eslint-disable-line
      }

      return children;
    }}
  />
);

Status.defaultProps = {
  code: 200,
};

Status.propTypes = {
  code: PropTypes.number,
  children: PropTypes.element.isRequired,
};

export default Status;
