import React from 'react';
import { connect } from 'react-apollo';
import TimeAgo from 'react-timeago';
import RepoInfo from './RepoInfo';
import gql from 'graphql-tag';

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
    this.setState({ noCommentContent: false });
    event.preventDefault();
    const repositoryName = this.props.data.entry.repository.full_name;
    const repoId = this.props.data.entry.id;
    const { currentUser } = this.props.data;
    const commentContent = event.target.newCommentContent.value;
    if (!commentContent) {
      this.setState({ noCommentContent: true });
    } else {
      this.props.mutations.submitComment(
        repositoryName,
        repoId,
        commentContent,
        currentUser,
      ).then((res) => {
        if (! res.errors) {
          document.getElementById('newComment').value = '';
        }
      });
    }
  }
  render() {
    const { data } = this.props;
    if (data.loading) {
      return (
        <div>Loading...</div>
      );
    }
    const repo = data.entry.repository;
    const { submitComment } = this.props.mutations;
    return (
      <div>
        <div>
          <h1>Comments for <a href={repo.html_url}>{repo.full_name}</a></h1>
          <RepoInfo
            description={repo.description}
            stargazers_count={repo.stargazers_count}
            open_issues_count={repo.open_issues_count}
            created_at={data.entry.createdAt}
            user_url={data.entry.postedBy.html_url}
            username={data.entry.postedBy.login}
          />
          {data.currentUser && <form onSubmit={this.submitForm}>
            <div className="form-group">

              <input
                type="text"
                className="form-control"
                id="newComment"
                name="newCommentContent"
                placeholder="Write your comment here!"
              />
            </div>

            {submitComment.errors && (
              <div className="alert alert-danger" role="alert">
                {submitComment.errors[0].message}
              </div>
            )}
            {this.state.noCommentContent && (
              <div className="alert alert-danger" role="alert">
                Comment must have content.
              </div>
            )}
            <button type="submit" className="btn btn-primary">
              Submit
            </button>
          </form>}
          {!data.currentUser && <div><em>Log in to comment.</em></div>}
        </div>
        <br />
        <div>
          <div> {
            data.entry.comments.map((comment) => (
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
  data: React.PropTypes.shape({
    loading: React.PropTypes.bool.isRequired,
    errors: React.PropTypes.array,
    refetch: React.PropTypes.func,
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
  }),
  mutations: React.PropTypes.object,
};

const CommentWithData = connect({
  mapQueriesToProps: ({ ownProps }) => ({
    data: {
      query: gql`
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
      `,
      variables: {
        repoName: `${ownProps.params.org}/${ownProps.params.repoName}`,
      },
    },
  }),
  mapMutationsToProps: () => ({
    submitComment: (repoFullName, repoId, commentContent, currentUser) => ({
      mutation: gql`
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
      `,
      variables: {
        repoFullName,
        commentContent,
      },
      optimisticResponse: {
        __typename: 'Mutation',
        submitComment: {
          __typename: 'Comment',
          postedBy: currentUser,
          createdAt: +new Date,
          content: commentContent,
        },
      },
      resultBehaviors: [
        {
          type: 'ARRAY_INSERT',
          resultPath: ['submitComment'],
          storePath: [`Entry ${repoId}`, 'comments'],
          where: 'PREPEND',
        },
      ],
    }),
  }),
})(CommentsPage);

export default CommentWithData;

