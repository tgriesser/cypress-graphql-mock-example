import React from 'react';
import Status from './Status';

const NotFoundPage = () => (
  <Status code={404}>
    <h1>Sorry, the requested page could not be found.</h1>
  </Status>
);

export default NotFoundPage;
