import React from 'react';
import TimeAgo from 'react-timeago';
import { emojify } from 'node-emoji';

function RepoInfo({ description, stargazers_count, open_issues_count, created_at, user_url,
  username, comment_count, repo_link }) {
  return (
    <div>
      <p>{description && emojify(description)}</p>
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
      {(comment_count || comment_count === 0) &&
        (<span>&nbsp;<a href={repo_link}>View comments ({comment_count})</a></span>)}
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
}

RepoInfo.propTypes = {
  description: React.PropTypes.string,
  stargazers_count: React.PropTypes.number,
  open_issues_count: React.PropTypes.number,
  created_at: React.PropTypes.number,
  user_url: React.PropTypes.string,
  username: React.PropTypes.string,
  comment_count: React.PropTypes.number,
  repo_link: React.PropTypes.string,
};

function InfoLabel({ label, value }) {
  return (
    <span className="label label-info">{label}: {value}</span>
  );
}

InfoLabel.propTypes = {
  label: React.PropTypes.string,
  value: React.PropTypes.number,
};

export default RepoInfo;
