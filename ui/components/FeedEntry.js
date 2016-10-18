import React from 'react';
import ApolloClient from 'apollo-client';
import { withApollo } from 'react-apollo';
import { Link } from 'react-router';

import VoteButtons from './VoteButtons';
import RepoInfo from './RepoInfo';
import { COMMENT_QUERY } from '../routes/CommentsPage';

const FeedEntry = ({ entry, loggedIn, onVote, client }) => {
  const repoLink = `/${entry.repository.full_name}`;
  const prefetchComments = repoFullName => () => {
    client.query({
      query: COMMENT_QUERY,
      variables: { repoName: repoFullName },
    });
  };

  return (
    <div className="media">
      <div className="media-vote">
        <VoteButtons
          canVote={loggedIn}
          score={entry.score}
          vote={entry.vote}
          onVote={type => onVote({
            repoFullName: entry.repository.full_name,
            type,
          })}
        />
      </div>
      <div className="media-left">
        <button>
          <img
            className="media-object"
            style={{ width: '64px', height: '64px' }}
            src={entry.repository.owner.avatar_url}
            role="presentation"
          />
        </button>
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
  loggedIn: React.PropTypes.bool.isRequired,
  entry: React.PropTypes.shape({
    repository: React.PropTypes.shape({
      full_name: React.PropTypes.string.isRequired,
    }).isRequired,
    score: React.PropTypes.number.isRequired,
    vote: React.PropTypes.shape({
      vote_value: React.PropTypes.number.isRequired,
    }).isRequired,
  }),
  client: React.PropTypes.instanceOf(ApolloClient).isRequired,
};

export default withApollo(FeedEntry);
