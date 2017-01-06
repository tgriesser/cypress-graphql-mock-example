import { PersistedQueryNetworkInterface } from 'extractgql/lib/browser';
import { createNetworkInterface } from 'apollo-client';
import queryMap from '../extracted_queries.json';
import config from './config';

// Returns either a standard, fetch-full-query network interface or a
// persisted query network interface (from `extractgql`) depending on
// the configuration within `./config.js.`
export default function getNetworkInterface(apiUrl = '/graphql') {
  const persistedQueryNI = new PersistedQueryNetworkInterface({
    queryMap,
    uri: apiUrl,
    opts: {
      credentials: 'same-origin',
    },
  });

  const standardNetworkInterface = createNetworkInterface({
    uri: apiUrl,
    opts: {
      credentials: 'same-origin',
    },
    transportBatching: true,
  });
  
  return (config.persistedQueries ? persistedQueryNI : standardNetworkInterface);
}
