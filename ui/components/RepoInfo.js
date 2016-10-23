import React from 'react';
import TimeAgo from 'react-timeago';
import { emojify } from 'node-emoji';

import InfoLabel from './InfoLabel';

const RepoInfo = ({
  description,
  stargazers_count,
  open_issues_count,
  created_at,
  user_url,
  username,
  children,
}) => (
  <div>
    <p>
      {description && emojify(description)}
    </p>
    <p>
      <InfoLabel
        label="Stars"
        value={stargazers_count}
      />
      &nbsp;
      <InfoLabel
        label="Issues"
        value={open_issues_count}
      />
      &nbsp;
      {children}
      &nbsp;&nbsp;&nbsp;
        Submitted&nbsp;
      <TimeAgo
        date={created_at}
      />
      &nbsp;by&nbsp;
      <a href={user_url}>{username}</a>
    </p>
  </div>
);

RepoInfo.propTypes = {
  description: React.PropTypes.string.isRequired,
  stargazers_count: React.PropTypes.number.isRequired,
  open_issues_count: React.PropTypes.number.isRequired,
  created_at: React.PropTypes.number.isRequired,
  user_url: React.PropTypes.string.isRequired,
  username: React.PropTypes.string.isRequired,
  children: React.PropTypes.node,
};

export default RepoInfo;
