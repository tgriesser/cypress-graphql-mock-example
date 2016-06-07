import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { apolloServer } from 'apollo-server';
import { Strategy as GitHubStrategy } from 'passport-github';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import knex from './sql/connector';

const KnexSessionStore = require('connect-session-knex')(session);
const store = new KnexSessionStore({
  knex,
});

import { schema, resolvers } from './schema';
import { GitHubConnector } from './github/connector';
import { Repositories, Users } from './github/models';
import { Entries } from './sql/models';

dotenv.config({ silent: true });
let PORT = 3010;

if (process.env.PORT) {
  PORT = parseInt(process.env.PORT, 10) + 100;
}

const {
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
} = process.env;

const app = express();

app.use(session({
  secret: 'your secret',
  resave: true,
  saveUninitialized: true,
  store,
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/login/github',
  passport.authenticate('github'));

app.get('/login/github/callback',
  passport.authenticate('github', { failureRedirect: '/' }),
  (req, res) => res.redirect('/'));

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

app.use('/graphql', apolloServer((req) => {
  // Get the query, the same way express-graphql does it
  // https://github.com/graphql/express-graphql/blob/3fa6e68582d6d933d37fa9e841da5d2aa39261cd/src/index.js#L257
  const query = req.query.query || req.body.query;
  if (query && query.length > 2000) {
    // None of our app's queries are this long
    // Probably indicates someone trying to send an overly expensive query
    throw new Error('Query too large.');
  }

  let user;
  if (req.user) {
    // We get req.user from passport-github with some pretty oddly named fields,
    // let's convert that to the fields in our schema, which match the GitHub
    // API field names.
    user = {
      login: req.user.username,
      html_url: req.user.profileUrl,
      avatar_url: req.user.photos[0].value,
    };
  }

  const gitHubConnector = new GitHubConnector({
    client_id: GITHUB_CLIENT_ID,
    client_secret: GITHUB_CLIENT_SECRET,
  });

  return {
    graphiql: true,
    pretty: true,
    resolvers,
    schema,
    context: {
      user,
      Repositories: new Repositories({ connector: gitHubConnector }),
      Users: new Users({ connector: gitHubConnector }),
      Entries: new Entries(),
    },
  };
}));

app.listen(PORT, () => console.log(
  `Server is now running on http://localhost:${PORT}`
));

const gitHubStrategyOptions = {
  clientID: GITHUB_CLIENT_ID,
  clientSecret: GITHUB_CLIENT_SECRET,
  callbackURL: 'http://localhost:3000/login/github/callback',
};

passport.use(new GitHubStrategy(gitHubStrategyOptions, (accessToken, refreshToken, profile, cb) => {
  cb(null, profile);
}));

passport.serializeUser((user, cb) => cb(null, user));
passport.deserializeUser((obj, cb) => cb(null, obj));
