import React from 'react';
import FeedEntry from './FeedEntry';

export default function Feed({ entries = [], currentUser, onVote, onLoadMore }) {
  if (entries && entries.length) {
    return (
      <div> {
        entries.map((entry) => (
          !!entry ? <FeedEntry
            key={entry.repository.full_name}
            entry={entry}
            currentUser={currentUser}
            onVote={onVote}
          /> : null
        ))
      }
        <a onClick={onLoadMore}>Load more</a>
      </div>
    );
  }
  return <div />;
}

Feed.propTypes = {
  entries: React.PropTypes.array,
  currentUser: React.PropTypes.object,
  onVote: React.PropTypes.func,
  onLoadMore: React.PropTypes.func,
};
