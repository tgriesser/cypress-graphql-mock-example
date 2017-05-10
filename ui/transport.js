import { PersistedQueryNetworkInterface, addPersistedQueries } from 'persistgraphql';
import { addGraphQLSubscriptions  } from 'subscriptions-transport-ws';
import queryMap from '../extracted_queries.json';
import config from './config';

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

export function getHybridOrFullNetworkInterface(baseWsTransport, host = '', headers = {}) {
  const isHybridWSTransportType = config.wsTransportType !== 'full';

  return isHybridWSTransportType
      ? createHybridNetworkInterface(baseWsTransport, host, headers)
      : createFullNetworkInterface(baseWsTransport);
}
