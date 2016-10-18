import React from 'react';
import classNames from 'classnames';
import { createFragment } from 'apollo-client';
import gql from 'graphql-tag';

export default function VoteButtons({ canVote, score, onVote, vote }) {
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
      ><span className="glyphicon glyphicon-triangle-top" aria-hidden="true" /></button>
      <div className="vote-score">{score}</div>
      <button
        className={classNames(buttonClasses, { active: vote.vote_value === -1 })}
        onClick={() => submitVote('DOWN')}
      ><span className="glyphicon glyphicon-triangle-bottom" aria-hidden="true" /></button>
      &nbsp;
    </span>
  );
}

VoteButtons.propTypes = {
  canVote: React.PropTypes.bool,
  score: React.PropTypes.number,
  onVote: React.PropTypes.func,
  vote: React.PropTypes.shape({
    vote_value: React.PropTypes.number.isRequired,
  }).isRequired,
};

VoteButtons.fragment = createFragment(gql`
  fragment voteInfo on Entry{
    score
    vote {
      vote_value
    }
  }
`);
