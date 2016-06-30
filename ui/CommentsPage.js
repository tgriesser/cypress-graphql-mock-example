import React from 'react';
import { connect } from 'react-apollo';
import TimeAgo from 'react-timeago';

function Comment({ username, userUrl, content, createdAt }) {
  return (
    <div className="comment-box">
      <b>{content}</b> <br/>
      Submitted <TimeAgo date={createdAt} /> by <a href={userUrl}>{username}</a>
    </div>
  );
}

function CommentsPage({ data, mutations }) {
  if (data.loading) {
    return (
      <div>Loading...</div>
    );
  }
  const repoName = data.entry.repository.full_name;
  function submitForm(event) {
    event.preventDefault();
    const repositoryName = data.entry.repository.full_name;
    const commentContent = event.target.newCommentContent.value;
    if (! commentContent) {
      document.getElementById('noCommentContent').className = 'alert alert-danger';
    } else {
      mutations.submitComment(repositoryName, commentContent).then((res) => {
        if (! res.errors) {
          document.getElementById('newComment').value = '';
          data.refetch();
        }
      });
    }
  }

  return (
    <div>
      <div>
        <h1>Comments for <a href={data.entry.repository.html_url}>{repoName}</a></h1>
        {data.currentUser && <form onSubmit={submitForm}>
          <div className="form-group">

            <input
              type="text"
              className="form-control"
              id="newComment"
              name="newCommentContent"
              placeholder="Write your comment here!"
            />
          </div>

          {mutations.submitComment.errors && (
            <div className="alert alert-danger" role="alert">
              {mutations.submitComment.errors[0].message}
            </div>
          )}
          <div className="alert alert-danger hidden" role="alert" id="noCommentContent">
            Comment must have content.
          </div>
          <button type="submit" className="btn btn-primary">
            Submit
          </button>
        </form>}
        {!data.currentUser && <div><em>Log in to comment.</em></div>}
      </div> <br/>
      <div>
        <div> {
          data.entry.comments.map((comment) => (
            <Comment
              key={comment.postedBy.login + comment.content + comment.createdAt + repoName}
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
            }
          }
        }
      `,
      variables: {
        repoName: `${ownProps.params.org}/${ownProps.params.repoName}`,
      },
      forceFetch: true,
    },
  }),
  mapMutationsToProps: () => ({
    submitComment: (repoFullName, commentContent) => ({
      mutation: gql`
        mutation submitComment($repoFullName: String!, $commentContent: String!) {
          submitComment(repoFullName: $repoFullName, commentContent: $commentContent) {
            createdAt
          }
        }
      `,
      variables: {
        repoFullName,
        commentContent,
      },
    }),
  }),
})(CommentsPage);

export default CommentWithData;

