import React from 'react';
import { connect } from 'react-apollo';

const NewEntry = () => (
  <div>
    <h1>Submit a repository</h1>

    <form>
      <div className="form-group">
        <label for="exampleInputEmail1">
          Repository name
        </label>

        <input
          type="text"
          className="form-control"
          id="exampleInputEmail1"
          placeholder="apollostack/GitHunt"
        />
      </div>

      <button type="submit" className="btn btn-primary">
        Submit
      </button>
    </form>
  </div>
);

const NewEntryWithData = connect({
})(NewEntry);

export default NewEntryWithData;
