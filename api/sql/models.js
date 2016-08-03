import knex from './connector';

function addSelectToEntryQuery(query) {
  query.select('entries.*', knex.raw('SUM(votes.vote_value) as score'))
    .leftJoin('votes', 'entries.id', 'votes.entry_id')
    .groupBy('entries.id');
}

function convertNullColsToZero({ score, ...rest }) {
  return {
    score: score || 0,
    ...rest,
  };
}

function mapNullColsToZero(query) {
  return query.then((rows) => {
    if (rows.map) {
      return rows.map(convertNullColsToZero);
    }
    return convertNullColsToZero(rows);
  });
}

export class Comments {
  getCommentById(id) {
    const query = knex('comments')
      .where({ id });
    return query.then(([row]) => row);
  }
  getCommentsByRepoName(name) {
    const query = knex('comments')
      .where({ repository_name: name })
      .orderBy('created_at', 'desc');
    return query.then((rows) => (
      rows || []
    ));
  }
  getCommentCount(name) {
    const query = knex('comments')
      .where({ repository_name: name })
      .count();
    return query.then((rows) => (
      rows.map((row) => (
        row['count(*)'] || '0'
      ))
    ));
  }
  submitComment(repoFullName, username, content) {
    return knex.transaction((trx) => (
      trx('comments')
        .insert({
          content,
          created_at: Date.now(),
          repository_name: repoFullName,
          posted_by: username,
        })
    ));
  }
}
export class Entries {

  getForFeed(type, offset, limit) {
    const query = knex('entries')
      .modify(addSelectToEntryQuery);

    if (type === 'NEW') {
      query.orderBy('created_at', 'desc');
    } else if (type === 'TOP') {
      query.orderBy('score', 'desc');
    } else {
      throw new Error(`Feed type ${type} not implemented.`);
    }

    if (offset > 0) {
      query.offset(offset);
    }

    query.limit(limit);

    return mapNullColsToZero(query);
  }

  getByRepoFullName(name) {
    // No need to batch
    const query = knex('entries')
      .modify(addSelectToEntryQuery)
      .where({
        repository_name: name,
      })
      .first();

    return mapNullColsToZero(query);
  }

  voteForEntry(repoFullName, voteValue, username) {
    let entry_id;

    return Promise.resolve()

      // First, get the entry_id from repoFullName
      .then(() => (
        knex('entries')
          .where({
            repository_name: repoFullName,
          })
          .select(['id'])
          .first()
          .then(({ id }) => {
            entry_id = id;
          })
      ))
      // Remove any previous votes by this person
      .then(() => (
        knex('votes')
          .where({
            entry_id,
            username,
          })
          .delete()
      ))
      // Then, insert a vote
      .then(() => (
        knex('votes')
          .insert({
            entry_id,
            username,
            vote_value: voteValue,
          })
      ));
  }

  haveVotedForEntry(repoFullName, username) {
    let entry_id;

    return Promise.resolve()

      // First, get the entry_id from repoFullName
      .then(() => (
        knex('entries')
          .where({
            repository_name: repoFullName,
          })
          .select(['id'])
          .first()
          .then(({ id }) => {
            entry_id = id;
          })
      ))

      .then(() => (
        knex('votes')
          .where({
            entry_id,
            username,
          })
          .select(['id', 'vote_value'])
          .first()
      ))

      .then((vote) => vote || { vote_value: 0 });
  }

  submitRepository(repoFullName, username) {
    const rateLimitMs = 60 * 60 * 1000;
    const rateLimitThresh = 3;

    // Rate limiting logic
    return knex.transaction((trx) => (
      trx('entries')
        .count()
        .where('posted_by', '=', username)
        .where('created_at', '>', Date.now() - rateLimitMs)
        .then((obj) => {
          // If the user has already submitted too many times, we don't
          // post the repo.
          const postCount = obj[0]['count(*)'];
          if (postCount > rateLimitThresh) {
            throw new Error('Too many repos submitted in the last hour!');
          } else {
            return trx('entries')
              .insert({
                created_at: Date.now(),
                updated_at: Date.now(),
                repository_name: repoFullName,
                posted_by: username,
              });
          }
        })
    ));
  }
}
