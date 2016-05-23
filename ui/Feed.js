import React from 'react';
import { connect } from 'react-apollo';
import TimeAgo from 'react-timeago';

const Loading = () => (
  <div>Loading...</div>
);

const InfoLabel = ({ label, value }) => (
  <span className="label label-info">{ label }: { value }</span>
)

const VoteButtons = ({ onVote }) => {
  return (
    <span>
      <button
        className="btn btn-xs btn-primary"
        onClick={ onVote.bind(null, 'UP') }
      >+</button>

      &nbsp;

      <button
        className="btn btn-xs btn-primary"
        onClick={ onVote.bind(null, 'DOWN') }
      >-</button>
      &nbsp;
    </span>
  )
}

const FeedContent = ({ entries, currentUser, vote }) => (
  <div> {
    entries.map((entry) => (
      <div className="media">
        <div className="media-left">
          <a href="#">
            <img
              className="media-object"
              style={{width: '64px', height: '64px'}}
              src={ entry.repository.owner.avatar_url }
            />
          </a>
        </div>
        <div className="media-body">
          <h4 className="media-heading">{ entry.repository.full_name }</h4>
          <p>{ entry.repository.description }</p>
          <p>
            { currentUser && <VoteButtons onVote={(type) => {
              vote(entry.repository.full_name, type);
            }}/> }
            <InfoLabel label="Score" value={ entry.score } />
            &nbsp;
            <InfoLabel label="Stars" value={ entry.repository.stargazers_count } />
            &nbsp;
            <InfoLabel label="Issues" value={ entry.repository.open_issues_count } />
            &nbsp;&nbsp;&nbsp;
            Submitted <TimeAgo date={ entry.createdAt } />
            &nbsp;by&nbsp;
            <a href={entry.postedBy.html_url}>{ entry.postedBy.login }</a>
          </p>
        </div>
      </div>
    ))
  } </div>
);

const Feed = ({ data, mutations }) => {
  if (data.loading) {
    return <Loading />
  } else {
    return <FeedContent
      entries={ data.feed }
      currentUser={ data.currentUser }
      vote={ (...args) => {
        mutations.vote(...args).then(() => data.refetch());
      } }
    />
  }
}

const FeedWithData = connect({
  mapQueriesToProps: () => ({
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
            postedBy {
              login
              html_url
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
        type: 'TOP',
      },
    },
  }),

  mapMutationsToProps: () => ({
    vote: (repoFullName, type) => ({
      mutation: gql`
        mutation vote($repoFullName: String!, $type: VoteType!) {
          vote(repoFullName: $repoFullName, type: $type) {
            score
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
