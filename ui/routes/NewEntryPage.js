import React from 'react';
import { graphql } from 'react-apollo';
import { browserHistory } from 'react-router';
import gql from 'graphql-tag';

class NewEntryPage extends React.Component {
  constructor() {
    super();
    this.state = {};

    this.submitForm = this.submitForm.bind(this);
  }

  submitForm(event) {
    event.preventDefault();

    const { submit } = this.props;

    const repoFullName = event.target.repoFullName.value;

    return submit(repoFullName).then((res) => {
      if (!res.errors) {
        browserHistory.push('/feed/new');
      } else {
        this.setState({ errors: res.errors });
      }
    });
  }

  render() {
    const { errors } = this.state;
    return (
      <div>
        <h1>Submit a repository</h1>

        <form onSubmit={this.submitForm}>
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

          {errors && (
            <div className="alert alert-danger" role="alert">
              {errors[0].message}
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

NewEntryPage.propTypes = {
  submit: React.PropTypes.func.isRequired,
};

const SUBMIT_RESPOSITORY_MUTATION = gql`
  mutation submitRepository($repoFullName: String!) {
    submitRepository(repoFullName: $repoFullName) {
      createdAt
    }
  }
`;

const withData = graphql(SUBMIT_RESPOSITORY_MUTATION, {
  props: ({ mutate }) => ({
    submit: repoFullName => mutate({
      variables: { repoFullName },
    }),
  }),
});

export default withData(NewEntryPage);
