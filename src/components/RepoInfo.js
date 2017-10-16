import React from 'react';
import PropTypes from 'prop-types';
import TimeAgo from 'react-timeago';
import { emojify } from 'node-emoji';

import gql from 'graphql-tag';
import { propType } from 'graphql-anywhere';

import InfoLabel from './InfoLabel';

const RepoInfo = ({
  entry: {
    createdAt,
    repository: { description, stargazers_count, open_issues_count },
    postedBy: { html_url, login },
  },
  children,
}) => (
  <div>
    <p>{description && emojify(description)}</p>
    <p>
      <InfoLabel label="Stars" value={stargazers_count} />
      &nbsp;
      <InfoLabel label="Issues" value={open_issues_count} />
      &nbsp;
      {children}
      &nbsp;&nbsp;&nbsp; Submitted&nbsp;
      <TimeAgo date={createdAt} />
      &nbsp;by&nbsp;
      <a href={html_url}>{login}</a>
    </p>
  </div>
);

RepoInfo.fragments = {
  entry: gql`
    fragment RepoInfo on Entry {
      createdAt
      repository {
        description
        stargazers_count
        open_issues_count
      }
      postedBy {
        html_url
        login
      }
    }
  `,
};

RepoInfo.propTypes = {
  entry: propType(RepoInfo.fragments.entry).isRequired,
  children: PropTypes.node,
};

export default RepoInfo;
