import React from 'react';
import { Query, Mutation } from 'react-apollo';

import Feed from '../components/Feed';
import Loading from '../components/Loading';

import FEED_QUERY from '../graphql/FeedQuery.graphql';
import CURRENT_USER_QUERY from '../graphql/Profile.graphql';
import VOTE_MUTATION from '../graphql/Vote.graphql';

const ITEMS_PER_PAGE = 10;
export default class FeedPage extends React.Component {
  constructor() {
    super();
    this.offset = 0;
  }

  render() {
    const { match } = this.props;

    return (
      <Mutation mutation={VOTE_MUTATION}>
        {mutate => (
          <Query query={CURRENT_USER_QUERY}>
            {({ data: { currentUser } = {} }) => (
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
                        loggedIn={!!currentUser}
                        onVote={({ repoFullName, type }) =>
                          mutate({
                            variables: { repoFullName, type },
                          })
                        }
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
            )}
          </Query>
        )}
      </Mutation>
    );
  }
}
