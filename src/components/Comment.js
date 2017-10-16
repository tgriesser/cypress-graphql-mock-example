import React from 'react';
import TimeAgo from 'react-timeago';
import PropTypes from 'prop-types';

const Comment = ({ username, userUrl, content, createdAt }) => (
  <div className="comment-box">
    <b>{content}</b>
    <br />
    Submitted <TimeAgo date={createdAt} /> by <a href={userUrl}>{username}</a>
  </div>
);

Comment.propTypes = {
  username: PropTypes.string,
  userUrl: PropTypes.string,
  content: PropTypes.string,
  createdAt: PropTypes.number,
};

export default Comment;
