import { ApolloLink } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import WSLink from 'apollo-link-ws';
import { onError } from 'apollo-link-error';

export const errorLink = onError(({ graphqlErrors, networkError }) => {
  if (graphqlErrors) console.log(`[GraphQL errors]: ${graphqlErrors}`);
  if (networkError) console.log(`[Network error]: ${networkError}`);
});

export const subscriptionLink = (config = {}) =>
  new WSLink({
    uri:
      process.env.NODE_ENV !== 'production'
        ? 'ws://localhost:3010/subscriptions'
        : 'wss://api.githunt.com/subscriptions',
    options: { reconnect: true },
    ...config,
  });

export const queryOrMutationLink = (config = {}) =>
  new ApolloLink((operation, forward) => {
    operation.setContext({
      credentials: 'same-origin',
    });

    return forward(operation);
  }).concat(
    new HttpLink({
      ...config,
    }),
  );

export const requestLink = ({ queryOrMutationLink, subscriptionLink }) =>
  ApolloLink.split(
    ({ query: { definitions } }) => {
      return definitions.some(
        ({ kind, operation }) =>
          kind === 'OperationDefinition' && operation === 'subscription',
      );
    },
    subscriptionLink,
    queryOrMutationLink,
  );
