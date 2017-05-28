import { PersistedQueryNetworkInterface, addPersistedQueries } from 'persistgraphql';
import { SubscriptionClient, addGraphQLSubscriptions } from 'subscriptions-transport-ws';
import queryMap from '../extracted_queries.json';
import config from './config';

function createBaseWSTransport() {
  const wsGqlURL = process.env.NODE_ENV !== 'production'
    ? 'ws://localhost:3010/subscriptions'
    : 'wss://api.githunt.com/subscriptions';

  return new SubscriptionClient(wsGqlURL, {
    reconnect: true,
  });
}

function createFullNetworkInterface(baseWsTransport) {
  if (config.persistedQueries) {
    return addPersistedQueries(baseWsTransport, queryMap);
  }

  return baseWsTransport;
}

// Returns either a standard, fetch-full-query network interface or a
// persisted query network interface (from `extractgql`) depending on
// the configuration within `./config.js.`
export function getPersistedQueryNetworkInterface(host = '', headers = {}) {
  return new PersistedQueryNetworkInterface({
    queryMap,
    uri: `${host}/graphql`,
    opts: {
      credentials: 'same-origin',
      headers,
    },
    enablePersistedQueries: config.persistedQueries,
  });
}

function createHybridNetworkInterface(baseWsTransport = {}, host = '', headers = {}) {
  return addGraphQLSubscriptions(
    getPersistedQueryNetworkInterface(host, headers),
    baseWsTransport,
  );
}

export function getHybridOrFullNetworkInterface(host = '', headers = {}) {
  const isHybridWSTransportType = config.wsTransportType !== 'full';
  const baseWsTransport = createBaseWSTransport();

  return isHybridWSTransportType
      ? createHybridNetworkInterface(baseWsTransport, host, headers)
      : createFullNetworkInterface(baseWsTransport);
}
