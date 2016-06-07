import React from 'react';
import { connect } from 'react-apollo';
import { browserHistory } from 'react-router';

class NewEntry extends React.Component {
  constructor() {
    super();

    this._submitForm = this._submitForm.bind(this);
  }

  _submitForm(event) {
    event.preventDefault();

    const repositoryName = event.target.repoFullName.value;

    this.props.mutations.submitRepository(repositoryName).then((res) => {
      if (! res.errors) {
        browserHistory.push('/feed/new');
      }
    });
  }

  render() {
    return (
      <div>
        <h1>Submit a repository</h1>

        <form onSubmit={this._submitForm}>
          <div className="form-group">
            <label htmlFor="exampleInputEmail1">
              Repository name
            </label>

            <input
              type="text"
              className="form-control"
              id="exampleInputEmail1"
              name="repoFullName"
              placeholder="apollostack/GitHunt"
            />
          </div>

          {this.props.submitRepository.errors && (
            <div className="alert alert-danger" role="alert">
              {this.props.submitRepository.errors[0].message}
            </div>
          )}


          <button type="submit" className="btn btn-primary">
            Submit
          </button>
        </form>
      </div>
    );
  }
}

const NewEntryWithData = connect({
  mapMutationsToProps: () => ({
    submitRepository: (repoFullName) => ({
      mutation: gql`
        mutation submitRepository($repoFullName: String!) {
          submitRepository(repoFullName: $repoFullName) {
            createdAt
          }
        }
      `,
      variables: {
        repoFullName,
      },
    }),
  }),
})(NewEntry);

export default NewEntryWithData;
