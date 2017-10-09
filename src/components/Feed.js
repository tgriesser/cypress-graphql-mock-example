// @flow
import * as React from 'react';

import FeedEntry from './FeedEntry';

type Props = {
  entries: Array<Object>,
  loggedIn: boolean,
  onVote: (repo: { repoFullName: string, type: string }) => void,
  onLoadMore: () => void,
};

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
            ) : null,
        )}
        <button onClick={onLoadMore}>Load more</button>
      </div>
    );
  }
  return <div />;
};

export default Feed;
