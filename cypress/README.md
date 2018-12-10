### End-to-end tests with Cypress using a mocked GraphQL schema

This guide will cover how to build a Cypress end-to-end test suite for a GraphQL application, without needing to run a live server. GraphQL is a powerful way to structure a data-layer, because it provides a strong contract for the data it provides.

We'll be using the following tools / approaches:

- [cypress.io](https://www.cypress.io)
- [apollo-cli](https://github.com/apollographql/apollo-cli)
- [graphql-tools](https://github.com/apollographql/graphql-tools)

In order to mock the schema, we need to get the schema for the server we're testing:

```
yarn run apollo schema:download --endpoint=http://127.0.0.1:3000/graphql
```

This will download the schema to `schema.json` in the directory root. We'll used this schema file to create a mock graphql server will be used to mock graphql requests.

We'll then install / initialize cypress in the project root:

```
yarn add cypress
yarn cypress open
```
