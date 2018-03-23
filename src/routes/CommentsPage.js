import React from 'react';
import PropTypes from 'prop-types';
import { Query, Mutation } from 'react-apollo';
import update from 'immutability-helper';
import { filter } from 'graphql-anywhere';
import { withRouter } from 'react-router';

import RepoInfo from '../components/RepoInfo';
import Comment from '../components/Comment';

import SUBSCRIPTION_QUERY from '../graphql/CommentSubscription.graphql';
import SUBMIT_COMMENT_MUTATION from '../graphql/SubmitComment.graphql';
import COMMENT_QUERY from '../graphql/Comment.graphql';

// helper function checks for duplicate comments, which we receive because we
// get subscription updates for our own comments as well.
// TODO it's pretty inefficient to scan all the comments every time.
// maybe only scan the first 10, or up to a certain timestamp
function isDuplicateComment(newComment, existingComments) {
  return (
    newComment.id !== null &&
    existingComments.some(comment => newComment.id === comment.id)
  );
}

class CommentsPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      errors: false,
      canSubmit: true,
    };
    this.submitForm = this.submitForm.bind(this);

    // keep track of subscription handle to not subscribe twice.
    // we don't need to unsubscribe on unmount, because the subscription
    // gets stopped when the query stops.
    this.subscription = null;
  }

  componentWillReceiveProps(nextProps) {
    // we don't resubscribe on changed props, because it never happens in our app
    if (!this.subscription && !nextProps.loading) {
      this.subscription = this.props.subscribeToMore({
        document: SUBSCRIPTION_QUERY,
        variables: { repoFullName: nextProps.entry.repository.full_name },
        updateQuery: (previousResult, { subscriptionData }) => {
          const newComment = subscriptionData.data.commentAdded;
          // if it's our own mutation, we might get the subscription result
          // after the mutation result.
          if (isDuplicateComment(newComment, previousResult.entry.comments)) {
            return previousResult;
          }
          const newResult = update(previousResult, {
            entry: {
              comments: {
                $unshift: [newComment],
              },
            },
          });
          return newResult;
        },
      });
    }
  }

  submitForm(event) {
    event.preventDefault();
    const { entry, currentUser, submit } = this.props;

    const repoFullName = entry.repository.full_name;
    const commentContent = this.newCommentInput.value;

    if (commentContent) {
      this.setState({ canSubmit: false });

      submit({
        repoFullName,
        commentContent,
        currentUser,
      }).then(res => {
        this.setState({ canSubmit: true });

        if (!res.errors) {
          this.newCommentInput.value = '';
        } else {
          this.setState({ errors: res.errors });
        }
      });
    }
  }

  render() {
    const { loading, currentUser, entry } = this.props;
    const { errors, canSubmit } = this.state;

    if (loading) {
      return <div>Loading...</div>;
    }

    console.log(this.props);
    if (!entry) {
      return <div>error..</div>;
    }

    const repository = entry.repository;

    return (
      <div>
        <div>
          <h1>
            Comments for{' '}
            <a href={repository.html_url}>{repository.full_name}</a>
          </h1>
          <RepoInfo entry={filter(RepoInfo.fragments.entry, entry)} />
          {currentUser ? (
            <form onSubmit={this.submitForm}>
              <div className="form-group">
                <input
                  type="text"
                  className="form-control"
                  ref={input => (this.newCommentInput = input)}
                  placeholder="Write your comment here!"
                />
              </div>

              {errors && (
                <div className="alert alert-danger" role="alert">
                  {errors[0].message}
                </div>
              )}

              <button
                type="submit"
                disabled={!canSubmit}
                className="btn btn-primary"
              >
                Submit
              </button>
            </form>
          ) : (
            <div>
              <em>Log in to comment.</em>
            </div>
          )}
        </div>
        <br />
        <div>
          <div>
            {entry.comments
              .filter(comment => comment && comment.postedBy)
              .map(comment => (
                <Comment
                  key={
                    comment.postedBy.login +
                    comment.createdAt +
                    repository.full_name
                  }
                  username={comment.postedBy.login}
                  content={comment.content}
                  createdAt={comment.createdAt}
                  userUrl={comment.postedBy.html_url}
                />
              ))}
          </div>
        </div>
      </div>
    );
  }
}

CommentsPage.propTypes = {
  loading: PropTypes.bool.isRequired,
  currentUser: PropTypes.shape({
    login: PropTypes.string,
  }),
  entry: PropTypes.shape({
    id: PropTypes.number,
    comments: PropTypes.arrayOf(
      PropTypes.shape({
        postedBy: PropTypes.shape({
          login: PropTypes.string.isRequired,
        }),
        createdAt: PropTypes.number,
        content: PropTypes.string.isRequired,
      })
    ),
    repository: PropTypes.shape({
      full_name: PropTypes.string,
      html_url: PropTypes.string,
    }),
  }),
  submit: PropTypes.func.isRequired,
  subscribeToMore: PropTypes.func,
};

export default withRouter(({ match }) => (
  <Query
    query={COMMENT_QUERY}
    variables={{ repoName: `${match.params.org}/${match.params.repoName}` }}
    ssr={false}
  >
    {({ data: { currentUser, entry } = {}, subscribeToMore, loading }) => (
      <Mutation mutation={SUBMIT_COMMENT_MUTATION}>
        {mutate => (
          <CommentsPage
            currentUser={currentUser}
            loading={loading}
            entry={entry}
            subscribeToMore={subscribeToMore}
            submit={({ repoFullName, commentContent }) =>
              mutate({
                variables: { repoFullName, commentContent },
                optimisticResponse: {
                  __typename: 'Mutation',
                  submitComment: {
                    __typename: 'Comment',
                    id: null,
                    postedBy: currentUser,
                    createdAt: +new Date(),
                    content: commentContent,
                  },
                },
                update: (store, { data: { submitComment } }) => {
                  // Read the data from our cache for this query.
                  const data = store.readQuery({
                    query: COMMENT_QUERY,
                    variables: { repoName: repoFullName },
                  });
                  // Add our comment from the mutation to the beginning.
                  data.entry.comments.unshift(submitComment);
                  // Write our data back to the cache.
                  store.writeQuery({
                    query: COMMENT_QUERY,
                    variables: { repoName: repoFullName },
                    data,
                  });
                },
              })
            }
          />
        )}
      </Mutation>
    )}
  </Query>
));
