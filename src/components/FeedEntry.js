import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import ApolloClient from 'apollo-client';
import { withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import { filter, propType } from 'graphql-anywhere';

import VoteButtons from './VoteButtons';
import RepoInfo from './RepoInfo';
import COMMENT_QUERY from '../graphql/Comment.graphql';

const FeedEntry = ({ loggedIn, onVote, entry, client }) => {
  const {
    commentCount,
    repository: { full_name, html_url, owner: { avatar_url } },
  } = entry;

  const repoLink = `/${full_name}`;
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
          entry={filter(VoteButtons.fragments.entry, entry)}
          onVote={type =>
            onVote({
              repoFullName: full_name,
              type,
            })}
        />
      </div>
      <div className="media-left">
        <button>
          <img
            className="media-object"
            style={{ width: '64px', height: '64px' }}
            src={avatar_url}
            role="presentation"
            alt={avatar_url}
          />
        </button>
      </div>
      <div className="media-body">
        <h4 className="media-heading">
          <a href={html_url}>{full_name}</a>
        </h4>
        <RepoInfo entry={filter(RepoInfo.fragments.entry, entry)}>
          <Link
            to={repoLink}
            onFocus={prefetchComments(entry.repository.full_name)}
            onMouseOver={prefetchComments(entry.repository.full_name)}
          >
            View comments ({commentCount})
          </Link>
        </RepoInfo>
      </div>
    </div>
  );
};

FeedEntry.fragments = {
  entry: gql`
    fragment FeedEntry on Entry {
      id
      commentCount
      repository {
        full_name
        html_url
        owner {
          avatar_url
        }
      }
      ...VoteButtons
      ...RepoInfo
    }
    ${VoteButtons.fragments.entry}
    ${RepoInfo.fragments.entry}
  `,
};

FeedEntry.propTypes = {
  loggedIn: PropTypes.bool.isRequired,
  onVote: PropTypes.func.isRequired,
  entry: propType(FeedEntry.fragments.entry).isRequired,
  client: PropTypes.instanceOf(ApolloClient).isRequired,
};

export default withApollo(FeedEntry);
