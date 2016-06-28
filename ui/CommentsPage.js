import React from 'react';
import { connect } from 'react-apollo';
import { browserHistory } from 'react-router';

var CommentsPage = React.createClass ({
  propTypes: {
    data: React.PropTypes.shape({
      currentUser: React.PropTypes.shape({
        login: React.PropTypes.string
      }),
      entry: React.PropTypes.shape({
        comments: React.PropTypes.arrayOf(
          React.PropTypes.shape({


            postedBy: React.PropTypes.shape({
              login: React.PropTypes.string
            }),
            createdAt: React.PropTypes.number,
            content: React.PropTypes.string
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
        browserHistory.push('/' +this.props.params.org+"/"+this.props.params.repoName);
      }
    });
  },
  render: function(){
    const {data} = this.props;
    console.log(data);
    return (
      <div>
      <h1>Comments for {this.props.params.org}/{this.props.params.repoName}</h1>
        <form onSubmit={this._submitForm}>
          <div className="form-group">
            <label htmlFor="newComment">
              Comment

            </label>

            <input
              type="text"
              className="form-control"
              id="newComment"
              name="newCommentContent"
              placeholder="Write your comment here!"
            />
          </div>

          {this.props.submitComment.errors && (
            <div className="alert alert-danger" role="alert">
              {this.props.submitComment.errors[0].message}
            </div>
          )}


          <button type="submit" className="btn btn-primary">
            Submit
          </button>
        </form>
        <div>
        Past comments
        </div>

      </div>
    );
  }
});

const NewCommentWithData = connect({
  mapQueriesToProps: ({ ownProps }) => ({
    data: {
      query: gql`
        query Comment($repoName: String!) {
          # Eventually move this into a no fetch query right on the entry
          # since we literally just need this info to determine whether to
          # show upvote/downvote buttons
          currentUser {
            login
          }
          entry(repoFullName: $repoName) {
            comments {
              postedBy {
                login
              }
              createdAt
              content
            }
          }
        }
      `,
      variables: {
        repoName: ownProps.params.org+"/"+ownProps.params.repoName,
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
        commentContent
      },
    }),
  }),
})(CommentsPage);

export default NewCommentWithData;

