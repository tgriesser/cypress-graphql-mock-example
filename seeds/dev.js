
exports.seed = function(knex, Promise) {
  return knex('entries').del().then(() => {
    return Promise.all([
      'apollostack/apollo-client',
      'apollostack/apollo-server',
      'meteor/meteor',
    ].map(function (repoName, i) {
      return knex('entries').insert({
        created_at: Date.now() + i * 10000,
        updated_at: Date.now() + i * 10000,
        repository_name: repoName,
        posted_by: 1,
      });
    }))
  });
};
