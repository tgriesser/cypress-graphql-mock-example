/* @flow */
import React from 'react';
import { Route } from 'react-router-dom';

export type Props = {
  code?: number,
  children: React.Element,
};

const Status = (props: Props) => {
  const { code, children } = props;

  return (
    <Route
      render={({ staticContext }) => {
        if (staticContext) {
          staticContext.status = code; // eslint-disable-line
        }

        return children;
      }}
    />
  );
};

Status.defaultProps = {
  code: 200,
};

export default Status;
