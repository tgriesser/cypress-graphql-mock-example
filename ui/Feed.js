import React from 'react';
import { connect } from 'react-apollo';

const Loading = () => (
  <div>Loading...</div>
);

const FeedContent = ({ entries }) => (
  <div> {
    entries.map((entry) => (
      <div className="media">
        <div className="media-body">
          <h4 className="media-heading">{ entry.repository.full_name}</h4>
          { entry.repository.description }
        </div>
      </div>
    ))
  } </div>
);

const Feed = ({ data }) => {
  if (data.loading) {
    return <Loading />
  } else {
    return <FeedContent entries={data.feed} />
  }
}

const FeedWithData = connect({
  mapQueriesToProps: () => ({
    data: {
      query: gql`
        query Feed($type: FeedType!) {
          feed(type: $type) {
            createdAt
            score
            commentCount
            repository {
              name
              full_name
              description
              html_url
              stargazers_count
              open_issues_count
              created_at
            }
          }
        }
      `,
      variables: {
        type: 'TOP',
      },
    },
  })
})(Feed);

export default FeedWithData;
