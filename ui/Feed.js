import React from 'react';
import { connect } from 'react-apollo';

const Feed = ({ data }) => {
  return (
    <pre>{JSON.stringify(data, null, 2)}</pre>
  );
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
