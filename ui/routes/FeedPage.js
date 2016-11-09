import React from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

import Feed from '../components/Feed';
import Loading from '../components/Loading';
import FeedEntry from '../components/FeedEntry';

class FeedPage extends React.Component {
  constructor() {
    super();
    this.offset = 0;
  }

  render() {
    const { vote, loading, currentUser, feed, fetchMore } = this.props;

    return (
      <div>
        <Feed
          entries={feed || []}
          loggedIn={!!currentUser}
          onVote={vote}
          onLoadMore={fetchMore}
        />
        {loading ? <Loading /> : null}
      </div>
    );
  }
}

FeedPage.propTypes = {
  loading: React.PropTypes.bool.isRequired,
  currentUser: React.PropTypes.shape({
    login: React.PropTypes.string.isRequired,
  }),
  feed: Feed.propTypes.entries,
  fetchMore: React.PropTypes.func,
  vote: React.PropTypes.func.isRequired,
};

const FEED_QUERY = gql`
  query Feed($type: FeedType!, $offset: Int, $limit: Int) {
    # Eventually move this into a no fetch query right on the entry
    # since we literally just need this info to determine whether to
    # show upvote/downvote buttons
    currentUser {
      login
    }
    feed(type: $type, offset: $offset, limit: $limit) {
      ...FeedEntry
    }
  }
  ${FeedEntry.fragments.entry}
`;
const ITEMS_PER_PAGE = 10;
const withData = graphql(FEED_QUERY, {
  options: props => ({
    variables: {
      type: (
        props.params &&
        props.params.type &&
        props.params.type.toUpperCase()
      ) || 'TOP',
      offset: 0,
      limit: ITEMS_PER_PAGE,
    },
    forceFetch: true,
  }),
  props: ({ data: { loading, feed, currentUser, fetchMore } }) => ({
    loading,
    feed,
    currentUser,
    fetchMore: () => fetchMore({
      variables: {
        offset: feed.length,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult.data) { return prev; }
        return Object.assign({}, prev, {
          feed: [...prev.feed, ...fetchMoreResult.data.feed],
        });
      },
    }),
  }),
});

const VOTE_MUTATION = gql`
  mutation vote($repoFullName: String!, $type: VoteType!) {
    vote(repoFullName: $repoFullName, type: $type) {
      score
      id
      vote {
        vote_value
      }
    }
  }
`;

const withMutations = graphql(VOTE_MUTATION, {
  props: ({ mutate }) => ({
    vote: ({ repoFullName, type }) => mutate({
      variables: { repoFullName, type },
    }),
  }),
});

export default withMutations(withData(FeedPage));
