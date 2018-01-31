import React from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router';

import SUBMIT_REPOSITORY_MUTATION from '../graphql/SubmitRepository.graphql';

class NewEntryPage extends React.Component {
  constructor() {
    super();
    this.state = {
      formNotValid: false,
    };

    this.submitForm = this.submitForm.bind(this);
  }

  validateForm = repo => {
    return /^[\w\/-]+$/.test(repo);
  };

  submitForm(event) {
    event.preventDefault();

    const { submit } = this.props;

    const repoFullName = event.target.repoFullName.value;

    return this.validateForm(repoFullName)
      ? submit(repoFullName)
          .then(res => {
            if (!res.errors) {
              this.props.history.push('/feed/new');
            } else {
              this.setState({ errors: res.errors });
            }
          })
          .catch(err => {
            this.setState({ errors: err.graphQLErrors });
          })
      : this.setState(() => ({ formNotValid: true }));
  }

  render() {
    const { errors, formNotValid } = this.state;
    return (
      <div>
        <h1>Submit a repository</h1>

        <form onSubmit={this.submitForm}>
          <div className="form-group">
            <label htmlFor="exampleInputEmail1">
              {!formNotValid
                ? 'Repository name'
                : 'Please submit your repository like this: yourusername/yourrepo'}
            </label>
            <input
              type="text"
              className="form-control"
              id="exampleInputEmail1"
              name="repoFullName"
              placeholder="apollographql/GitHunt-React"
            />
          </div>

          {errors &&
            errors.map((error, index) => (
              <div
                key={`error-${index}`}
                className="alert alert-danger"
                role="alert"
              >
                {error.message}
              </div>
            ))}

          <button type="submit" className="btn btn-primary">
            Submit
          </button>
        </form>
      </div>
    );
  }
}

NewEntryPage.propTypes = {
  submit: PropTypes.func.isRequired,
};

const withData = graphql(SUBMIT_REPOSITORY_MUTATION, {
  props: ({ mutate }) => ({
    submit: repoFullName =>
      mutate({
        variables: { repoFullName },
      }),
  }),
});

export default withRouter(withData(NewEntryPage));
