/// <reference types="cypress" />
import { GraphQLRequest, ExecutionResult } from 'apollo-link';
import { graphql } from 'graphql';
import { schema } from '../src/mock-schema';

interface MockGraphQLOptions {
  endpoint?: string;
  operations?: Record<string, any>;
}

declare global {
  namespace Cypress {
    interface Chainable {
      mockGraphql(options?: MockGraphQLOptions): any;
    }
  }
}

/**
 * Adds a .mockGraphql() method to the cypress chain. It should be
 * called before the GraphQL operations are executed and takes an optional "options"
 * config which helps configure the test conditions.
 *
 * By default, it will use the /graphql endpoint, but this can be changed
 * depending on the server implementation
 *
 * It takes an "operations" object, representing the named operations
 * of the GraphQL server. This is combined with the mocked graphql
 * server resolvers, to modify the output behavior per test.
 *
 * For example, if we has a query called "UserQuery" and wanted to
 * explicitly force a state where a viewer is null (logged out), it would
 * look something like:
 *
 * {
 *   operations: {
 *     UserQuery: {
 *       viewer: null
 *     }
 *   }
 * }
 *
 */
Cypress.Commands.add(
  'mockGraphql',
  (options: MockGraphQLOptions = { endpoint: '/graphql' }) => {
    const endpoint = options.endpoint || '/graphql';
    const operations = options.operations || {};
    cy.on('window:before:load', win => {
      const originalFetch = win.fetch;
      function fetch(input: RequestInfo, init?: RequestInit) {
        if (typeof input !== 'string') {
          throw new Error(
            'Currently only support fetch(url, options), saw fetch(Request)'
          );
        }
        if (input.includes(endpoint) && init && init.method === 'POST') {
          const { operationName, query, variables } = JSON.parse(
            init.body as string
          ) as GraphQLRequest;
          return graphql({
            schema,
            source: query as any,
            variableValues: variables,
            operationName,
            rootValue: getRootValue(operations, operationName),
          }).then(
            (data: ExecutionResult) => new Response(JSON.stringify(data))
          );
        }
        return originalFetch(input, init);
      }
      cy.stub(win, 'fetch', fetch).as('graphqlStub');
    });
  }
);

function getRootValue(operations: Record<string, any>, operationName?: string) {
  if (!operationName || !operations[operationName]) {
    return {};
  }
  return operations[operationName];
}
