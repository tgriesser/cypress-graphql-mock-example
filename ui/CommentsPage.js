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

var CommentsPage = React.createClass ({
  propTypes: {
    data: React.PropTypes.shape({
      loading: React.PropTypes.bool.isRequired,
      errors: React.PropTypes.array,
      refetch: React.PropTypes.func,
      currentUser: React.PropTypes.shape({
        login: React.PropTypes.string
      }),
      entry: React.PropTypes.shape({
        comments: React.PropTypes.arrayOf(
          React.PropTypes.shape({


            postedBy: React.PropTypes.shape({
              login: React.PropTypes.string.isRequired
            }),
            createdAt: React.PropTypes.number,
            content: React.PropTypes.string.isRequired
          })
        )
      })
    })
  },
  getDefaultProps: function() {
    return {
      comments: []
    };
  },
  _submitForm: function(event){
    event.preventDefault();
    const repositoryName = this.props.params.org+"/"+this.props.params.repoName;
    const commentContent = event.target.newCommentContent.value;
    this.props.mutations.submitComment(repositoryName, commentContent).then((res) => {
      if (! res.errors) {
        document.getElementById('newComment').value='';
        this.props.data.refetch();
      }
    });
  },
  render: function(){
    const {data} = this.props;
    if (data.loading){
      return (
        <div>Loading...</div>
      );
    }
    const repo = data.entry.repository;
    const {submitComment} = this.props;
    return (
      <div>
        <div>
          <h1>Comments for <a href={repo.html_url}>{repo.full_name}</a></h1>
          {data.currentUser && <form onSubmit={this._submitForm}>
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
            <button type="submit" className="btn btn-primary">
              Submit
            </button>
          </form>}
          {!data.currentUser && <div><em>Log in to comment.</em></div>}
        </div>
        <br/>
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
});
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

