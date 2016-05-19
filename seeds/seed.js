const _ = require('lodash');

const repoNames = [
  'apollostack/apollo-client',
  'apollostack/apollo-server',
  'meteor/meteor',
];

const repoIds = {};

const usenames = [
  'stubailo',
  'helfer',
];

const votes = {
  [repoNames[0]]: {
    stubailo: 1,
    helfer: 1,
  },
  [repoNames[1]]: {
    helfer: 1,
  },
  [repoNames[2]]: {

  },
};

export function seed(knex, Promise) {
  return Promise.all([
    knex('entries').del(),
    knex('votes').del(),
  ])

  // Insert some entries for the repositories
  .then(() => {
    return Promise.all(repoNames.map(function (repoName, i) {
      return knex('entries').insert({
        created_at: Date.now() - i * 10000,
        updated_at: Date.now() - i * 10000,
        repository_name: repoName,
        posted_by: 1,
      }).then(([id]) => {
        repoIds[repoName] = id;
      });
    }))
  })

  // Insert some votes so that we can render a sorted feed
  .then(() => {
    return Promise.all(_.toPairs(votes).map(([repoName, voteMap]) => {
      return Promise.all(_.toPairs(voteMap).map(([username, vote_value]) => {
        return knex('votes').insert({
          entry_id: repoIds[repoName],
          vote_value,
          username,
        });
      }));
    }));
  })
};
