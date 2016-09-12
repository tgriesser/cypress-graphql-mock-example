import React from 'react';
import { graphql, withApollo } from 'react-apollo';
import ApolloClient from 'apollo-client';
import TimeAgo from 'react-timeago';
import RepoInfo from './RepoInfo';
import gql from 'graphql-tag';
import update from 'react-addons-update';

// helper function checks for duplicate comments, which we receive because we
// get subscription updates for our own comments as well.
// TODO it's pretty inefficient to scan all the comments every time.
// maybe only scan the first 10, or up to a certain timestamp
function isDuplicateComment(newComment, existingComments) {
  let duplicateComment = false;
  existingComments.forEach(comment => {
    if (newComment.id !== null && newComment.id === comment.id) {
      duplicateComment = true;
    }
  });
  return duplicateComment;
}


function Comment({ username, userUrl, content, createdAt }) {
  return (
    <div className="comment-box">
      <b>{content}</b>
      <br />
      Submitted <TimeAgo date={createdAt} /> by <a href={userUrl}>{username}</a>
    </div>
  );
}

Comment.propTypes = {
  username: React.PropTypes.string,
  userUrl: React.PropTypes.string,
  content: React.PropTypes.string,
  createdAt: React.PropTypes.number,
};

class CommentsPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = { noCommentContent: false };
    this.submitForm = this.submitForm.bind(this);
    this.subscriptionObserver = null;
    this.subscriptionRepoName = null;
  }

  submitForm(event) {
    const { entry, currentUser, submit } = this.props;

    this.setState({ noCommentContent: false });
    event.preventDefault();
    const repoFullName = entry.repository.full_name;
    const commentContent = event.target.newCommentContent.value;
    if (!commentContent) {
      this.setState({ noCommentContent: true });
    } else {
      submit({
        repoFullName,
        commentContent,
        currentUser,
      }).then((res) => {
        if (! res.errors) {
          document.getElementById('newComment').value = '';
        } else {
          this.setState({ errors: res.errors });
        }
      });
    }
  }

  subscribe(repoName, updateCommentsQuery) {
    const SUBSCRIPTION_QUERY = gql`
      subscription onCommentAdded($repoFullName: String!){
        commentAdded(repoFullName: $repoFullName){
          id
          postedBy {
            login
            html_url
          }
          createdAt
          content
        }
      }
    `;
    this.subscriptionRepoName = repoName;
    this.subscriptionObserver = this.props.client.subscribe({
      query: SUBSCRIPTION_QUERY,
      variables: { repoFullName: repoName },
    }).subscribe({
      next(data) {
        const newComment = data.commentAdded;
        updateCommentsQuery((previousResult) => {
          // if it's our own mutation, we might get the subscription result
          // after the mutation result.
          if (isDuplicateComment(newComment, previousResult.entry.comments)) {
            return previousResult;
          }
          // update returns a new "immutable" list with the new comment
          // added to the front.
          return update(
            previousResult,
            {
              entry: {
                comments: {
                  $unshift: [newComment],
                },
              },
            }
          );
        });
      },
      error(err) { console.error('err', err); },
    });
  }

  componentDidMount() {
    if (this.props.loading === false){
      this.subscribe(this.props.entry.repository.full_name, this.props.updateCommentsQuery);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.subscriptionRepoName !== nextProps.entry.repository.full_name) {
      if (this.subscriptionObserver) {
        this.subscriptionObserver.unsubscribe();
      }
      this.subscribe(nextProps.entry.repository.full_name, nextProps.updateCommentsQuery);
    }
  }

  componentWillUnmount() {
    if (this.subscriptionObserver) {
      this.subscriptionObserver.unsubscribe();
    }
  }

  render() {
    const { loading, currentUser, entry } = this.props;
    const { errors, noCommentContent } = this.state;
    if (loading) {
      return (
        <div>Loading...</div>
      );
    }
    const repo = entry.repository;

    return (
      <div>
        <div>
          <h1>Comments for <a href={repo.html_url}>{repo.full_name}</a></h1>
          <RepoInfo
            description={repo.description}
            stargazers_count={repo.stargazers_count}
            open_issues_count={repo.open_issues_count}
            created_at={entry.createdAt}
            user_url={entry.postedBy.html_url}
            username={entry.postedBy.login}
          />
          {currentUser && <form onSubmit={this.submitForm}>
            <div className="form-group">

              <input
                type="text"
                className="form-control"
                id="newComment"
                name="newCommentContent"
                placeholder="Write your comment here!"
              />
            </div>

            {errors && (
              <div className="alert alert-danger" role="alert">
                {errors[0].message}
              </div>
            )}
            {noCommentContent && (
              <div className="alert alert-danger" role="alert">
                Comment must have content.
              </div>
            )}
            <button type="submit" className="btn btn-primary">
              Submit
            </button>
          </form>}
          {!currentUser && <div><em>Log in to comment.</em></div>}
        </div>
        <br />
        <div>
          <div> {
            entry.comments.map((comment) => (
              <Comment
                key={comment.postedBy.login + comment.content + comment.createdAt + repo.full_name}
                username={comment.postedBy.login}
                content={comment.content}
                createdAt={comment.createdAt}
                userUrl={comment.postedBy.html_url}
              />
            ))
          }</div>

        </div>
      </div>
    );
  }
}

CommentsPage.propTypes = {
  loading: React.PropTypes.bool.isRequired,
  currentUser: React.PropTypes.shape({
    login: React.PropTypes.string,
  }),
  entry: React.PropTypes.shape({
    id: React.PropTypes.number,
    comments: React.PropTypes.arrayOf(
      React.PropTypes.shape({
        postedBy: React.PropTypes.shape({
          login: React.PropTypes.string.isRequired,
        }),
        createdAt: React.PropTypes.number,
        content: React.PropTypes.string.isRequired,
      })
    ),
    repository: React.PropTypes.shape({
      full_name: React.PropTypes.string,
      html_url: React.PropTypes.string,
    }),
  }),
  submit: React.PropTypes.func.isRequired,
  updateCommentsQuery: React.PropTypes.func,
  client: React.PropTypes.instanceOf(ApolloClient).isRequired,
};

const SUBMIT_COMMENT_MUTATION = gql`
  mutation submitComment($repoFullName: String!, $commentContent: String!) {
    submitComment(repoFullName: $repoFullName, commentContent: $commentContent) {
      id
      postedBy {
        login
        html_url
      }
      createdAt
      content
    }
  }
`;

const CommentsPageWithMutations = graphql(SUBMIT_COMMENT_MUTATION, {
  props({ ownProps, mutate }) {
    return {
      submit({ repoFullName, commentContent }) {
        return mutate({
          variables: { repoFullName, commentContent },
          optimisticResponse: {
            __typename: 'Mutation',
            submitComment: {
              __typename: 'Comment',
              id: null,
              postedBy: ownProps.currentUser,
              createdAt: +new Date,
              content: commentContent,
            },
          },
          updateQueries: {
            Comment: (prev, { mutationResult }) => {
              const newComment = mutationResult.data.submitComment;
              if (isDuplicateComment(newComment, prev.entry.comments)) {
                return prev;
              }
              return update(prev, {
                entry: {
                  comments: {
                    $unshift: [newComment],
                  },
                },
              });
            },
          },
        });
      },
    };
  },
})(CommentsPage);


const COMMENT_QUERY = gql`
  query Comment($repoName: String!) {
    # Eventually move this into a no fetch query right on the entry
    # since we literally just need this info to determine whether to
    # show upvote/downvote buttons
    currentUser {
      login
      html_url
    }
    entry(repoFullName: $repoName) {
      id
      postedBy {
        login
        html_url
      }
      createdAt
      comments {
        id
        postedBy {
          login
          html_url
        }
        createdAt
        content
      }
      repository {
        full_name
        html_url
        description
        open_issues_count
        stargazers_count
      }
    }
  }
`;


const CommentsPageWithDataAndMutations = graphql(COMMENT_QUERY, {
  options({ params }) {
    return {
      variables: { repoName: `${params.org}/${params.repoName}` },
    };
  },
  props({ data: { loading, currentUser, entry, updateQuery } }) {
    return { loading, currentUser, entry, updateCommentsQuery: updateQuery };
  },
})(CommentsPageWithMutations);

const CommentsPageWithDataAndMutationsAndApollo = withApollo(CommentsPageWithDataAndMutations);

export default CommentsPageWithDataAndMutationsAndApollo;
export { COMMENT_QUERY };
