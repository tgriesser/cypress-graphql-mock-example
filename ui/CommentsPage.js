import React from 'react';
import { graphql } from 'react-apollo';
import TimeAgo from 'react-timeago';
import RepoInfo from './RepoInfo';
import gql from 'graphql-tag';
import update from 'react-addons-update';

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
};

const SUBMIT_COMMENT_MUTATION = gql`
  mutation submitComment($repoFullName: String!, $commentContent: String!) {
    submitComment(repoFullName: $repoFullName, commentContent: $commentContent) {
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
              postedBy: ownProps.currentUser,
              createdAt: +new Date,
              content: commentContent,
            },
          },
          updateQueries: {
            Comment: (prev, { mutationResult }) => {
              const newComment = mutationResult.data.submitComment;
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
  props({ data: { loading, currentUser, entry } }) {
    return { loading, currentUser, entry };
  },
})(CommentsPageWithMutations);

export default CommentsPageWithDataAndMutations;
export { COMMENT_QUERY };
