// @flow
import * as React from 'react';
import { withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import { Link } from 'react-router-dom';
import { filter } from 'graphql-anywhere';

import VoteButtons from './VoteButtons';
import RepoInfo from './RepoInfo';
import COMMENT_QUERY from '../graphql/Comment.graphql';

type Props = {
  loggedIn: boolean,
  onVote: (repo: { repoFullName: string, type: string }) => void,
  entry: Object,
  client: Object,
};

const FeedEntry = ({
  loggedIn,
  onVote,
  entry,
  client,
}: Props): React.Element<*> => {
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

export default withApollo(FeedEntry);
