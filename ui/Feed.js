import React from 'react';
import { connect } from 'react-apollo';
import TimeAgo from 'react-timeago';
import { emojify } from 'node-emoji';

const Loading = () => (
  <div>Loading...</div>
);

const InfoLabel = ({ label, value }) => (
  <span className="label label-info">{label}: {value}</span>
);

const VoteButtons = ({ score, onVote, vote }) => (
  <span>
    <button
      className={vote.vote_value === 1 ? 'btn btn-score active' : 'btn btn-score'}
      onClick={() => onVote('UP')}
    ><span className="glyphicon glyphicon-triangle-top" aria-hidden="true"></span></button>
    <div className="vote-score">{score}</div>
    <button
      className={vote.vote_value === -1 ? 'btn btn-score active' : 'btn btn-score'}
      onClick={() => onVote('DOWN')}
    ><span className="glyphicon glyphicon-triangle-bottom" aria-hidden="true"></span></button>
    &nbsp;
  </span>
);

const FeedEntry = ({ entry, currentUser, onVote }) => (
  <div className="media">
    <div className="media-vote">
      {currentUser &&
        <VoteButtons
          score={entry.score}
          vote={entry.vote}
          onVote={(type) => onVote(entry.repository.full_name, type)}
        />}
    </div>
    <div className="media-left">
      <a href="#">
        <img
          className="media-object"
          style={{width: '64px', height: '64px'}}
          src={entry.repository.owner.avatar_url}
        />
      </a>
    </div>
    <div className="media-body">
      <h4 className="media-heading">
        <a href={entry.repository.html_url}>
          {entry.repository.full_name}
        </a>
      </h4>
      <p>{emojify(entry.repository.description)}</p>
      <p>
        <InfoLabel label="Stars" value={entry.repository.stargazers_count} />
        &nbsp;
        <InfoLabel label="Issues" value={entry.repository.open_issues_count} />
        &nbsp;&nbsp;&nbsp;
        Submitted <TimeAgo date={entry.createdAt} />
        &nbsp;by&nbsp;
        <a href={entry.postedBy.html_url}>{entry.postedBy.login}</a>
      </p>
    </div>
  </div>
);

const FeedContent = ({ entries, currentUser, onVote }) => (
  <div> {
    entries.map((entry) => (
      <FeedEntry
        key={entry.repository.full_name}
        entry={entry}
        currentUser={currentUser}
        onVote={onVote}
      />
    ))
  } </div>
);

const Feed = ({ data, mutations }) => {
  if (data.loading) {
    return <Loading />;
  }
  return (
    <FeedContent
      entries={data.feed}
      currentUser={data.currentUser}
      onVote={(...args) => mutations.vote(...args)}
    />
  );
};

const FeedWithData = connect({
  mapQueriesToProps: ({ ownProps }) => ({
    data: {
      query: gql`
        query Feed($type: FeedType!) {
          # Eventually move this into a no fetch query right on the entry
          # since we literally just need this info to determine whether to
          # show upvote/downvote buttons
          currentUser {
            login
          }
          feed(type: $type) {
            createdAt
            score
            commentCount
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
      `,
      variables: {
        type: (
          ownProps.params &&
          ownProps.params.type &&
          ownProps.params.type.toUpperCase()
        ) || 'TOP',
      },
      forceFetch: true,
    },
  }),

  mapMutationsToProps: () => ({
    vote: (repoFullName, type) => ({
      mutation: gql`
        mutation vote($repoFullName: String!, $type: VoteType!) {
          vote(repoFullName: $repoFullName, type: $type) {
            score
            id
            vote {
              vote_value
            }
          }
        }
      `,
      variables: {
        repoFullName,
        type,
      },
    }),
  }),
})(Feed);

export default FeedWithData;
