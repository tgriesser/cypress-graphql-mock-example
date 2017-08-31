import 'isomorphic-fetch';

import Express from 'express';
import React from 'react';
import ReactDOM from 'react-dom/server';
import { ApolloProvider, renderToStringWithData } from 'react-apollo';
import { StaticRouter } from 'react-router';
import path from 'path';
import proxy from 'http-proxy-middleware';
import Html from './routes/Html';
import createApolloClient from './helpers/create-apollo-client';
import { getPersistedQueryNetworkInterface } from './transport';
import Layout from './routes/Layout';

let PORT = 3000;
if (process.env.PORT) {
  PORT = parseInt(process.env.PORT, 10);
}

const API_HOST = process.env.NODE_ENV !== 'production' ? 'http://localhost:3010' : 'https://api.githunt.com';

const app = new Express();

const apiProxy = proxy({ target: API_HOST, changeOrigin: true });
app.use('/graphql', apiProxy);
app.use('/graphiql', apiProxy);
app.use('/login', apiProxy);
app.use('/logout', apiProxy);

if (process.env.NODE_ENV === 'production') {
  // In production we want to serve our JavaScripts from a file on the file
  // system.
  app.use('/static', Express.static(path.join(process.cwd(), 'build/client')));
} else {
  // Otherwise we want to proxy the webpack development server.
  app.use('/static', proxy({ target: 'http://localhost:3020', pathRewrite: { '^/static': '' } }));
}

app.use((req, res) => {
  const client = createApolloClient({
    ssrMode: true,
    networkInterface: getPersistedQueryNetworkInterface(API_HOST, { cookie: req.header('Cookie') }),
  });

  const context = {};

  const component = (
    <ApolloProvider client={client}>
      <StaticRouter location={req.url} context={context}>
        <Layout />
      </StaticRouter>
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
  }).catch((e) => {
    console.error('RENDERING ERROR:', e); // eslint-disable-line no-console
    res.status(500);
    res.end(`An error occurred. Please submit an issue to [https://github.com/apollographql/GitHunt-React] with the following stack trace:\n\n${e.stack}`);
  });
});

app.listen(PORT, () => console.log( // eslint-disable-line no-console
  `App Server is now running on http://localhost:${PORT}`
));
