import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { apolloServer } from 'apollo-server';
import { Strategy as GitHubStrategy } from 'passport-github';
import cookieParser from 'cookie-parser';
import knex from './sql/connector';

var KnexSessionStore = require('connect-session-knex')(session);
var store = new KnexSessionStore({
  knex,
});

import { schema, resolvers } from './schema';
import { GitHubConnector } from './github/connector';
import { Repositories } from './github/models';
import { Entries } from './sql/models';

const PORT = 3010;
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

app.get('/login/github',
  passport.authenticate('github'));

app.get('/login/github/callback',
  passport.authenticate('github', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/');
  });

app.use('/graphql', apolloServer((req) => {
  console.log(req.user);
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
      Repositories: new Repositories({ connector: gitHubConnector }),
      Entries: new Entries({ connector: gitHubConnector }),
    }
  };
}));

app.listen(PORT, () => console.log(
  `Server is now running on http://localhost:${PORT}`
));

const gitHubStrategyOptions = {
  clientID: GITHUB_CLIENT_ID,
  clientSecret: GITHUB_CLIENT_SECRET,
  callbackURL: "http://localhost:3000/login/github/callback"
};

passport.use(new GitHubStrategy(gitHubStrategyOptions, (accessToken, refreshToken, profile, cb) => {
  cb(null, profile);
}));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});
