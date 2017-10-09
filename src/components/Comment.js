/* @flow */
import React from 'react';
import TimeAgo from 'react-timeago';

export type Props = {
  username?: string,
  userUrl?: string,
  content?: string,
  createdAt?: number,
};

const Comment = (props: Props) => {
  const { username, userUrl, content, createdAt } = props;

  return (
    <div className="comment-box">
      <b>{content}</b>
      <br />
      Submitted <TimeAgo date={createdAt} /> by <a href={userUrl}>{username}</a>
    </div>
  );
};

export default Comment;
