import { ApolloLink } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import WSLink from 'apollo-link-ws';
import { onError } from 'apollo-link-error';
import { getMainDefinition } from 'apollo-utilities';

// TODO (PEGGY): change to graphQLErrors when james gives you the ok
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
    /*
    You can use a simple middleware link like this one to set credentials,
    headers, or whatever else you need on the context.
    All links in the chain will have access to the context.
    */
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
  /*
    This link checks if the operation is a subscription.
    If it is, we use our subscription link to retrieve data over WebSockets.
    If it is a query or mutation, we retrieve data over HTTP.
  */
  ApolloLink.split(
    ({ query }) => {
      const { kind, operation } = getMainDefinition(query);
      return kind === 'OperationDefinition' && operation === 'subscription';
    },
    subscriptionLink,
    queryOrMutationLink,
  );
