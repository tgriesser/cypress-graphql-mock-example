import React from 'react';
import FeedEntry from './FeedEntry';

export default function Feed({ entries = [], loggedIn, onVote, onLoadMore }) {
  if (entries && entries.length) {
    return (
      <div> {
        entries.map(entry => (
          entry ? <FeedEntry
            key={entry.repository.full_name}
            entry={entry}
            loggedIn={loggedIn}
            onVote={onVote}
          /> : null
        ))
      }
        <button onClick={onLoadMore}>Load more</button>
      </div>
    );
  }
  return <div />;
}

Feed.propTypes = {
  entries: React.PropTypes.arrayOf(FeedEntry.fragments.entry.propType),
  loggedIn: React.PropTypes.bool.isRequired,
  onVote: React.PropTypes.func.isRequired,
  onLoadMore: React.PropTypes.func.isRequired,
};
