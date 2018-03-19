import React from 'react';
import PropTypes from 'prop-types';
import { graphql, Query } from 'react-apollo';

import Feed from '../components/Feed';
import Loading from '../components/Loading';

import FEED_QUERY from '../graphql/FeedQuery.graphql';
import CURRENT_USER_QUERY from '../graphql/Profile.graphql';
import VOTE_MUTATION from '../graphql/Vote.graphql';

const ITEMS_PER_PAGE = 10;
class FeedPage extends React.Component {
  constructor() {
    super();
    this.offset = 0;
  }

  render() {
    const { vote, currentUser, fetchMore, match } = this.props;

    return (
      <Query
        query={FEED_QUERY}
        variables={{
          type:
            (match.params &&
              match.params.type &&
              match.params.type.toUpperCase()) ||
            'TOP',
          offset: 0,
          limit: ITEMS_PER_PAGE,
        }}
        fetchPolicy="cache-and-network"
      >
        {({ loading, data, fetchMore }) => {
          return (
            <div>
              <Feed
                entries={data.feed || []}
                loggedIn={!!this.props.currentUser}
                onVote={vote}
                onLoadMore={() =>
                  fetchMore({
                    variables: {
                      offset: data.feed.length,
                    },
                    updateQuery: (prev, { fetchMoreResult }) => {
                      if (!fetchMoreResult) return prev;
                      return Object.assign({}, prev, {
                        feed: [...prev.feed, ...fetchMoreResult.feed],
                      });
                    },
                  })
                }
              />
              {loading ? <Loading /> : null}
            </div>
          );
        }}
      </Query>
    );
  }
}

FeedPage.propTypes = {
  currentUser: PropTypes.shape({
    login: PropTypes.string.isRequired,
  }),
  vote: PropTypes.func.isRequired,
};

const withUser = graphql(CURRENT_USER_QUERY, {
  props: ({ data }) => ({
    currentUser: data && data.currentUser,
  }),
});

const withMutations = graphql(VOTE_MUTATION, {
  props: ({ mutate }) => ({
    vote: ({ repoFullName, type }) =>
      mutate({
        variables: { repoFullName, type },
      }),
  }),
});

export default withMutations(withUser(FeedPage));
