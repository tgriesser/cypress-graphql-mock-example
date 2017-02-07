import 'isomorphic-fetch';

import Express from 'express';
import React from 'react';
import ReactDOM from 'react-dom/server';
import { ApolloProvider, renderToStringWithData } from 'react-apollo';
import { match, RouterContext } from 'react-router';
import path from 'path';
import proxy from 'http-proxy-middleware';
import send from 'send';

import routes from './routes';
import Html from './routes/Html';
import createApolloClient from './helpers/create-apollo-client';
import getNetworkInterface from './transport';

console.log(process.env)

let PORT = 3000;
if (process.env.PORT) {
  PORT = parseInt(process.env.PORT, 10);
}

const API_HOST = process.env.NODE_ENV !== 'production' ? 'http://localhost:3010' : 'http://api.githunt.com';

const app = new Express();

const apiProxy = proxy({ target: API_HOST, changeOrigin: true });
app.use('/graphql', apiProxy);
app.use('/graphiql', apiProxy);
app.use('/login', apiProxy);
app.use('/logout', apiProxy);

// In production we want to serve our JavaScripts from a file on the file
// system.
if (process.env.NODE_ENV === 'production') {
  app.use('/static', Express.static(path.join(process.cwd(), 'build/client')));
}
// Otherwise we want to proxy the webpack development server.
else {
  app.use('/static', proxy({ target: 'http://localhost:3020', pathRewrite: { '^/static' : '' } }));
}

app.use((req, res) => {
  match({ routes, location: req.originalUrl }, (error, redirectLocation, renderProps) => {
    if (redirectLocation) {
      res.redirect(redirectLocation.pathname + redirectLocation.search);
    } else if (error) {
      console.error('ROUTER ERROR:', error); // eslint-disable-line no-console
      res.status(500);
    } else if (renderProps) {
      const client = createApolloClient({
        ssrMode: true,
        networkInterface: getNetworkInterface(API_HOST),
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
      }).catch(e => {
        console.error('RENDERING ERROR:', e); // eslint-disable-line no-console
        res.status(500);
        res.end(`An error occurred. Please submit an issue to [https://github.com/apollographql/GitHunt-React] with the following stack trace:\n\n${e.stack}`);
      });
    } else {
      res.status(404).send('Not found');
    }
  });
});

app.listen(PORT, () => console.log( // eslint-disable-line no-console
  `App Server is now running on http://localhost:${PORT}`
));
