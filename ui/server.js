import Express from 'express';
import React from 'react';
import ReactDOM from 'react-dom/server';
import { createNetworkInterface } from 'apollo-client';
import { ApolloProvider, renderToStringWithData } from 'react-apollo';
import { match, RouterContext } from 'react-router';
import path from 'path';
import 'isomorphic-fetch';
import proxy from 'http-proxy-middleware';
import { PersistedQueryNetworkInterface } from 'extractgql/lib/browser';

import routes from './routes';
import Html from './routes/Html';
import createApolloClient from './helpers/create-apollo-client';

import queryMap from '../extracted_queries.json';

import config from './config';

const basePort = process.env.PORT || 3000;
const apiHost = `http://localhost:${basePort + 10}`;
const apiUrl = `${apiHost}/graphql`;

const app = new Express();
app.use(Express.static(path.join(process.cwd(), 'static')));

const apiProxy = proxy({ target: apiHost });
app.use('/graphql', apiProxy);
app.use('/graphiql', apiProxy);
app.use('/login', apiProxy);
app.use('/logout', apiProxy);

app.use((req, res) => {
  match({ routes, location: req.originalUrl }, (error, redirectLocation, renderProps) => {
    if (redirectLocation) {
      res.redirect(redirectLocation.pathname + redirectLocation.search);
    } else if (error) {
      console.error('ROUTER ERROR:', error); // eslint-disable-line no-console
      res.status(500);
    } else if (renderProps) {
      const standardNetworkInterface = createNetworkInterface({
        uri: apiUrl,
        opts: {
          credentials: 'same-origin',
          // transfer request headers to networkInterface so that they're
          // accessible to proxy server
          // Addresses this issue: https://github.com/matthew-andrews/isomorphic-fetch/issues/83
          headers: req.headers,
        },
      });

      const persistedQueryNI = new PersistedQueryNetworkInterface({
        queryMap,
        uri: apiUrl,
        opts: {
          credentials: 'same-origin',
          headers: req.headers,
        },
      });

      const networkInterface = config.persistedQueries ? persistedQueryNI : standardNetworkInterface;
      const client = createApolloClient({
        ssrMode: true,
        networkInterface,
      });

      const component = (
        <ApolloProvider client={client}>
          <RouterContext {...renderProps} />
        </ApolloProvider>
      );

      renderToStringWithData(component).then((content) => {
        const data = client.store.getState().apollo.data;
        res.status(200);

        const html = (<Html
          content={content}
          state={{ apollo: { data } }}
        />);
        res.send(`<!doctype html>\n${ReactDOM.renderToStaticMarkup(html)}`);
        res.end();
      }).catch(e => console.error('RENDERING ERROR:', e)); // eslint-disable-line no-console
    } else {
      res.status(404).send('Not found');
    }
  });
});

app.listen(basePort, () => console.log( // eslint-disable-line no-console
  `App Server is now running on http://localhost:${basePort}`
));
