import React from 'react';
import PropTypes from 'prop-types';
import { propType } from 'graphql-anywhere';

import FeedEntry from './FeedEntry';

const Feed = ({ entries = [], loggedIn, onVote, onLoadMore }) => {
  if (entries && entries.length) {
    return (
      <div>
        {entries.map(
          entry =>
            entry ? (
              <FeedEntry
                key={entry.repository.full_name}
                entry={entry}
                loggedIn={loggedIn}
                onVote={onVote}
              />
            ) : null
        )}
        <button onClick={onLoadMore}>Load more</button>
      </div>
    );
  }
  return <div />;
};

Feed.propTypes = {
  entries: PropTypes.arrayOf(propType(FeedEntry.fragments.entry).isRequired),
  loggedIn: PropTypes.bool.isRequired,
  onVote: PropTypes.func.isRequired,
  onLoadMore: PropTypes.func.isRequired,
};

export default Feed;
