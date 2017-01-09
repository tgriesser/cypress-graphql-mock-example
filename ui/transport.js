import { PersistedQueryNetworkInterface } from 'extractgql/lib/browser';
import queryMap from '../extracted_queries.json';
import config from './config';

// Returns either a standard, fetch-full-query network interface or a
// persisted query network interface (from `extractgql`) depending on
// the configuration within `./config.js.`
export default function getNetworkInterface(apiUrl = '/graphql', headers = {}) {
  return new PersistedQueryNetworkInterface({
    queryMap,
    uri: apiUrl,
    opts: {
      credentials: 'same-origin',
      headers,
    },
    production: config.persistedQueries,
  });
}
