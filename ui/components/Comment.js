import React from 'react';
import TimeAgo from 'react-timeago';

const Comment = ({ username, userUrl, content, createdAt }) => (
  <div className="comment-box">
    <b>{content}</b>
    <br />
    Submitted <TimeAgo date={createdAt} /> by <a href={userUrl}>{username}</a>
  </div>
);

Comment.propTypes = {
  username: React.PropTypes.string,
  userUrl: React.PropTypes.string,
  content: React.PropTypes.string,
  createdAt: React.PropTypes.number,
};

export default Comment;
