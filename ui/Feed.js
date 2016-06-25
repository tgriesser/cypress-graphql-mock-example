import React from 'react';
import { connect } from 'react-apollo';
import TimeAgo from 'react-timeago';
import { emojify } from 'node-emoji';
import classNames from 'classnames';

function Loading() {
  return (
    <div>Loading...</div>
  );
}

function InfoLabel({ label, value }) {
  return (
    <span className="label label-info">{label}: {value}</span>
  );
}

InfoLabel.propTypes = {
  label: React.PropTypes.string,
  value: React.PropTypes.number,
};

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


function FeedEntry({ entry, currentUser, onVote }) {
  const voteButtons = !!currentUser ? (
    <div className="media-vote">
      <VoteButtons
        canVote={!!currentUser}
        score={entry.score}
        vote={entry.vote}
        onVote={(type) => onVote(entry.repository.full_name, type)}
      />
    </div>
  ) : null;
  return (
    <div className="media">
      {voteButtons}
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
        <p>{emojify(entry.repository.description)}</p>
        <p>
          <InfoLabel
            label="Stars"
            value={entry.repository.stargazers_count}
          />
          &nbsp;
          <InfoLabel
            label="Issues"
            value={entry.repository.open_issues_count}
          />
          &nbsp;&nbsp;&nbsp;
          Submitted
          <TimeAgo
            date={entry.createdAt}
          />
          &nbsp;by&nbsp;
          <a href={entry.postedBy.html_url}>{entry.postedBy.login}</a>
        </p>
      </div>
    </div>
  );
}

FeedEntry.propTypes = {
  onVote: React.PropTypes.func,
  currentUser: React.PropTypes.object,
  entry: React.PropTypes.object,
};

function FeedContent({ entries = [], currentUser, onVote }) {
  if (entries && entries.length) {
    return (
      <div> {
        entries.map((entry) => (
          !!entry ? <FeedEntry
            key={entry.repository.full_name}
            entry={entry}
            currentUser={currentUser}
            onVote={onVote}
          /> : null
        ))
      } </div>
    );
  }
  return <div />;
}

FeedContent.propTypes = {
  entries: React.PropTypes.array,
  currentUser: React.PropTypes.object,
  onVote: React.PropTypes.func,
};

function Feed({ data, mutations }) {
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
}

Feed.propTypes = {
  data: React.PropTypes.object,
  mutations: React.PropTypes.object,
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
