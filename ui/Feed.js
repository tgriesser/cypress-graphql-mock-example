import React from 'react';
import { graphql, withApollo } from 'react-apollo';
import ApolloClient from 'apollo-client';
import RepoInfo from './RepoInfo';
import classNames from 'classnames';
import gql from 'graphql-tag';
import { Link } from 'react-router';

import { COMMENT_QUERY } from './CommentsPage';

function Loading() {
  return (
    <div>Loading...</div>
  );
}

function VoteButtons({ canVote, score, onVote, vote }) {
  const buttonClasses = classNames('btn', 'btn-score', {
    invisible: !canVote,
  });

  function submitVote(type) {
    const voteValue = {
      UP: 1,
      DOWN: -1,
    }[type];

    onVote(vote.vote_value === voteValue ? 'CANCEL' : type);
  }

  return (
    <span>
      <button
        className={classNames(buttonClasses, { active: vote.vote_value === 1 })}
        onClick={() => submitVote('UP')}
      ><span className="glyphicon glyphicon-triangle-top" aria-hidden="true"></span></button>
      <div className="vote-score">{score}</div>
      <button
        className={classNames(buttonClasses, { active: vote.vote_value === -1 })}
        onClick={() => submitVote('DOWN')}
      ><span className="glyphicon glyphicon-triangle-bottom" aria-hidden="true"></span></button>
      &nbsp;
    </span>
  );
}

VoteButtons.propTypes = {
  canVote: React.PropTypes.bool,
  score: React.PropTypes.number,
  onVote: React.PropTypes.func,
  vote: React.PropTypes.object,
};


const FeedEntry = ({ entry, currentUser, onVote, client }) => {
  const repoLink = `/${entry.repository.full_name}`;
  const prefetchComments = (repoFullName) => () => {
    client.query({
      query: COMMENT_QUERY,
      variables: { repoName: repoFullName },
    });
  };

  return (
    <div className="media">
      <div className="media-vote">
        <VoteButtons
          canVote={!!currentUser}
          score={entry.score}
          vote={entry.vote}
          onVote={(type) => onVote({
            repoFullName: entry.repository.full_name,
            type,
          })}
        />
      </div>
      <div className="media-left">
        <a href="#">
          <img
            className="media-object"
            style={{ width: '64px', height: '64px' }}
            src={entry.repository.owner.avatar_url}
            role="presentation"
          />
        </a>
      </div>
      <div className="media-body">
        <h4 className="media-heading">
          <a href={entry.repository.html_url}>
            {entry.repository.full_name}
          </a>
        </h4>
        <RepoInfo
          description={entry.repository.description}
          stargazers_count={entry.repository.stargazers_count}
          open_issues_count={entry.repository.open_issues_count}
          created_at={entry.createdAt}
          user_url={entry.postedBy.html_url}
          username={entry.postedBy.login}
        >
          <Link to={repoLink} onMouseOver={prefetchComments(entry.repository.full_name)}>
            View comments ({entry.commentCount})
          </Link>
        </RepoInfo>
      </div>
    </div>
  );
};


FeedEntry.propTypes = {
  onVote: React.PropTypes.func,
  currentUser: React.PropTypes.object,
  entry: React.PropTypes.object,
  client: React.PropTypes.instanceOf(ApolloClient).isRequired,
};

const FeedEntryWithApollo = withApollo(FeedEntry);

function FeedContent({ entries = [], currentUser, onVote, onLoadMore }) {
  if (entries && entries.length) {
    return (
      <div> {
        entries.map((entry) => (
          !!entry ? <FeedEntryWithApollo
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

FeedContent.propTypes = {
  entries: React.PropTypes.array,
  currentUser: React.PropTypes.object,
  onVote: React.PropTypes.func,
  onLoadMore: React.PropTypes.func,
};

class Feed extends React.Component {
  constructor() {
    super();
    this.offset = 0;
  }

  render() {
    const { vote, loading, currentUser, feed, fetchMore } = this.props;

    return (
      <div>
        <FeedContent
          entries={feed || []}
          currentUser={currentUser}
          onVote={vote}
          onLoadMore={fetchMore}
        />
        {loading ? <Loading /> : null}
      </div>
    );
  }
}

Feed.propTypes = {
  loading: React.PropTypes.bool.isRequired,
  currentUser: React.PropTypes.object,
  feed: React.PropTypes.array,
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
      createdAt
      commentCount
      score
      id
      postedBy {
        login
        html_url
      }
      vote {
        vote_value
      }
      repository {
        name
        full_name
        description
        html_url
        stargazers_count
        open_issues_count
        created_at
        owner {
          avatar_url
        }
      }
    }
  }
`;

const ITEMS_PER_PAGE = 10;
const FeedWithData = graphql(FEED_QUERY, {
  options(props) {
    return {
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
    };
  },
  props({ data: { loading, feed, currentUser, fetchMore } }) {
    return {
      loading,
      feed,
      currentUser,
      fetchMore() {
        return fetchMore({
          variables: {
            offset: feed.length,
          },
          updateQuery: (prev, { fetchMoreResult }) => {
            if (!fetchMoreResult.data) { return prev; }
            return Object.assign({}, prev, {
              feed: [...prev.feed, ...fetchMoreResult.data.feed],
            });
          },
        });
      },
    };
  },
})(Feed);

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

const FeedWithDataAndMutations = graphql(VOTE_MUTATION, {
  name: 'vote',
})(FeedWithData);

export default FeedWithDataAndMutations;
