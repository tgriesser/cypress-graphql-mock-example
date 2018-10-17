/// <reference types="cypress" />
import { graphql } from 'graphql';
import introspectionSchema from '../../schema.json';
import { buildClientSchema, printSchema } from 'graphql';
import {
  makeExecutableSchema,
  addMockFunctionsToSchema,
  IMocks,
} from 'graphql-tools';

interface MockGraphQLOptions<AllOperations extends Record<string, any>> {
  schema: object | string | string[];
  mocks?: IMocks;
  endpoint?: string;
  operations?: Partial<AllOperations>;
}

interface GQLRequestPayload<AllOperations extends Record<string, any>> {
  operationName: Extract<keyof AllOperations, string>;
  query: string;
  variables: any;
}

declare global {
  namespace Cypress {
    interface Chainable {
      mockGraphql<AllOperations = any>(
        options?: MockGraphQLOptions<AllOperations>
      ): Cypress.Chainable;
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
 *   schema: ...,
 *   operations: {
 *     UserQuery: {
 *       viewer: null
 *     }
 *   }
 * }
 */
Cypress.Commands.add(
  'mockGraphql',
  <AllOperations extends Record<string, any>>(
    options: MockGraphQLOptions<AllOperations>
  ) => {
    const endpoint = options.endpoint || '/graphql';
    const operations = options.operations || {};
    const schema = makeExecutableSchema({
      typeDefs: schemaAsSDL(options.schema),
    });
    addMockFunctionsToSchema({
      schema,
      mocks: options.mocks || {},
    });
    cy.on('window:before:load', win => {
      const originalFetch = win.fetch;
      function fetch(input: RequestInfo, init?: RequestInit) {
        if (typeof input !== 'string') {
          throw new Error(
            'Currently only support fetch(url, options), saw fetch(Request)'
          );
        }
        if (input.includes(endpoint) && init && init.method === 'POST') {
          const payload: GQLRequestPayload<AllOperations> = JSON.parse(
            init.body as string
          );
          const { operationName, query, variables } = payload;
          return graphql({
            schema,
            source: query,
            variableValues: variables,
            operationName,
            rootValue: getRootValue<AllOperations>(
              operations,
              operationName,
              variables
            ),
          }).then((data: any) => new Response(JSON.stringify(data)));
        }
        return originalFetch(input, init);
      }
      cy.stub(win, 'fetch', fetch).as('graphqlStub');
    });
  }
);

// Takes the schema either as the full .graphql file (string) or
// the introspection object.
function schemaAsSDL(schema: string | string[] | object) {
  if (typeof schema === 'string' || Array.isArray(schema)) {
    return schema;
  }
  return printSchema(buildClientSchema(introspectionSchema as any));
}

function getRootValue<AllOperations>(
  operations: Partial<AllOperations>,
  operationName: Extract<keyof AllOperations, string>,
  variables: any
) {
  if (!operationName || !operations[operationName]) {
    return {};
  }
  const op = operations[operationName];
  if (typeof op === 'function') {
    return op(variables);
  }
  return op;
}
