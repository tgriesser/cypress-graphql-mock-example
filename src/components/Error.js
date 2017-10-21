import React, { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = {
    hasError: false,
  };

  componentDidCatch(err, info) {
    this.setState(() => ({ hasError: true }));
    console.log(`Error: ${err}, ${info}`);
  }

  render() {
    return this.state.hasError ? (
      <p>
        Something went wront :( please report any console errors to:
        https://github.com/apollographql/GitHunt-React/issues
      </p>
    ) : (
      this.props.children
    );
  }
}
