import { PersistedQueryNetworkInterface } from 'persistgraphql/lib/src/network_interface/ApolloNetworkInterface';
import queryMap from '../extracted_queries.json';
import config from './config';

// Returns either a standard, fetch-full-query network interface or a
// persisted query network interface (from `extractgql`) depending on
// the configuration within `./config.js.`
export default function getNetworkInterface(host = '', headers = {}) {
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
