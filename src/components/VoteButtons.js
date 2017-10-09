// @flow
import * as React from 'react';
import classNames from 'classnames';
import gql from 'graphql-tag';

type Props = {
  canVote: boolean,
  onVote: (type: string) => void,
  entry: {
    score: number,
    vote: Object,
  },
};

export default function VoteButtons({
  canVote,
  onVote,
  entry: { score, vote },
}: Props): React.Element<*> {
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
      >
        <span className="glyphicon glyphicon-triangle-top" aria-hidden="true" />
      </button>
      <div className="vote-score">{score}</div>
      <button
        className={classNames(buttonClasses, {
          active: vote.vote_value === -1,
        })}
        onClick={() => submitVote('DOWN')}
      >
        <span
          className="glyphicon glyphicon-triangle-bottom"
          aria-hidden="true"
        />
      </button>
      &nbsp;
    </span>
  );
}

VoteButtons.fragments = {
  entry: gql`
    fragment VoteButtons on Entry {
      score
      vote {
        vote_value
      }
    }
  `,
};
